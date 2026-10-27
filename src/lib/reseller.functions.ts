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
      customerPhone: z.string().max(30).optional(),
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

    const durationSeconds = lic.duration_seconds || 86400;

    // Guardar directamente en la BD desde el servidor para garantizar persistencia
    const { error: insErr } = await context.supabase
      .from("reseller_licenses")
      .insert({
        user_id: context.userId,
        license_key: lic.license_key,
        display_name: data.displayName,
        customer_name: data.displayName,
        customer_phone: data.customerPhone || null,
        type: "trial",
        expires_at: lic.expires_at,
        duration_seconds: durationSeconds,
        lifetime: false,
      });

    if (insErr) {
      console.error("Error guardando licencia trial en reseller_licenses:", insErr);
    }

    return {
      success: true,
      license_key: lic.license_key,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: durationSeconds,
    };
  });

export const resellerGenerateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      displayName: displayNameSchema,
      customerPhone: z.string().max(30).optional(),
      days: z.number().int().min(1).max(3650).default(30),
      lifetime: z.boolean().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertResellerOrAdmin(context.supabase, context.userId);
    const lic = await generateFlowProLicense({
      type: "paid",
      duration_days: data.days,
      customer_name: data.displayName,
      lifetime: data.lifetime,
    });

    const durationSeconds = lic.duration_seconds || (data.days * 86400);

    // Guardar directamente en la BD desde el servidor
    const { error: insErr } = await context.supabase
      .from("reseller_licenses")
      .insert({
        user_id: context.userId,
        license_key: lic.license_key,
        display_name: data.displayName,
        customer_name: data.displayName,
        customer_phone: data.customerPhone || null,
        type: "paid",
        expires_at: lic.expires_at,
        duration_seconds: durationSeconds,
        lifetime: data.lifetime || false,
      });

    if (insErr) {
      console.error("Error guardando licencia pagada en reseller_licenses:", insErr);
    }

    return {
      success: true,
      license_key: lic.license_key,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: durationSeconds,
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
