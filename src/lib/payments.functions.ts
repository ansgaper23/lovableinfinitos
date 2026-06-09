import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { PLANS, isPlanId } from "@/lib/plans";

const IZIPAY_ENDPOINT = "https://api.micuentaweb.pe";

export const createIzipayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        planId: z.string().refine(isPlanId, "Plan inválido"),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const username = process.env.IZIPAY_USERNAME;
    const password = process.env.IZIPAY_PASSWORD;
    const publicKey = process.env.IZIPAY_PUBLIC_KEY;
    if (!username || !password || !publicKey) {
      throw new Error("Izipay no está configurado correctamente.");
    }

    const plan = PLANS[data.planId as keyof typeof PLANS];
    const { userId, supabase } = context;

    // Obtener email del usuario
    const { data: prof } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const email = prof?.email || `user-${userId}@lovableinfinito.com`;

    // Modo TEST: solo permitido para el superadmin mientras se prueba la integración
    const isTestMode = (process.env.IZIPAY_PASSWORD || "").startsWith("testpassword_");
    if (isTestMode && email !== "jorge968122@gmail.com") {
      throw new Error(
        "Los pagos están en modo de prueba. Solo la cuenta de administrador puede realizar pagos en este momento."
      );
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Crear orden pending
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("payment_orders")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        days: plan.days,
        amount_pen: plan.amountCents,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    const orderId = order.id;

    // Llamar a Izipay CreatePayment
    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const res = await fetch(`${IZIPAY_ENDPOINT}/api-payment/V4/Charge/CreatePayment`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.amountCents,
        currency: "PEN",
        orderId,
        customer: { email },
        metadata: {
          user_id: userId,
          plan_id: plan.id,
          days: String(plan.days),
        },
      }),
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      console.error("Izipay non-JSON response:", res.status, text.slice(0, 500));
      throw new Error(`Izipay devolvió una respuesta inválida (HTTP ${res.status}). Verifica IZIPAY_USERNAME / IZIPAY_PASSWORD.`);
    }
    if (!res.ok || json.status !== "SUCCESS") {
      console.error("Izipay error:", json);
      throw new Error(json?.answer?.errorMessage || "Error al crear pago");
    }

    const formToken = json.answer?.formToken;
    if (!formToken) throw new Error("Izipay no devolvió formToken");

    // Actualizar orden con id de izipay
    await supabaseAdmin
      .from("payment_orders")
      .update({ izipay_order_id: orderId })
      .eq("id", orderId);

    return {
      formToken,
      publicKey,
      orderId,
      plan: {
        id: plan.id,
        name: plan.name,
        pricePen: plan.pricePen,
        days: plan.days,
      },
    };
  });

export const getOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ orderId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order } = await supabase
      .from("payment_orders")
      .select("status, license_key, plan_id, days")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .maybeSingle();
    return order;
  });
