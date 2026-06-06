import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BASE_URL = "https://ynvrijkuampxpsmshftm.supabase.co/functions/v1/reseller-api";

export const generateTrialForNewUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { displayName?: string }) => input)
  .handler(async ({ data, context }) => {
    const token = process.env.RESELLER_API_KEY;
    if (!token) throw new Error("RESELLER_API_KEY no está configurada");

    const { userId, supabase } = context;

    // Check if user already generated a trial
    const { data: existing } = await supabase
      .from("reseller_licenses")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "trial")
      .limit(1);

    if (existing && existing.length > 0) {
      throw new Error("Ya generaste tu licencia de prueba");
    }

    const displayName = (data.displayName || "Trial").slice(0, 60);

    const res = await fetch(`${BASE_URL}/generate-trial`, {
      method: "POST",
      headers: { "x-api-token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, minutes: 15, seconds: 0 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Error al generar licencia de prueba");

    await supabase.from("reseller_licenses").insert({
      user_id: userId,
      license_key: json.license_key,
      display_name: displayName,
      type: json.type || "trial",
      expires_at: json.expires_at,
      duration_seconds: json.duration_seconds,
      lifetime: false,
    });

    return {
      license_key: json.license_key as string,
      expires_at: json.expires_at as string | null,
    };
  });

export const setUserActivation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetUserId: string; activate: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const role = data.activate ? "reseller" : "user";
    const { data: result, error } = await supabase.rpc("set_user_role", {
      _target: data.targetUserId,
      _role: role,
    });
    if (error) throw new Error(error.message);
    return { role: result as string };
  });

export const assignLicenseToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetUserId: string; days: number; displayName?: string }) => input)
  .handler(async ({ data, context }) => {
    const token = process.env.RESELLER_API_KEY;
    if (!token) throw new Error("RESELLER_API_KEY no está configurada");

    const { supabase, userId } = context;

    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (prof?.role !== "superadmin") throw new Error("Solo el superadmin puede asignar licencias");

    if (![1, 7, 30, 60].includes(data.days)) throw new Error("Duración inválida");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: targetProf } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", data.targetUserId)
      .maybeSingle();
    const displayName = (data.displayName || targetProf?.email?.split("@")[0] || "Usuario").slice(0, 60);

    const res = await fetch("https://ynvrijkuampxpsmshftm.supabase.co/functions/v1/reseller-api/generate-license", {
      method: "POST",
      headers: { "x-api-token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, days: data.days }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Error al generar licencia");

    const { error: insErr } = await supabaseAdmin.from("reseller_licenses").insert({
      user_id: data.targetUserId,
      license_key: json.license_key,
      display_name: displayName,
      type: "assigned",
      expires_at: json.expires_at,
      duration_seconds: json.duration_seconds,
      lifetime: false,
    });
    if (insErr) throw new Error(insErr.message);

    return {
      license_key: json.license_key as string,
      expires_at: json.expires_at as string | null,
      days: data.days,
    };
  });
