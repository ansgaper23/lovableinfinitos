import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const MAX_ACCOUNTS_PER_IP = 3;
const TOO_MANY_ACCOUNTS_MESSAGE = "parece que tienes muchas cuentas y ningun plan activo :(";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

const ResendSchema = z.object({
  email: z.string().email().max(255),
});

function resolveClientIp() {
  const xff = getRequestHeader("x-forwarded-for");
  const cfIp = getRequestHeader("cf-connecting-ip");
  const realIp = getRequestHeader("x-real-ip");
  const peer = getRequestIP({ xForwardedFor: true });
  let ip = peer || (xff ? xff.split(",")[0].trim() : null) || realIp || cfIp || "unknown";
  return ip.toString().slice(0, 64);
}

/**
 * Inicia el registro: valida IP, crea el usuario (sin confirmar) y envía
 * un código OTP de 6 dígitos al correo. El usuario debe verificarlo
 * con `supabase.auth.verifyOtp({ type: 'signup' })` antes de poder entrar.
 */
export const registerWithIpLimit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SignupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createClient } = await import("@supabase/supabase-js");

    const ip = resolveClientIp();

    // Rate-limit by IP
    if (ip !== "unknown") {
      const { count, error: countError } = await supabaseAdmin
        .from("signup_ips")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip);

      if (countError) {
        console.error("[signup] count error", countError);
        throw new Error("No se pudo procesar el registro. Intenta nuevamente.");
      }

      if ((count ?? 0) >= MAX_ACCOUNTS_PER_IP) {
        throw new Error(TOO_MANY_ACCOUNTS_MESSAGE);
      }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

    // Use the anon client so Supabase sends the native signup confirmation
    // email (which contains the 6-digit OTP token).
    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signed, error: signUpError } = await anon.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      const msg = signUpError.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        throw new Error("Este correo ya está registrado. Inicia sesión.");
      }
      if (msg.includes("invalid") && msg.includes("email")) {
        throw new Error("El correo ingresado no es válido.");
      }
      console.error("[signup] signUp error", signUpError);
      throw new Error("No se pudo crear la cuenta. Intenta nuevamente.");
    }

    const userId = signed.user?.id;

    // Record the IP -> account mapping
    if (userId) {
      const { error: insertError } = await supabaseAdmin.from("signup_ips").insert({
        ip,
        user_id: userId,
      });
      if (insertError) console.error("[signup] insert ip error", insertError);
    }

    return { success: true, userId, needsVerification: true };
  });

/**
 * Reenvía el código OTP de verificación al correo.
 */
export const resendSignupOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ResendSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await anon.auth.resend({
      type: "signup",
      email: data.email,
    });

    if (error) {
      console.error("[signup] resend error", error);
      throw new Error("No se pudo reenviar el código. Intenta en unos minutos.");
    }

    return { success: true };
  });
