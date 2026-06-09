import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const RESELLER_BASE = "https://ynvrijkuampxpsmshftm.supabase.co/functions/v1/reseller-api";

async function generateLicense(displayName: string, days: number) {
  const token = process.env.RESELLER_API_KEY;
  if (!token) throw new Error("RESELLER_API_KEY no configurada");

  // Modo TEST: si la contraseña de Izipay empieza con "testpassword_",
  // generamos una licencia de PRUEBA (trial, 15 min) en vez de una real.
  const isTestMode = (process.env.IZIPAY_PASSWORD || "").startsWith("testpassword_");

  if (isTestMode) {
    const res = await fetch(`${RESELLER_BASE}/generate-trial`, {
      method: "POST",
      headers: { "x-api-token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: `${displayName} (TEST)`, minutes: 15, seconds: 0 }),
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(json?.message || "Error generando licencia de prueba");
    return { ...json, _isTest: true };
  }

  const res = await fetch(`${RESELLER_BASE}/generate-license`, {
    method: "POST",
    headers: { "x-api-token": token, "Content-Type": "application/json" },
    body: JSON.stringify({ display_name: displayName, days }),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.message || "Error generando licencia");
  return json;
}

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
        const orderId: string | undefined = answer?.orderDetails?.orderId;
        const metadata = answer?.orderDetails?.metadata || {};
        const userId: string | undefined = metadata.user_id;
        const planId: string | undefined = metadata.plan_id;
        const days = Number(metadata.days || 0);

        if (!orderId || !userId || !planId || !days) {
          console.error("Izipay webhook: metadata incompleta", { orderId, userId, planId, days });
          return new Response("Missing metadata", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verificar que la orden existe y pertenece al usuario
        const { data: order } = await supabaseAdmin
          .from("payment_orders")
          .select("id, status")
          .eq("id", orderId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!order) {
          return new Response("Order not found", { status: 404 });
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

        // Pago confirmado → generar licencia
        try {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("id", userId)
            .maybeSingle();
          const displayName = (prof?.email?.split("@")[0] || "Usuario").slice(0, 60);

          const lic = await generateLicense(displayName, days);

          await supabaseAdmin.from("reseller_licenses").insert({
            user_id: userId,
            license_key: lic.license_key,
            display_name: displayName,
            type: lic._isTest ? "trial" : "assigned",
            expires_at: lic.expires_at,
            duration_seconds: lic.duration_seconds,
            lifetime: false,
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
          console.error("Izipay webhook: error generando licencia", err);
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
