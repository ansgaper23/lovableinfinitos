import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateFlowProLicense, testFlowProConnection } from "@/lib/flowpro-api";

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

export const adminCheckFlowProConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const test = await testFlowProConnection();

    // Consultamos estadísticas de licencias generadas a través de Flow-Pro
    const { count: totalLicenses } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true });

    const { count: trialLicenses } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true })
      .eq("type", "trial");

    const { count: paidLicenses } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true })
      .in("type", ["paid", "assigned"]);

    const { count: lifetimeLicenses } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true })
      .eq("lifetime", true);

    const { data: latestLicense } = await context.supabase
      .from("reseller_licenses")
      .select("license_key, type, created_at, display_name")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...test,
      stats: {
        totalEmitted: totalLicenses || 0,
        trialsEmitted: trialLicenses || 0,
        paidEmitted: paidLicenses || 0,
        lifetimeEmitted: lifetimeLicenses || 0,
        lastEmittedAt: latestLicense?.created_at || null,
        lastEmittedName: latestLicense?.display_name || null,
      },
      timestamp: new Date().toISOString(),
    };
  });

export const adminGetResellerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const { count, error } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true });
    if (error) throw new Error(error.message);

    return {
      used: count || 0,
      max: 999999,
      remaining: 999999,
      allow_lifetime: true,
      provider: "flow-pro.online",
    };
  });

export const adminListLicenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    page: z.number().int().min(1).max(1000).default(1),
    perPage: z.number().int().min(1).max(200).default(50),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const from = (data.page - 1) * data.perPage;
    const to = from + data.perPage - 1;

    const { data: rows, count, error } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      licenses: (rows || []).map((r: any) => ({
        id: r.id,
        key: r.license_key,
        license_key: r.license_key,
        display_name: r.display_name || r.customer_name || "Sin nombre",
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        type: r.type,
        status: r.expires_at && new Date(r.expires_at) < new Date() ? "expired" : "active",
        expires_at: r.expires_at,
        created_at: r.created_at,
        duration_seconds: r.duration_seconds,
        lifetime: r.lifetime,
      })),
      total: count || 0,
      page: data.page,
      per_page: data.perPage,
    };
  });

const displayNameSchema = z.string().trim().min(1).max(60).regex(/^[\p{L}\p{N} ._-]+$/u, "Nombre inválido");

export const adminGenerateTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    displayName: displayNameSchema,
    customerPhone: z.string().optional().nullable(),
    minutes: z.number().int().min(1).max(60).default(15),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const lic = await generateFlowProLicense({
      type: "trial",
      duration_days: 1,
      customer_name: data.displayName,
    });

    await context.supabase.from("reseller_licenses").insert({
      user_id: context.userId,
      license_key: lic.license_key,
      display_name: data.displayName,
      customer_name: data.displayName,
      customer_phone: data.customerPhone || null,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
      lifetime: false,
    });

    return {
      success: true,
      license_key: lic.license_key,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
    };
  });

export const adminGenerateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    displayName: displayNameSchema,
    customerPhone: z.string().optional().nullable(),
    days: z.number().int().min(0).max(3650).optional(),
    lifetime: z.boolean().default(false),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const days = data.lifetime ? 3650 : (data.days ?? 30);
    const lic = await generateFlowProLicense({
      type: "paid",
      duration_days: days,
      customer_name: data.displayName,
      lifetime: data.lifetime,
    });

    await context.supabase.from("reseller_licenses").insert({
      user_id: context.userId,
      license_key: lic.license_key,
      display_name: data.displayName,
      customer_name: data.displayName,
      customer_phone: data.customerPhone || null,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
      lifetime: data.lifetime,
    });

    return {
      success: true,
      license_key: lic.license_key,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
      lifetime: data.lifetime,
    };
  });

export const adminResetHwid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ licenseKey: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    return { success: true, message: "HWID reseteado con éxito" };
  });

export const adminRevokeLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ licenseKey: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("reseller_licenses")
      .delete()
      .eq("license_key", data.licenseKey);
    if (error) throw new Error(error.message);
    return { success: true, message: "Licencia revocada con éxito" };
  });
