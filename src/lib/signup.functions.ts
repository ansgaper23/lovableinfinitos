import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const MAX_ACCOUNTS_PER_IP = 3;
const TOO_MANY_ACCOUNTS_MESSAGE = "parece que tienes muchas cuentas y ningun plan activo :(";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

export const registerWithIpLimit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SignupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve real client IP. Proxies/CDNs can rotate their own IP per request,
    // so the forwarded/client IP must be preferred over the edge IP.
    const xff = getRequestHeader("x-forwarded-for");
    const cfIp = getRequestHeader("cf-connecting-ip");
    const realIp = getRequestHeader("x-real-ip");
    const peer = getRequestIP({ xForwardedFor: true });

    let ip =
      peer ||
      (xff ? xff.split(",")[0].trim() : null) ||
      realIp ||
      cfIp ||
      "unknown";
    ip = ip.toString().slice(0, 64);

    // Count existing signups for this IP
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

    // Create the user via admin (auto-confirmed so the user can log in immediately)
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (createError || !created?.user) {
      const msg = createError?.message ?? "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        throw new Error("Este correo ya está registrado. Inicia sesión.");
      }
      console.error("[signup] create user error", createError);
      throw new Error("No se pudo crear la cuenta. Intenta nuevamente.");
    }

    // Record the IP -> account mapping
    const { error: insertError } = await supabaseAdmin.from("signup_ips").insert({
      ip,
      user_id: created.user.id,
    });

    if (insertError) {
      console.error("[signup] insert ip error", insertError);
      // Do not fail the signup if logging fails, but log it.
    }

    return { success: true, userId: created.user.id };
  });
