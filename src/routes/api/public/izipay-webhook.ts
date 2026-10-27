import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { generateFlowProLicense } from "@/lib/flowpro-api";

export const Route = createFileRoute("/api/public/izipay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const formData = await request.formData();
        const krAnswer = formData.get("kr-answer");
        const krHash = formData.get("kr-hash");
        const krHashAlg = formData.get("kr-hash-algorithm");
        const krHashKey = (formData.get("kr-hash-key") as string) || "hmac-sha-256";

        if (typeof krAnswer !== "string" || typeof krHash !== "string") {
          return new Response("Missing fields", { status: 400 });
        }

        // Seleccionar clave según kr-hash-key (password para client return, hmac para IPN)
        const signingKey =
          krHashKey === "password"
            ? process.env.IZIPAY_PASSWORD
            : process.env.IZIPAY_HMAC_KEY;
        if (!signingKey) {
          return new Response("Signing key missing", { status: 500 });
        }

        const expected = createHmac("sha256", signingKey).update(krAnswer).digest("hex");
        const sig = Buffer.from(krHash);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          console.error("Izipay webhook: HMAC inválido", { krHashAlg, krHashKey });
          return new Response("Invalid signature", { status: 401 });
        }

        let answer: any;
        try {
          answer = JSON.parse(krAnswer);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const orderStatus = answer?.orderStatus;
        const orderId: string | undefined =
          answer?.orderDetails?.orderId ?? answer?.transactions?.[0]?.orderDetails?.orderId;
        const metadata =
          answer?.transactions?.[0]?.metadata ??
          answer?.metadata ??
          answer?.orderDetails?.metadata ??
          {};

        if (!orderId) {
          console.error("Izipay webhook: orderId faltante", {
            answer: JSON.stringify(answer).slice(0, 2000),
          });
          return new Response("Missing orderId", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Recuperar la orden desde la BD (fuente de verdad)
        const { data: order } = await supabaseAdmin
          .from("payment_orders")
          .select("id, status, user_id, plan_id, days")
          .eq("id", orderId)
          .maybeSingle();

        if (!order) {
          return new Response("Order not found", { status: 404 });
        }

        const userId = (metadata.user_id as string) || order.user_id;
        const planId = (metadata.plan_id as string) || order.plan_id;
        const days = Number(metadata.days || order.days || 30);

        if (!userId || !planId || !days) {
          console.error("Izipay webhook: datos incompletos tras fallback", { userId, planId, days });
          return new Response("Missing data", { status: 400 });
        }

        // Idempotencia: si ya está pagada, no procesar de nuevo
        if (order.status === "paid") {
          return new Response("Already processed", { status: 200 });
        }

        if (orderStatus !== "PAID") {
          await supabaseAdmin
            .from("payment_orders")
            .update({ status: "failed", raw_response: answer })
            .eq("id", orderId);
          return new Response("ok", { status: 200 });
        }

        // Pago confirmado → generar licencia usando Flow-Pro API
        try {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("id", userId)
            .maybeSingle();

          // Modo TEST restringido al superadmin
          const isTestMode = (process.env.IZIPAY_PASSWORD || "").startsWith("testpassword_");
          if (isTestMode && prof?.email !== "jorge968122@gmail.com") {
            await supabaseAdmin
              .from("payment_orders")
              .update({ status: "rejected_test_mode", raw_response: answer })
              .eq("id", orderId);
            return new Response("Test mode restricted", { status: 200 });
          }

          const customerName = (prof?.email?.split("@")[0] || "Cliente").slice(0, 60);

          const lic = await generateFlowProLicense({
            type: isTestMode ? "trial" : "paid",
            duration_days: isTestMode ? 1 : days,
            customer_name: isTestMode ? `${customerName} (TEST)` : customerName,
          });

          await supabaseAdmin.from("reseller_licenses").insert({
            user_id: userId,
            license_key: lic.license_key,
            display_name: customerName,
            type: isTestMode ? "trial" : "paid",
            expires_at: lic.expires_at,
            duration_seconds: lic.duration_seconds,
            lifetime: false,
            customer_name: customerName,
          });

          await supabaseAdmin
            .from("payment_orders")
            .update({
              status: "paid",
              license_key: lic.license_key,
              izipay_uuid: answer?.transactions?.[0]?.uuid ?? null,
              raw_response: answer,
            })
            .eq("id", orderId);

          return new Response("ok", { status: 200 });
        } catch (err: any) {
          console.error("Izipay webhook: error generando licencia con Flow-Pro", err);
          await supabaseAdmin
            .from("payment_orders")
            .update({
              status: "paid_no_license",
              raw_response: { ...answer, error: String(err?.message || err) },
            })
            .eq("id", orderId);
          return new Response("License error", { status: 500 });
        }
      },
    },
  },
});
