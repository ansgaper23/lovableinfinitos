import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Zap,
  Clock,
  LogOut,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  Download,
  Layers,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ExtensionDownloadCard } from "./ExtensionDownloadCard";

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
  if (diff <= 0) return { expired: true, label: "Expirada" };
  const s = Math.floor(diff / 1000);
  return {
    expired: false,
    label: `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor(
      (s % 3600) / 60,
    )}m ${s % 60}s`,
  };
}

function LicenseStatusBadge({ expiresAt }: { expiresAt: string | null }) {
  const countdown = useCountdown(expiresAt);
  const isLifetime = !expiresAt;
  const isExpired = !isLifetime && !!countdown?.expired;
  const statusLabel = isLifetime ? "VITALICIA" : isExpired ? "EXPIRADA" : "ACTIVA";
  const statusClasses = isExpired
    ? "border-red-500/40 bg-red-500/10 text-red-400"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  const timeText = isLifetime
    ? "Sin vencimiento"
    : isExpired
      ? `Expiró: ${new Date(expiresAt as string).toLocaleString()}`
      : `Tiempo restante: ${countdown?.label ?? "—"}`;
  return (
    <>
      <Badge
        variant="outline"
        className={`rounded-full text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${statusClasses}`}
      >
        {statusLabel}
      </Badge>
      <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {timeText}
      </p>
    </>
  );
}

type TabKey = "inicio" | "planes" | "llaves" | "extension" | "extras";

export const Dashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [trial, setTrial] = useState<TrialLicense | null>(null);
  const [assigned, setAssigned] = useState<AssignedLicense | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAssigned, setCopiedAssigned] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("inicio");
  const navigate = useNavigate();
  const genTrial = useServerFn(generateTrialForNewUser);

  const isBasicUser = profile?.role === "user" || !profile?.role;
  const displayName = user?.email?.split("@")[0] || "Usuario";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [creditsRes, trialRes, assignedRes] = await Promise.all([
        supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("reseller_licenses")
          .select("license_key, expires_at, created_at")
          .eq("user_id", user.id)
          .eq("type", "trial")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("reseller_licenses")
          .select("license_key, expires_at, created_at, display_name, type")
          .eq("user_id", user.id)
          .neq("type", "trial")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setCredits(creditsRes.data?.credits ?? 0);
      if (trialRes.data) setTrial(trialRes.data as TrialLicense);
      if (assignedRes.data) setAssigned(assignedRes.data as AssignedLicense);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleGenerateTrial = async () => {
    setIsGenerating(true);
    try {
      const res = await genTrial({ data: { displayName } });
      setTrial({
        license_key: res.license_key,
        expires_at: res.expires_at,
        created_at: new Date().toISOString(),
      });
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
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
      </div>
    );
  }

  if (profile?.role === "blocked") {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cuenta Bloqueada</h1>
        <p className="text-zinc-400 max-w-md mb-6">
          Tu cuenta ha sido bloqueada. Contacta con soporte para más información.
        </p>
        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          variant="outline"
          className="rounded-full h-11 px-6 border-white/10 bg-white/5 hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "inicio", label: "Inicio", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "planes", label: "Planes", icon: <CreditCard className="w-4 h-4" /> },
    { key: "llaves", label: "Mis Llaves", icon: <Key className="w-4 h-4" /> },
    { key: "extension", label: "Extensión", icon: <Download className="w-4 h-4" /> },
    { key: "extras", label: "Extras", icon: <Layers className="w-4 h-4" /> },
  ];

  const statusActive = !!assigned || !!trial;

  return (
    <div className="min-h-screen bg-[#06060a] text-white font-sans relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none absolute top-1/3 left-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">
              Lovable <span className="text-zinc-400 font-medium">Infinito</span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition">
              <Bell className="w-4 h-4 text-zinc-300" />
            </button>
            <div
              className={`hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest ${
                statusActive
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              <Zap className="w-3 h-3" />
              {statusActive ? "Acceso activo" : "Sin licencia"}
            </div>
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium max-w-[120px] truncate">{displayName}</span>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="rounded-full h-9 px-3 text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salida</span>
            </Button>
          </div>
        </header>

        {/* Tab nav pill */}
        <nav className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-2">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-white border border-violet-400/30 shadow-inner"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className={active ? "text-violet-300" : ""}>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Hero */}
        <section className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden">
          <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-violet-600/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[100px] rounded-full" />

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 p-6 sm:p-10">
            <div>
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
              >
                <Zap className="w-3 h-3 mr-1.5" />
                {statusActive ? "Acceso premium activo" : "Cuenta nueva"}
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                ¡Hola,{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  {displayName}
                </span>
                !
              </h1>
              <p className="text-zinc-400 max-w-xl text-base sm:text-lg leading-relaxed mb-6">
                Tu panel está listo. Gestiona tus llaves y monitoriza el uso de tus extensiones en tiempo real.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate({ to: "/precios" })}
                  className="rounded-full h-11 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold shadow-lg shadow-violet-600/30"
                >
                  Ver planes
                </Button>
                <Button
                  onClick={() => setActiveTab("llaves")}
                  variant="outline"
                  className="rounded-full h-11 px-6 bg-white/5 border-white/10 hover:bg-white/10 font-semibold"
                >
                  Mis Llaves
                </Button>
              </div>
            </div>

            {/* Status card */}
            <div className="self-center w-full lg:w-[280px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Tu estatus</p>
                <span
                  className={`w-2 h-2 rounded-full ${statusActive ? "bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/60" : "bg-amber-400"}`}
                />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold">{(assigned ? 1 : 0) + (trial ? 1 : 0)}</span>
                <span className="text-zinc-400 text-sm">Fichas activas</span>
              </div>
              <Progress
                value={statusActive ? 100 : 10}
                className="h-1.5 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Créditos</p>
                  <p className="text-sm font-bold">
                    {credits === null ? "…" : credits === -1 ? "∞" : credits}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Rol</p>
                  <p className="text-sm font-bold capitalize">
                    {isBasicUser ? "Nuevo" : profile?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary heading */}
        <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase pt-2">
          Resumen de la actuación
        </p>

        {/* Stat grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Estado"
            value={statusActive ? "ACTIVA" : isBasicUser ? "NUEVA" : "ACTIVA"}
            hint={statusActive ? "Acceso completo" : "Sin licencia aún"}
            icon={<ShieldCheck className="w-5 h-5" />}
            tone="violet"
          />
          <StatCard
            label="Créditos"
            value={credits !== null ? (credits === -1 ? "ILIMITADOS" : credits.toString()) : "…"}
            hint="En tu cuenta"
            icon={<Zap className="w-5 h-5" />}
            tone="fuchsia"
          />
          <StatCard
            label="Licencia Prueba"
            value={trial ? "GENERADA" : "DISPONIBLE"}
            hint={trial ? "Un solo uso" : "Pulsa generar"}
            icon={<Key className="w-5 h-5" />}
            tone="emerald"
          />
        </div>

        {/* Assigned license */}
        <PanelCard
          icon={<ShieldCheck className="w-5 h-5 text-violet-300" />}
          title="Mi Licencia"
          subtitle={assigned ? "Licencia asignada por el administrador" : "Estado de tu licencia"}
        >
          {!assigned ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Sin licencia asignada</h3>
                <p className="text-sm text-zinc-400">Adquiere una para empezar a usar Lovable Infinito.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    window.open(
                      "https://wa.me/51936467898?text=Hola,%20quiero%20adquirir%20una%20licencia%20de%20Lovable%20Infinito",
                      "_blank",
                    )
                  }
                  className="rounded-full h-10 px-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold"
                >
                  Adquirir <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={() => navigate({ to: "/precios" })}
                  variant="outline"
                  className="rounded-full h-10 px-5 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Ver Planes
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.05] p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <LicenseStatusBadge expiresAt={assigned.expires_at ?? null} />
              </div>
              <p className="text-[10px] font-bold tracking-widest text-violet-300 uppercase mb-2">
                Tu llave de acceso
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 font-mono text-sm text-white break-all bg-black/50 px-4 py-3 rounded-xl border border-white/10">
                  {assigned.license_key}
                </code>
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(assigned.license_key);
                    setCopiedAssigned(true);
                    setTimeout(() => setCopiedAssigned(false), 1800);
                  }}
                  variant="outline"
                  className="rounded-xl h-11 px-4 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  {copiedAssigned ? (
                    <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedAssigned ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>
          )}
        </PanelCard>

        {/* Trial license */}
        <PanelCard
          icon={<Key className="w-5 h-5 text-fuchsia-300" />}
          title="Licencia de Prueba"
          subtitle="15 minutos · Un solo uso por cuenta"
        >
          {!trial ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-zinc-400 flex-1">
                Aún no has generado tu licencia de prueba. Pulsa el botón para crearla ahora.
              </p>
              <Button
                onClick={handleGenerateTrial}
                disabled={isGenerating}
                className="rounded-full h-11 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 font-semibold shadow-lg shadow-fuchsia-600/20"
              >
                {isGenerating ? (
                  "Generando..."
                ) : (
                  <>
                    Generar prueba <Zap className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.05] p-5">
              <p className="text-[10px] font-bold tracking-widest text-fuchsia-300 uppercase mb-2">
                Tu llave de acceso
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 font-mono text-sm text-white break-all bg-black/50 px-4 py-3 rounded-xl border border-white/10">
                  {trial.license_key}
                </code>
                <Button
                  onClick={copyKey}
                  variant="outline"
                  className="rounded-xl h-11 px-4 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              {trial.expires_at && (
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mt-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Expira: {new Date(trial.expires_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </PanelCard>

        {/* Reseller access */}
        <PanelCard
          icon={
            isBasicUser ? (
              <Lock className="w-5 h-5 text-zinc-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            )
          }
          title="Panel de Revendedor"
          subtitle={isBasicUser ? "Acceso limitado" : "Acceso completo"}
        >
          {isBasicUser ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Puedes acceder al panel, pero no podrás generar licencias hasta que el{" "}
                <span className="text-violet-300 font-semibold">administrador active tu cuenta</span>. Una vez
                activada, tendrás acceso completo para emitir y gestionar tus licencias.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate({ to: "/reseller" })}
                  variant="outline"
                  className="rounded-full h-10 px-5 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Ir al Panel <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
                >
                  Pendiente de activación
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Tu cuenta está activa. Accede al panel para gestionar licencias.
              </p>
              <Button
                onClick={() => navigate({ to: "/reseller" })}
                className="rounded-full h-11 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold"
              >
                Abrir Panel <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </PanelCard>

        <ExtensionDownloadCard />
      </div>
    </div>
  );
};

const PanelCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Card className="rounded-3xl border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/20">
    <CardContent className="p-6 sm:p-7 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </CardContent>
  </Card>
);

const toneMap = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-400/20", text: "text-violet-300" },
  fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-400/20", text: "text-fuchsia-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-400/20", text: "text-emerald-300" },
} as const;

const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: keyof typeof toneMap;
}) => {
  const t = toneMap[tone];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-white/20 transition group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${t.bg} border ${t.border} ${t.text} flex items-center justify-center group-hover:scale-110 transition`}
        >
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1">{label}</p>
      <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
      <p className={`text-xs font-semibold uppercase tracking-widest ${t.text}`}>{hint}</p>
    </div>
  );
};
