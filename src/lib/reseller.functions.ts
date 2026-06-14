import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const BASE_URL = "https://itsgcyiyemstpfafxrpq.supabase.co/functions/v1/reseller-api";

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

function getToken() {
  const token = process.env.RESELLER_API_KEY;
  if (!token) throw new Error("RESELLER_API_KEY no está configurada");
  return token;
}

async function callProvider(path: string, body?: any) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "x-api-token": getToken(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { message: "Respuesta inválida del proveedor" }; }
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
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
    return await callProvider("generate-trial", {
      display_name: data.displayName,
      minutes: data.minutes,
      seconds: 0,
    });
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
    return await callProvider("generate-license", {
      display_name: data.displayName,
      days: data.days,
    });
  });

export const resellerRevokeLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ licenseKey: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertResellerOrAdmin(context.supabase, context.userId);
    return await callProvider("revoke-license", { license_key: data.licenseKey });
  });
