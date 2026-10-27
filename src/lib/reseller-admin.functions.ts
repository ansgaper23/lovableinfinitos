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

export const adminGetResellerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase, context.userId);
    const { count } = await context.supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true });
    return {
      used: count || 0,
      max: 999999,
      remaining: 999999,
      allow_lifetime: true,
    };
  });

export const adminListLicenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        page: z.number().int().min(1).max(1000).default(1),
        perPage: z.number().int().min(1).max(200).default(50),
      })
      .parse(i)
  )
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
      licenses: rows || [],
      total: count || 0,
      page: data.page,
      per_page: data.perPage,
    };
  });

const displayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[\p{L}\p{N} ._-]+$/u, "Nombre inválido");

/**
 * Genera una licencia de prueba (trial) para administración con Flow-Pro
 */
export const adminGenerateTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        displayName: displayNameSchema,
        minutes: z.number().int().min(1).max(60).default(15),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);

    const lic = await generateFlowProLicense({
      type: "trial",
      duration_days: 1,
      customer_name: data.displayName,
    });

    return {
      success: true,
      license_key: lic.license_key,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds || 86400,
      lifetime: false,
    };
  });

/**
 * Genera una licencia de pago con Flow-Pro
 */
export const adminGenerateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        displayName: displayNameSchema,
        days: z.number().int().min(0).max(3650).optional(),
        lifetime: z.boolean().default(false),
      })
      .parse(i)
  )
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);

    const days = data.lifetime ? 3650 : data.days ?? 30;
    const lic = await generateFlowProLicense({
      type: "paid",
      duration_days: days,
      customer_name: data.displayName,
    });

    return {
      success: true,
      license_key: lic.license_key,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds || days * 86400,
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
    return { success: true };
  });
