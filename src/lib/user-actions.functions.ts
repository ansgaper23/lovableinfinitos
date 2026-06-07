import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const BASE_URL = "https://ynvrijkuampxpsmshftm.supabase.co/functions/v1/reseller-api";

async function assertSuperadmin(supabase: any, userId: string) {
  const { data: prof, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (prof?.role !== "superadmin") {
    throw new Error("Acceso denegado: se requiere superadmin");
  }
}

const displayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[\p{L}\p{N} ._-]+$/u, "Nombre inválido")
  .optional();

export const generateTrialForNewUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ displayName: displayNameSchema }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const token = process.env.RESELLER_API_KEY;
    if (!token) throw new Error("RESELLER_API_KEY no está configurada");

    const { userId, supabase } = context;

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
  .inputValidator((input) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        activate: z.boolean(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

    const role = data.activate ? "reseller" : "user";
    const { data: result, error } = await supabase.rpc("set_user_role", {
      _target: data.targetUserId,
      _role: role,
    });
    if (error) throw new Error(error.message);
    return { role: result as string };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        role: z.enum(["user", "reseller", "blocked"]),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

    const { data: result, error } = await supabase.rpc("set_user_role", {
      _target: data.targetUserId,
      _role: data.role,
    });
    if (error) throw new Error(error.message);
    return { role: result as string };
  });

export const assignLicenseToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        days: z.union([z.literal(1), z.literal(7), z.literal(30), z.literal(60)]),
        displayName: displayNameSchema,
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const token = process.env.RESELLER_API_KEY;
    if (!token) throw new Error("RESELLER_API_KEY no está configurada");

    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

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

export const getAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (profilesError) throw new Error(profilesError.message);

    const { data: creditsData, error: creditsError } = await supabaseAdmin
      .from("user_credits")
      .select("user_id, credits");
    if (creditsError) throw new Error(creditsError.message);

    const creditMap = new Map((creditsData || []).map((c: any) => [c.user_id, c.credits]));
    const merged = (profilesData || []).map((p: any) => ({ ...p, credits: creditMap.get(p.id) ?? 0 }));

    return merged as any[];
  });
