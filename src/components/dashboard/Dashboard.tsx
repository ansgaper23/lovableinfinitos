import { useEffect, useState } from "react";
import { LayoutDashboard, Zap, Clock, Settings, LogOut, ShieldCheck, Key, Copy, Check, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateTrialForNewUser } from "@/lib/user-actions.functions";

interface TrialLicense {
  license_key: string;
  expires_at: string | null;
  created_at: string;
}

interface AssignedLicense {
  license_key: string;
  expires_at: string | null;
  created_at: string;
  display_name: string | null;
  type: string;
}

function useCountdown(expiresAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return { expired: true, label: "Expirada", d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(diff / 1000);
  return {
    expired: false,
    label: `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export const Dashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [trial, setTrial] = useState<TrialLicense | null>(null);
  const [assigned, setAssigned] = useState<AssignedLicense | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAssigned, setCopiedAssigned] = useState(false);
  const navigate = useNavigate();
  const genTrial = useServerFn(generateTrialForNewUser);

  const isBasicUser = profile?.role === "user" || !profile?.role;
  const countdown = useCountdown(assigned?.expires_at ?? null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();
      setCredits(data?.credits ?? 0);

      const { data: lic } = await supabase
        .from("reseller_licenses")
        .select("license_key, expires_at, created_at")
        .eq("user_id", user.id)
        .eq("type", "trial")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lic) setTrial(lic as TrialLicense);

      const { data: asg } = await supabase
        .from("reseller_licenses")
        .select("license_key, expires_at, created_at, display_name, type")
        .eq("user_id", user.id)
        .neq("type", "trial")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (asg) setAssigned(asg as AssignedLicense);
    })();
  }, [user]);

  const handleGenerateTrial = async () => {
    setIsGenerating(true);
    try {
      const res = await genTrial({ data: { displayName: user?.email?.split("@")[0] || "Trial" } });
      setTrial({ license_key: res.license_key, expires_at: res.expires_at, created_at: new Date().toISOString() });
      toast.success("¡Licencia de prueba generada!");
    } catch (e: any) {
      toast.error(e.message || "Error al generar la prueba");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyKey = async () => {
    if (!trial) return;
    await navigator.clipboard.writeText(trial.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (profile?.role === "blocked") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-none bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Cuenta Bloqueada</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Tu cuenta ha sido bloqueada por el administrador. Contacta con soporte para más información.
        </p>
        <Button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
          variant="outline"
          className="rounded-none font-black italic uppercase tracking-tighter h-12 px-6 border-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 bg-background text-foreground dark font-sans flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl hidden lg:flex flex-col">
          <div className="p-8">
            <a href="/" className="flex items-center gap-3 mb-12 group cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-500">
                <span className="text-primary-foreground font-black text-2xl italic">L</span>
              </div>
              <span className="font-black text-xl tracking-tighter italic">INFINITO</span>
            </a>

            <nav className="space-y-2">
              <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Panel" active />
              <NavItem icon={<Key className="w-5 h-5" />} label="Mi Licencia" />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Ajustes" />
              <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                {profile?.role === "superadmin" && (
                  <NavItem icon={<ShieldCheck className="w-5 h-5 text-destructive" />} label="SuperAdmin" href="/superadmin" />
                )}
                <NavItem icon={<Key className="w-5 h-5 text-primary" />} label="Revendedor" href="/reseller" />
              </div>
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_80%)] bg-opacity-[0.02]">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-background/40 backdrop-blur-md">
            <h1 className="text-xl font-black italic tracking-tighter uppercase">Panel de Control</h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.email?.split("@")[0] || "Usuario"}</p>
                <p className="text-[10px] font-black tracking-widest text-primary uppercase">
                  {isBasicUser ? "CUENTA NUEVA" : profile?.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-none bg-primary/20 border border-primary/30 flex items-center justify-center font-black italic text-primary uppercase">
                {user?.email?.[0] || "U"}
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="glass-card p-8 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <Badge variant="outline" className="mb-3 rounded-none border-primary/30 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-2" /> Bienvenido
                </Badge>
                <h2 className="text-3xl font-black italic tracking-tighter mb-2 uppercase">¡Tu cuenta está lista!</h2>
                <p className="text-muted-foreground max-w-xl">
                  Como nueva cuenta, puedes generar <span className="text-primary font-bold">una licencia de prueba</span> para
                  testear Lovable Infinito. Para acceder al panel de Revendedor y emitir licencias de pago, espera la
                  activación del administrador.
                </p>
              </div>
            </div>





            {/* Assigned license card */}
            <Card className="rounded-none border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Mi Licencia</CardTitle>
                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mt-1">
                      {assigned ? "Licencia asignada por el administrador" : "Estado de tu licencia"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!assigned ? (
                  <div className="p-8 border border-dashed border-white/10 bg-black/20 flex flex-col items-start gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-none bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase">Sin licencia asignada</h3>
                        <p className="text-sm text-muted-foreground">Adquiere una para empezar a usar Lovable Infinito.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => window.open("https://wa.me/?text=Hola,%20quiero%20adquirir%20una%20licencia%20de%20Lovable%20Infinito", "_blank")}
                        className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12"
                      >
                        Adquirir Licencia <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => navigate({ to: "/" })}
                        variant="outline"
                        className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12 border-white/10"
                      >
                        Ver Planes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 border border-primary/30 bg-primary/5">
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <Badge variant="outline" className={`rounded-none text-[10px] font-black uppercase tracking-widest px-3 py-1 ${
                          countdown?.expired
                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                            : "border-green-500/30 bg-green-500/10 text-green-400"
                        }`}>
                          {countdown?.expired ? "EXPIRADA" : "ACTIVA"}
                        </Badge>
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {countdown?.expired
                            ? `Expiró: ${new Date(assigned.expires_at!).toLocaleString()}`
                            : `Tiempo restante: ${countdown?.label}`}
                        </p>
                      </div>
                      <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-3">Tu llave de acceso</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="flex-1 min-w-0 font-mono text-sm sm:text-base text-white break-all bg-black/40 px-4 py-3 border border-white/10">
                          {assigned.license_key}
                        </code>
                        <Button
                          onClick={async () => {
                            await navigator.clipboard.writeText(assigned.license_key);
                            setCopiedAssigned(true);
                            setTimeout(() => setCopiedAssigned(false), 1800);
                          }}
                          variant="outline"
                          className="rounded-none font-black italic tracking-tighter uppercase h-12 px-4 border-white/10"
                        >
                          {copiedAssigned ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copiedAssigned ? "Copiado" : "Copiar"}
                        </Button>
                      </div>
                      {assigned.expires_at && (
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mt-3">
                          Expira: {new Date(assigned.expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Trial license card */}
            <Card className="rounded-none border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Licencia de Prueba</CardTitle>
                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mt-1">
                      15 minutos · Un solo uso por cuenta
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!trial ? (
                  <div className="flex flex-col items-start gap-4 p-6 border border-dashed border-white/10 bg-black/20">
                    <p className="text-sm text-muted-foreground">
                      Aún no has generado tu licencia de prueba. Pulsa el botón para crearla ahora.
                    </p>
                    <Button
                      onClick={handleGenerateTrial}
                      disabled={isGenerating}
                      className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12"
                    >
                      {isGenerating ? "Generando..." : (<>Generar Licencia de Prueba <Zap className="w-4 h-4" /></>)}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 border border-primary/30 bg-primary/5">
                      <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-3">
                        Tu llave de acceso
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="flex-1 min-w-0 font-mono text-sm sm:text-base text-white break-all bg-black/40 px-4 py-3 border border-white/10">
                          {trial.license_key}
                        </code>
                        <Button
                          onClick={copyKey}
                          variant="outline"
                          className="rounded-none font-black italic tracking-tighter uppercase h-12 px-4 border-white/10"
                        >
                          {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? "Copiado" : "Copiar"}
                        </Button>
                      </div>
                      {trial.expires_at && (
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mt-3 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Expira: {new Date(trial.expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reseller access card */}
            <Card className="rounded-none border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                  {isBasicUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
                  Panel de Revendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isBasicUser ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Puedes acceder al panel, pero no podrás generar licencias hasta que el
                      <span className="text-primary font-bold"> superadmin active tu cuenta</span>. Una vez activada,
                      tendrás acceso completo para emitir y gestionar tus licencias.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => navigate({ to: "/reseller" })}
                        variant="outline"
                        className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12 border-white/10"
                      >
                        Ir al Panel <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Badge variant="outline" className="rounded-none border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                        Pendiente de activación
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Tu cuenta está activa. Accede al panel para gestionar licencias.</p>
                    <Button
                      onClick={() => navigate({ to: "/reseller" })}
                      className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12"
                    >
                      Abrir Panel de Revendedor <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status grid (compact) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="Estado"
                value={isBasicUser ? "NUEVA" : "ACTIVA"}
                subtitle={isBasicUser ? "Esperando activación" : "Acceso completo"}
                icon={<ShieldCheck className="w-6 h-6 text-primary" />}
                progress={isBasicUser ? 30 : 100}
              />
              <StatCard
                title="Créditos"
                value={credits !== null ? (credits === -1 ? "ILIMITADOS" : credits.toString()) : "..."}
                subtitle="En tu cuenta"
                icon={<Zap className="w-6 h-6 text-primary" />}
              />
              <StatCard
                title="Licencia Prueba"
                value={trial ? "GENERADA" : "DISPONIBLE"}
                subtitle={trial ? "Un solo uso" : "Pulsa generar"}
                icon={<Key className="w-6 h-6 text-primary" />}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href = "#" }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) => (
  <a
    href={href}
    className={`flex items-center gap-3 px-4 py-3 font-black italic tracking-tighter uppercase text-sm transition-all group ${
      active ? "text-primary bg-primary/10 border-r-2 border-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"
    }`}
  >
    <span className={active ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}>{icon}</span>
    {label}
  </a>
);

const StatCard = ({ title, value, subtitle, icon, progress }: { title: string; value: string; subtitle: string; icon: React.ReactNode; progress?: number }) => (
  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-primary/30 transition-colors group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">{title}</p>
      <h3 className="text-3xl font-black italic tracking-tighter text-white mb-1">{value}</h3>
      <p className="text-xs text-primary font-bold uppercase tracking-widest">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-4">
          <Progress value={progress} className="h-1 bg-white/5" />
        </div>
      )}
    </CardContent>
  </Card>
);
