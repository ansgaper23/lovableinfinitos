import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";



export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Por favor, completa todos los campos.");
      }

      if (!isLogin && password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === "Invalid login credentials") {
            throw new Error("Credenciales inválidas. Verifica tu email y contraseña.");
          }
          throw error;
        }
        toast.success("¡Bienvenido de nuevo!");
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          toast.success("¡Bienvenido! Tu cuenta ha sido creada.");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("¡Cuenta creada con éxito! Revisa tu correo o inicia sesión.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
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
    <div className="min-h-screen bg-background text-foreground dark font-sans flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_80%)] bg-opacity-[0.05]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] animate-float" />
      </div>

      <Card className="w-full max-w-md rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl relative z-10 overflow-hidden">
        <Link 
          to="/" 
          className="absolute top-6 left-6 p-2 text-muted-foreground hover:text-primary transition-colors group z-20"
          title="Volver al inicio"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="text-center pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <span className="text-primary-foreground font-black text-2xl italic">L</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-2">
            Lovable Infinito — Elite Access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-colors h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-colors h-12"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-none font-black italic tracking-tighter uppercase text-lg shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--color-primary),0.5)] transition-all"
            >
              {loading ? "Procesando..." : isLogin ? "Entrar al Panel" : "Registrarme Ahora"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-background/50 backdrop-blur-md px-4 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-xs gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra aquí"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
