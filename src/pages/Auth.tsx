import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";
import { registerWithIpLimit } from "@/lib/signup.functions";
import { checkEmailExists } from "@/lib/auth-check.functions";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
  }, [navigate]);

  const ALLOWED_DOMAINS = ["gmail.com", "googlemail.com", "hotmail.com", "outlook.com", "live.com", "hotmail.es", "outlook.es"];
  const DISPOSABLE_DOMAINS = new Set([
    "mailinator.com","tempmail.com","temp-mail.org","temp-mail.io","10minutemail.com","guerrillamail.com",
    "yopmail.com","trashmail.com","throwawaymail.com","fakeinbox.com","getnada.com","nada.email",
    "maildrop.cc","sharklasers.com","dispostable.com","mintemail.com","mohmal.com","tempinbox.com",
    "tempmailo.com","tmpmail.org","tmpmail.net","emailondeck.com","mailnesia.com","tempr.email",
    "moakt.com","mailpoof.com","spambox.us","mail-temp.com","tempmail.plus","luxusmail.org",
    "inboxbear.com","mailcatch.com","wegwerfemail.de","20minutemail.com","mailtemp.info"
  ]);

  const validateSignupEmail = (raw: string) => {
    const e = raw.trim().toLowerCase();
    const domain = e.split("@")[1];
    if (!domain) throw new Error("Email inválido.");
    if (DISPOSABLE_DOMAINS.has(domain)) {
      throw new Error("No se permiten correos temporales o desechables.");
    }
    if (!ALLOWED_DOMAINS.includes(domain)) {
      throw new Error("Solo se aceptan correos de Gmail o Hotmail/Outlook.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }

      if (!isLogin) {
        validateSignupEmail(email);
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === "Invalid login credentials") {
            try {
              const { exists } = await checkEmailExists({ data: { email } });
              if (!exists) {
                throw new Error("Este correo no está registrado. Crea una cuenta primero.");
              }
            } catch (checkErr: any) {
              if (checkErr?.message?.includes("no está registrado")) throw checkErr;
            }
            throw new Error("Contraseña incorrecta. Verifica e intenta de nuevo.");
          }
          if (error.message?.toLowerCase().includes("email not confirmed")) {
            throw new Error("Tu correo aún no está confirmado. Revisa tu bandeja de entrada.");
          }
          throw error;
        }
        toast.success("¡Bienvenido de nuevo!");
        navigate({ to: "/dashboard" });
      } else {
        await registerWithIpLimit({ data: { email, password } });
        setSignupSuccess(true);
        setIsLogin(true);
        setPassword("");
        toast.success("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const raw =
        error?.message ||
        error?.body?.message ||
        error?.data?.message ||
        error?.error?.message ||
        (typeof error === "string" ? error : "") ||
        "";
      const msg = raw.toLowerCase();

      let friendly = raw || "No se pudo completar la operación. Intenta nuevamente.";

      if (
        msg.includes("muchas cuentas") ||
        msg.includes("ningun plan activo") ||
        msg.includes("límite") ||
        msg.includes("limite") ||
        msg.includes("esta red") ||
        (msg.includes("ip") && !msg.includes("incorrect"))
      ) {
        friendly = "Parece que tienes muchas cuentas y ningún plan activo :(";
      } else if (msg.includes("no está registrado") || msg.includes("not registered")) {
        friendly = "✉️ Este correo no está registrado. Crea una cuenta primero.";
      } else if (msg.includes("contraseña incorrecta")) {
        friendly = "🔒 Contraseña incorrecta. Verifica e intenta de nuevo.";
      } else if (msg.includes("correos temporales") || msg.includes("desechables") || msg.includes("disposable")) {
        friendly = "✉️ No se permiten correos temporales o desechables. Usa un correo real (Gmail, Hotmail u Outlook).";
      } else if (msg.includes("solo se aceptan") || msg.includes("gmail o hotmail")) {
        friendly = "✉️ Solo se aceptan correos de Gmail o Hotmail/Outlook.";
      } else if (msg.includes("email inválido") || msg.includes("invalid email") || msg.includes("email_address_invalid")) {
        friendly = "✉️ El correo ingresado no es válido. Revisa el formato.";
      } else if (msg.includes("ya está registrado") || msg.includes("already registered") || msg.includes("user_already_exists") || msg.includes("este correo ya está registrado")) {
        friendly = "⚠️ Este correo ya está registrado. Inicia sesión en su lugar.";
      } else if (msg.includes("email not confirmed") || msg.includes("no está confirmado")) {
        friendly = "📩 Tu correo aún no está confirmado. Revisa tu bandeja de entrada.";
      } else if (msg.includes("6 caracteres") || msg.includes("password should") || msg.includes("weak password")) {
        friendly = "🔒 La contraseña debe tener al menos 6 caracteres.";
      } else if (msg.includes("credenciales") || msg.includes("invalid login")) {
        friendly = "❌ Credenciales inválidas. Verifica tu email y contraseña.";
      } else if (msg.includes("network") || msg.includes("failed to fetch")) {
        friendly = "📡 Error de conexión. Verifica tu internet e intenta de nuevo.";
      } else if (msg.includes("rate") || msg.includes("too many")) {
        friendly = "⏱️ Demasiados intentos. Espera unos minutos antes de volver a intentar.";
      } else if (!raw) {
        friendly = "No se pudo completar la operación. Intenta nuevamente o contacta soporte.";
      }

      setErrorMsg(friendly);
      toast.error(friendly, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) throw result.error;
      
      if (!result.redirected) {
        toast.success("¡Bienvenido!");
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.message || "Error con Google Login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] opacity-[0.03]" />
      </div>

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-2xl relative z-10 overflow-hidden shadow-elegant rounded-2xl group transition-all duration-500 hover:border-primary/30">
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group/back z-20 border border-white/5"
          title="Volver al inicio"
        >
          <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
        </Link>

        <CardHeader className="text-center pt-12 pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full scale-0 group-hover/logo:scale-150 transition-transform duration-700 opacity-0 group-hover/logo:opacity-100" />
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary),0.4)] relative z-10 transform transition-transform group-hover/logo:scale-110 group-hover/logo:rotate-3">
                <span className="text-primary-foreground font-black text-3xl italic tracking-tighter">L</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-glow">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black mt-2 opacity-70">
            Lovable Infinito — Elite Access
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {signupSuccess && (
            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Mail className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-400 uppercase tracking-wider">¡Revisa tu correo!</p>
                <p className="text-xs text-green-300/80 mt-1 leading-relaxed">
                  Te enviamos un email de verificación. Haz clic en el link para activar tu cuenta.
                </p>
              </div>
            </div>
          )}
          
          {errorMsg && (
            <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Error</p>
                <p className="text-xs text-red-200/90 mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email Corporativo</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-white/10 bg-white/[0.03] focus:border-primary/50 focus:bg-white/[0.06] transition-all h-12 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-white/10 bg-white/[0.03] focus:border-primary/50 focus:bg-white/[0.06] transition-all h-12 px-4"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl font-black italic tracking-tighter uppercase text-base gradient-primary shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              {loading ? "Procesando..." : isLogin ? "Entrar al Panel" : "Registrarme Ahora"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em]">
              <span className="bg-[#050505] px-4 text-muted-foreground/50">O continúa con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 font-bold uppercase tracking-widest text-[10px] gap-3 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Identity
          </Button>
        </CardContent>

        <CardFooter className="justify-center pb-10">
          <button
            onClick={() => { setIsLogin(!isLogin); setSignupSuccess(false); setErrorMsg(null); }}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-primary/5"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra aquí"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
