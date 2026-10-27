import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateFlowProLicense } from "@/lib/flowpro-api";

async function assertResellerOrAdmin(supabase: any, userId: string) {
  const { data: prof, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (prof?.role !== "reseller" && prof?.role !== "superadmin") {
    throw new Error("Acceso denegado: se requiere cuenta de revendedor");
  }
}

const displayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[\p{L}\p{N} ._-]+$/u, "Nombre inválido");

export const resellerGenerateTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      displayName: displayNameSchema,
      minutes: z.number().int().min(1).max(30).default(15),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertResellerOrAdmin(context.supabase, context.userId);
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
    };
  });

export const resellerGenerateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      displayName: displayNameSchema,
      days: z.number().int().min(1).max(3650).default(30),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertResellerOrAdmin(context.supabase, context.userId);
    const lic = await generateFlowProLicense({
      type: "paid",
      duration_days: data.days,
      customer_name: data.displayName,
    });
    return {
      success: true,
      license_key: lic.license_key,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds || (data.days * 86400),
    };
  });

export const resellerRevokeLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ licenseKey: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertResellerOrAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("reseller_licenses")
      .delete()
      .eq("license_key", data.licenseKey);
    if (error) throw new Error(error.message);
    return { success: true };
  });
