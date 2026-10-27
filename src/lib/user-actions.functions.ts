import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateFlowProLicense } from "@/lib/flowpro-api";

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

    const displayName = (data.displayName || "Trial User").slice(0, 60);

    const lic = await generateFlowProLicense({
      type: "trial",
      duration_days: 1,
      customer_name: displayName,
    });

    await supabase.from("reseller_licenses").insert({
      user_id: userId,
      license_key: lic.license_key,
      display_name: displayName,
      customer_name: displayName,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
      lifetime: false,
    });

    return {
      license_key: lic.license_key as string,
      expires_at: lic.expires_at as string | null,
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
        days: z.number().int().min(1).max(3650).default(30),
        provider: z.enum(["flowpro", "nexxus", "legacy"]).default("flowpro"),
        planType: z.enum(["trial", "days", "lifetime"]).default("days"),
        displayName: displayNameSchema.optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: targetProf } = await supabaseAdmin
      .from("profiles")
      .select("email, phone")
      .eq("id", data.targetUserId)
      .maybeSingle();

    const displayName = (data.displayName || targetProf?.email?.split("@")[0] || "Usuario").slice(0, 60);

    let licenseKey = "";
    let expiresAt: string | null = null;
    let durationSeconds: number | null = null;
    const isLifetime = data.planType === "lifetime";

    if (data.provider === "legacy") {
      // Clave Legacy local
      const randHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      licenseKey = `FLOW-LEGACY-${randHex()}-${randHex()}`;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (isLifetime ? 3650 : data.days));
      expiresAt = expDate.toISOString();
      durationSeconds = (isLifetime ? 3650 : data.days) * 86400;

      // Registrar también en la tabla licenses legacy si existe
      await supabaseAdmin.from("licenses").insert({
        code: licenseKey,
        type: data.planType === "trial" ? "trial" : "paid",
        status: "active",
        created_by: userId,
        used_by: data.targetUserId,
        expires_at: expiresAt,
      });
    } else {
      // Flow-Pro oficial (o nexxus api bridge)
      const isTrial = data.planType === "trial";
      const lic = await generateFlowProLicense({
        type: isTrial ? "trial" : "paid",
        duration_days: isTrial ? 1 : isLifetime ? 3650 : data.days,
        lifetime: isLifetime,
        customer_name: displayName,
      });

      licenseKey = lic.license_key;
      expiresAt = lic.expires_at;
      durationSeconds = lic.duration_seconds ?? ((isTrial ? 1 : isLifetime ? 3650 : data.days) * 86400);
    }

    const { error: insErr } = await supabaseAdmin.from("reseller_licenses").insert({
      user_id: data.targetUserId,
      license_key: licenseKey,
      display_name: displayName,
      customer_name: displayName,
      customer_phone: targetProf?.phone || null,
      type: data.planType === "trial" ? "trial" : "assigned",
      expires_at: expiresAt,
      duration_seconds: durationSeconds,
      lifetime: isLifetime,
    });
    if (insErr) throw new Error(insErr.message);

    return {
      license_key: licenseKey,
      expires_at: expiresAt,
      provider: data.provider,
      days: data.days,
    };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ targetUserId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperadmin(supabase, userId);

    if (data.targetUserId === userId) {
      throw new Error("No puedes eliminar tu propia cuenta");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const targetId = data.targetUserId;

    await supabaseAdmin.from("profiles").delete().eq("id", targetId);
    await supabaseAdmin.from("user_credits").delete().eq("user_id", targetId);
    await supabaseAdmin.from("signup_ips").delete().eq("user_id", targetId);
    await supabaseAdmin.from("reseller_licenses").delete().eq("user_id", targetId);
    await supabaseAdmin.from("licenses").delete().eq("created_by", targetId);
    await supabaseAdmin.from("licenses").update({ used_by: null }).eq("used_by", targetId);
    await supabaseAdmin.from("audit_logs").delete().eq("actor_id", targetId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId);
    if (error) throw new Error(error.message);

    return { success: true };
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

    const { data: licensesData, error: licensesError } = await supabaseAdmin
      .from("reseller_licenses")
      .select("user_id, type, created_at, expires_at")
      .order("created_at", { ascending: false });
    if (licensesError) throw new Error(licensesError.message);

    const { data: ipsData, error: ipsError } = await supabaseAdmin
      .from("signup_ips")
      .select("user_id, ip, created_at")
      .order("created_at", { ascending: false });
    if (ipsError) throw new Error(ipsError.message);

    const ipMap = new Map<string, string>();
    for (const row of ipsData || []) {
      if (row.user_id && !ipMap.has(row.user_id)) {
        ipMap.set(row.user_id, row.ip);
      }
    }

    const creditMap = new Map((creditsData || []).map((c: any) => [c.user_id, c.credits]));

    // Per-user: did they request a trial? did they receive an assigned license? + counts
    const trialMap = new Map<string, { created_at: string; expires_at: string | null }>();
    const assignedMap = new Map<string, { created_at: string; expires_at: string | null }>();
    const countMap = new Map<string, { total: number; trial: number; assigned: number; paid: number }>();
    for (const lic of licensesData || []) {
      if (lic.type === "trial" && !trialMap.has(lic.user_id)) {
        trialMap.set(lic.user_id, { created_at: lic.created_at, expires_at: lic.expires_at });
      }
      if (lic.type === "assigned" && !assignedMap.has(lic.user_id)) {
        assignedMap.set(lic.user_id, { created_at: lic.created_at, expires_at: lic.expires_at });
      }
      const c = countMap.get(lic.user_id) || { total: 0, trial: 0, assigned: 0, paid: 0 };
      c.total += 1;
      if (lic.type === "trial") c.trial += 1;
      else if (lic.type === "assigned") c.assigned += 1;
      else c.paid += 1;
      countMap.set(lic.user_id, c);
    }

    const merged = (profilesData || []).map((p: any) => {
      const trial = trialMap.get(p.id);
      const assigned = assignedMap.get(p.id);
      const counts = countMap.get(p.id) || { total: 0, trial: 0, assigned: 0, paid: 0 };
      return {
        ...p,
        credits: creditMap.get(p.id) ?? 0,
        trial_requested: !!trial,
        trial_requested_at: trial?.created_at ?? null,
        trial_expires_at: trial?.expires_at ?? null,
        has_assigned_license: !!assigned,
        assigned_expires_at: assigned?.expires_at ?? null,
        licenses_total: counts.total,
        licenses_trial: counts.trial,
        licenses_assigned: counts.assigned,
        licenses_paid: counts.paid,
        signup_ip: ipMap.get(p.id) ?? null,
      };
    });

    return merged as any[];
  });
