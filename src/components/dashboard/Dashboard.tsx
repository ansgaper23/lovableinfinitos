import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  Package,
  Loader2,
  Chrome,
  Monitor,
  Flame,
  Crown,
  Star,
  PlayCircle,
  GraduationCap,
  LifeBuoy,
  MessageCircle,
  Mail,
  BookOpen,
  Search,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateTrialForNewUser } from "@/lib/user-actions.functions";


interface LicenseRow {
  id: string;
  license_key: string;
  expires_at: string | null;
  created_at: string;
  display_name: string | null;
  type: string;
  lifetime: boolean | null;
}

function computeCountdown(expiresAt: string | null, now: number) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return { expired: true as const, label: "Expirada" };
  const s = Math.floor(diff / 1000);
  return {
    expired: false as const,
    label: `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor(
      (s % 3600) / 60,
    )}m ${s % 60}s`,
  };
}

function useCountdown(expiresAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    // Stop ticking once expired to avoid useless renders.
    if (new Date(expiresAt).getTime() - Date.now() <= 0) return;
    const id = setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (new Date(expiresAt).getTime() - next <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return computeCountdown(expiresAt, now);
}

// Isolated ticker so the parent card does not re-render every second.
const CountdownLabel = memo(({ expiresAt }: { expiresAt: string }) => {
  const c = useCountdown(expiresAt);
  return <>{c?.label ?? "—"}</>;
});
CountdownLabel.displayName = "CountdownLabel";

type TabKey = "inicio" | "planes" | "llaves" | "extension" | "extras" | "tutoriales" | "ayuda";

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "inicio", label: "Inicio", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "planes", label: "Planes", icon: <CreditCard className="w-4 h-4" /> },
  { key: "llaves", label: "Mis Llaves", icon: <Key className="w-4 h-4" /> },
  { key: "extension", label: "Extensión", icon: <Download className="w-4 h-4" /> },
  { key: "extras", label: "Extras", icon: <Layers className="w-4 h-4" /> },
  { key: "tutoriales", label: "Tutoriales", icon: <GraduationCap className="w-4 h-4" /> },
  { key: "ayuda", label: "Ayuda", icon: <LifeBuoy className="w-4 h-4" /> },
];

export const Dashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("inicio");
  const navigate = useNavigate();
  const genTrial = useServerFn(generateTrialForNewUser);

  const isBasicUser = profile?.role === "user" || !profile?.role;
  const displayName = user?.email?.split("@")[0] || "Usuario";

  const refetchLicenses = async (uid: string) => {
    const { data } = await supabase
      .from("reseller_licenses")
      .select("id, license_key, expires_at, created_at, display_name, type, lifetime")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setLicenses(data as LicenseRow[]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [creditsRes, licRes] = await Promise.all([
        supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("reseller_licenses")
          .select("id, license_key, expires_at, created_at, display_name, type, lifetime")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setCredits(creditsRes.data?.credits ?? 0);
      if (licRes.data) setLicenses(licRes.data as LicenseRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const trial = useMemo(() => licenses.find((l) => l.type === "trial") || null, [licenses]);
  const assigned = useMemo(() => licenses.find((l) => l.type !== "trial") || null, [licenses]);
  const statusActive = !!assigned || !!trial;

  const handleGenerateTrial = useCallback(async () => {
    setIsGenerating(true);
    try {
      await genTrial({ data: { displayName } });
      toast.success("¡Licencia de prueba generada!");
      if (user) await refetchLicenses(user.id);
    } catch (e: any) {
      toast.error(e.message || "Error al generar la prueba");
    } finally {
      setIsGenerating(false);
    }
  }, [genTrial, displayName, user?.id]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }, [navigate]);


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
          onClick={handleSignOut}
          variant="outline"
          className="rounded-full h-11 px-6 border-white/10 bg-white/5 hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    );
  }


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
              onClick={handleSignOut}
              className="rounded-full h-9 px-3 text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salida</span>
            </Button>
          </div>
        </header>

        {/* Tab nav pill */}
        <nav className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1">
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

        {activeTab === "inicio" && (
          <InicioTab
            displayName={displayName}
            statusActive={statusActive}
            assigned={assigned}
            trial={trial}
            credits={credits}
            role={profile?.role}
            isBasicUser={isBasicUser}
            onNavigate={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === "planes" && <PlanesTab />}

        {activeTab === "llaves" && (
          <LlavesTab
            licenses={licenses}
            onGenerateTrial={handleGenerateTrial}
            isGenerating={isGenerating}
            hasTrial={!!trial}
          />
        )}

        {activeTab === "extension" && <ExtensionTab />}

        {activeTab === "extras" && (
          <ExtrasTab isBasicUser={isBasicUser} navigate={navigate} role={profile?.role} />
        )}

        {activeTab === "tutoriales" && <TutorialesTab />}

        {activeTab === "ayuda" && <AyudaTab />}
      </div>
    </div>
  );
};

/* -------------------- TAB: INICIO -------------------- */
const InicioTab = ({
  displayName,
  statusActive,
  assigned,
  trial,
  credits,
  role,
  isBasicUser,
  onNavigate,
}: {
  displayName: string;
  statusActive: boolean;
  assigned: LicenseRow | null;
  trial: LicenseRow | null;
  credits: number | null;
  role?: string | null;
  isBasicUser: boolean;
  onNavigate: (t: TabKey) => void;
}) => (
  <>
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
              onClick={() => onNavigate("planes")}
              className="rounded-full h-11 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold shadow-lg shadow-violet-600/30"
            >
              Ver planes
            </Button>
            <Button
              onClick={() => onNavigate("llaves")}
              variant="outline"
              className="rounded-full h-11 px-6 bg-white/5 border-white/10 hover:bg-white/10 font-semibold"
            >
              Mis Llaves
            </Button>
          </div>
        </div>

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
              <p className="text-sm font-bold capitalize">{isBasicUser ? "Nuevo" : role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase pt-2">
      Resumen de la actuación
    </p>

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
        label="Llaves totales"
        value={String((assigned ? 1 : 0) + (trial ? 1 : 0))}
        hint="Activas hoy"
        icon={<Key className="w-5 h-5" />}
        tone="emerald"
      />
    </div>
  </>
);

/* -------------------- TAB: PLANES -------------------- */
const PlanesTab = () => {
  const plans = [
    {
      name: "Plan Básico",
      duration: "1 Día",
      price: "$5.99",
      icon: <Flame className="w-5 h-5" />,
      tone: "violet" as const,
      features: ["Lovable ilimitado por 1 día", "Sin consumo de créditos", "Acceso inmediato", "Soporte por WhatsApp"],
    },
    {
      name: "Plan Pro",
      duration: "7 Días",
      price: "$13.99",
      popular: true,
      icon: <Star className="w-5 h-5" />,
      tone: "fuchsia" as const,
      features: ["Lovable ilimitado por 7 días", "Sin consumo de créditos", "Acceso inmediato", "Soporte 24/7", "Guía de prompts"],
    },
    {
      name: "Plan Premium",
      duration: "30 Días",
      price: "$18.99",
      oldPrice: "$35.00",
      icon: <Crown className="w-5 h-5" />,
      tone: "pink" as const,
      features: ["Lovable ilimitado por 30 días", "Sin consumo de créditos", "Acceso inmediato", "Soporte VIP", "Actualizaciones garantizadas"],
    },
  ];
  const toneRing: Record<string, string> = {
    violet: "from-violet-500/30 to-violet-500/0 text-violet-300",
    fuchsia: "from-fuchsia-500/30 to-fuchsia-500/0 text-fuchsia-300",
    pink: "from-pink-500/30 to-pink-500/0 text-pink-300",
  };

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Planes activos"
        title="Elige el ritmo que necesitas"
        sub="Energía ilimitada para tus proyectos. Paga solo por el tiempo que usas."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl border bg-white/[0.03] backdrop-blur-xl p-6 transition hover:-translate-y-1 ${
              p.popular ? "border-violet-400/40 shadow-2xl shadow-violet-600/20" : "border-white/10"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                Más popular
              </span>
            )}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${toneRing[p.tone]} border border-white/10 flex items-center justify-center mb-5`}
            >
              {p.icon}
            </div>
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-4">{p.duration}</p>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-bold tracking-tight">{p.price}</span>
              {p.oldPrice && <span className="text-sm text-zinc-500 line-through">{p.oldPrice}</span>}
            </div>
            <ul className="space-y-2 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() =>
                window.open(
                  `https://wa.me/51936467898?text=Hola,%20quiero%20el%20${encodeURIComponent(p.name)}`,
                  "_blank",
                )
              }
              className={`w-full rounded-full h-11 font-semibold ${
                p.popular
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-600/30"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              }`}
            >
              Activar acceso
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

/* -------------------- TAB: MIS LLAVES -------------------- */
const LlavesTab = ({
  licenses,
  onGenerateTrial,
  isGenerating,
  hasTrial,
}: {
  licenses: LicenseRow[];
  onGenerateTrial: () => void;
  isGenerating: boolean;
  hasTrial: boolean;
}) => (
  <section className="space-y-6">
    <div className="flex items-end justify-between flex-wrap gap-4">
      <Header
        eyebrow={`${licenses.length} llaves`}
        title="Mis Llaves"
        sub="Aquí están todas tus llaves generadas, gratuitas y de pago."
      />
      {!hasTrial && (
        <Button
          onClick={onGenerateTrial}
          disabled={isGenerating}
          className="rounded-full h-11 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 font-semibold shadow-lg shadow-fuchsia-600/20"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Generar prueba gratis
        </Button>
      )}
    </div>

    {licenses.length === 0 ? (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Key className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Aún no tienes llaves</h3>
        <p className="text-sm text-zinc-400">
          Genera tu prueba gratuita o adquiere un plan para empezar.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {licenses.map((lic) => (
          <LicenseRowCard key={lic.id} lic={lic} />
        ))}
      </div>
    )}
  </section>
);

const LicenseRowCard = memo(({ lic }: { lic: LicenseRow }) => {
  const [copied, setCopied] = useState(false);
  const isLifetime = !lic.expires_at;
  // Cheap snapshot check; the live ticker lives inside <CountdownLabel/> below
  // so this card itself does NOT re-render every second.
  const isExpired = !isLifetime && new Date(lic.expires_at as string).getTime() <= Date.now();
  const typeLabel = lic.type === "trial" ? "Prueba" : lic.type === "assigned" ? "Asignada" : "De pago";
  const typeTone =
    lic.type === "trial"
      ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
      : "border-violet-400/30 bg-violet-500/10 text-violet-300";

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(lic.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [lic.license_key]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className={`rounded-full text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${typeTone}`}
        >
          {typeLabel}
        </Badge>
        <Badge
          variant="outline"
          className={`rounded-full text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${
            isExpired
              ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {isLifetime ? "Vitalicia" : isExpired ? "Expirada" : "Activa"}
        </Badge>
        {lic.display_name && (
          <span className="text-xs text-zinc-400 truncate">· {lic.display_name}</span>
        )}
        <span className="ml-auto text-[10px] text-zinc-500 uppercase tracking-widest">
          {new Date(lic.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="flex-1 min-w-0 font-mono text-sm text-white break-all bg-black/50 px-4 py-3 rounded-xl border border-white/10">
          {lic.license_key}
        </code>
        <Button
          onClick={copy}
          variant="outline"
          className="rounded-xl h-11 px-4 bg-white/5 border-white/10 hover:bg-white/10"
        >
          {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-3 flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {isLifetime ? (
          "Sin vencimiento"
        ) : isExpired ? (
          `Expiró: ${new Date(lic.expires_at as string).toLocaleString()}`
        ) : (
          <>Tiempo restante: <CountdownLabel expiresAt={lic.expires_at as string} /></>
        )}
      </p>
    </div>
  );
});
LicenseRowCard.displayName = "LicenseRowCard";


/* -------------------- TAB: EXTENSIÓN -------------------- */
const ExtensionTab = () => {
  const [file, setFile] = useState<{ name: string; size: number; updated_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.storage
        .from("extensions")
        .list("", { limit: 1, sortBy: { column: "updated_at", order: "desc" } });
      if (!error && data && data.length > 0) {
        const f = data[0];
        setFile({
          name: f.name,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          updated_at: f.updated_at ?? f.created_at ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("extensions")
        .createSignedUrl(file.name, 60, { download: file.name });
      if (error || !data?.signedUrl) throw error ?? new Error("No URL");
      window.location.href = data.signedUrl;
    } catch {
      toast.error("Error al descargar la extensión");
    } finally {
      setDownloading(false);
    }
  };

  const steps = [
    { n: 1, icon: <Download className="w-5 h-5" />, title: "Descargar", desc: "Consigue el pack oficial de la extensión." },
    { n: 2, icon: <Monitor className="w-5 h-5" />, title: "Extracción", desc: "Prepara los archivos en una carpeta local." },
    { n: 3, icon: <Chrome className="w-5 h-5" />, title: "Activación", desc: "Carga Chrome en modo desarrollador." },
  ];

  return (
    <section className="space-y-6">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden p-6 sm:p-10">
        <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-violet-600/20 blur-[100px] rounded-full" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
            >
              Acceso anticipado
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Potencia tu flujo con{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Lovable Infinito
              </span>
            </h2>
            <p className="text-zinc-400 max-w-xl mb-6">
              La extensión de alto rendimiento que integra Lovable directamente en tu navegador. Instalación simplificada en 3 pasos.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3">
            <Button
              onClick={handleDownload}
              disabled={!file || downloading || loading}
              className="rounded-full h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold shadow-lg shadow-violet-600/30"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Descargar extensión
            </Button>
            <p className="text-[10px] font-bold tracking-widest text-violet-300/70 uppercase text-center">
              ✓ Verificada y segura
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/5">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300">
                    {s.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 text-[10px] font-bold flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-6 -right-3 w-6 border-t border-dashed border-white/10" />
              )}
            </div>
          ))}
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-wrap gap-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            <span className="flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5" /> Chrome</span>
            <span className="flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5" /> Edge</span>
            <span className="flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5" /> Brave</span>
            <span className="flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5" /> Opera</span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase rounded-full border border-white/10 px-3 py-1">
            Modo desarrollador necesario
          </span>
        </div>
      </div>

      {/* File info */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando archivo...
              </p>
            ) : file ? (
              <>
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Actualizado:{" "}
                  {file.updated_at ? new Date(file.updated_at).toLocaleDateString() : "—"}
                </p>
              </>
            ) : (
              <p className="text-sm text-amber-400">
                La extensión aún no está disponible. El administrador la subirá pronto.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------- TAB: EXTRAS -------------------- */
const ExtrasTab = ({
  isBasicUser,
  navigate,
  role,
}: {
  isBasicUser: boolean;
  navigate: ReturnType<typeof useNavigate>;
  role?: string | null;
}) => (
  <section className="space-y-6">
    <Header eyebrow="Más herramientas" title="Extras" sub="Funciones avanzadas y accesos especiales." />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
            {isBasicUser ? <Lock className="w-5 h-5 text-zinc-400" /> : <ShieldCheck className="w-5 h-5 text-violet-300" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Panel de Revendedor</h3>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              {isBasicUser ? "Acceso limitado" : "Acceso completo"}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-5">
          {isBasicUser
            ? "Puedes acceder al panel, pero no podrás generar licencias hasta que el administrador active tu cuenta."
            : "Tu cuenta está activa. Accede al panel para gestionar licencias."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate({ to: "/reseller" })}
            className={`rounded-full h-10 px-5 font-semibold ${
              isBasicUser
                ? "bg-white/5 hover:bg-white/10 border border-white/10"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
            }`}
          >
            Ir al panel <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          {isBasicUser && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 self-center"
            >
              Pendiente de activación
            </Badge>
          )}
        </div>
      </div>

      {role === "superadmin" && (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/[0.04] backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Control Maestro</h3>
              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Solo administrador</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-5">
            Gestiona usuarios, roles, licencias asignadas y créditos del sistema.
          </p>
          <Button
            onClick={() => navigate({ to: "/superadmin" })}
            className="rounded-full h-10 px-5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 font-semibold"
          >
            Abrir panel <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  </section>
);

/* -------------------- SHARED -------------------- */
const Header = memo(({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <div>
    <p className="text-[10px] font-bold tracking-[0.25em] text-violet-300/70 uppercase mb-2">{eyebrow}</p>
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{title}</h2>
    {sub && <p className="text-zinc-400 text-sm">{sub}</p>}
  </div>
));
Header.displayName = "Header";

const toneMap = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-400/20", text: "text-violet-300" },
  fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-400/20", text: "text-fuchsia-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-400/20", text: "text-emerald-300" },
} as const;

const StatCard = memo(({
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
});
StatCard.displayName = "StatCard";

/* -------------------- TAB: TUTORIALES -------------------- */
const TUTORIALS = [
  { title: "Primeros pasos en Lovable Infinito", duration: "4:32", level: "Básico", desc: "Configura tu cuenta y activa tu primera llave." },
  { title: "Instalar la extensión de Chrome", duration: "3:15", level: "Básico", desc: "Guía paso a paso para instalar y enlazar." },
  { title: "Activar tu llave de licencia", duration: "2:48", level: "Básico", desc: "Cómo pegar tu llave y validar el acceso." },
  { title: "Optimiza tus prompts en Lovable", duration: "7:21", level: "Intermedio", desc: "Buenas prácticas para obtener mejores resultados." },
  { title: "Solución de errores frecuentes", duration: "5:09", level: "Intermedio", desc: "401, 429, 500 y cómo resolverlos rápido." },
  { title: "Gestión avanzada de créditos", duration: "6:42", level: "Avanzado", desc: "Aprovecha al máximo cada plan." },
];

const TutorialesTab = () => (
  <section className="space-y-6">
    <Header
      eyebrow="Centro de aprendizaje"
      title="Tutoriales en video"
      sub="Aprende a sacarle el máximo provecho a Lovable Infinito con nuestras lecciones."
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {TUTORIALS.map((t) => (
        <div key={t.title} className="group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden hover:border-violet-400/30 transition">
          <div className="relative aspect-video bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-pink-600/20 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
            <PlayCircle className="w-14 h-14 text-white/90 group-hover:scale-110 transition" />
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
              {t.duration}
            </span>
          </div>
          <div className="p-5">
            <Badge variant="outline" className="mb-3 rounded-full border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest">
              {t.level}
            </Badge>
            <h3 className="font-bold tracking-tight mb-1">{t.title}</h3>
            <p className="text-sm text-zinc-400">{t.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* -------------------- TAB: AYUDA + DOCUMENTACIÓN -------------------- */
type DocError = { code: string; title: string; cause: string; solution: string; category: string };

const DOC_ERRORS: DocError[] = [
  { code: "400", title: "Solicitud incorrecta", cause: "El comando o los datos enviados no tienen el formato correcto.", solution: "Verifica la sintaxis del comando. Revisa la documentación del comando que estás usando.", category: "Comando" },
  { code: "401", title: "No autorizado", cause: "Tu llave de licencia es inválida, ha expirado o no se envió correctamente.", solution: "Verifica tu llave en la pestaña Mis Llaves. Genera una nueva si es necesario.", category: "Autenticación" },
  { code: "402", title: "Pago requerido", cause: "Tu plan actual no incluye esta función o tus créditos se agotaron.", solution: "Actualiza tu plan en la sección Planes o recarga créditos.", category: "Créditos" },
  { code: "403", title: "Acceso denegado", cause: "No tienes permisos para usar este recurso con tu rol actual.", solution: "Contacta a soporte si crees que esto es un error.", category: "Licencia" },
  { code: "404", title: "No encontrado", cause: "El recurso solicitado no existe o ha sido eliminado.", solution: "Revisa que el endpoint o ID sea correcto.", category: "Comando" },
  { code: "408", title: "Tiempo de espera agotado", cause: "La solicitud tardó demasiado en procesarse.", solution: "Verifica tu conexión a internet y reintenta.", category: "Servidor" },
  { code: "409", title: "Conflicto", cause: "Hay un conflicto con el estado actual del recurso.", solution: "Recarga la extensión y vuelve a intentarlo.", category: "Comando" },
  { code: "410", title: "Recurso eliminado", cause: "El recurso ya no está disponible permanentemente.", solution: "Usa una versión actualizada de la extensión.", category: "Comando" },
  { code: "413", title: "Carga demasiado grande", cause: "El contenido enviado supera el tamaño permitido.", solution: "Divide tu solicitud en partes más pequeñas.", category: "Comando" },
  { code: "418", title: "Bloqueo de seguridad", cause: "Se detectó actividad inusual en tu cuenta.", solution: "Espera unos minutos y contacta a soporte si persiste.", category: "Licencia" },
  { code: "423", title: "Recurso bloqueado", cause: "Tu licencia está temporalmente bloqueada.", solution: "Contacta a soporte para desbloquear.", category: "Licencia" },
  { code: "425", title: "Demasiado pronto", cause: "Hiciste una solicitud antes de que la anterior terminara.", solution: "Espera a que termine la solicitud previa.", category: "Comando" },
  { code: "429", title: "Demasiadas solicitudes", cause: "Has superado el límite de uso permitido por minuto.", solution: "Espera 1-2 minutos antes de reintentar. Considera actualizar tu plan.", category: "Límite de uso" },
  { code: "451", title: "No disponible legalmente", cause: "El contenido no está disponible en tu región.", solution: "Usa una VPN o contacta a soporte.", category: "Licencia" },
  { code: "498", title: "Token expirado", cause: "Tu sesión ha expirado por inactividad.", solution: "Cierra sesión y vuelve a iniciar.", category: "Autenticación" },
  { code: "499", title: "Cliente cerró la conexión", cause: "La conexión se cerró antes de completar la solicitud.", solution: "Verifica tu conexión y reintenta.", category: "Servidor" },
  { code: "500", title: "Error interno del servidor", cause: "Hubo un fallo inesperado en nuestro servidor.", solution: "Espera unos minutos y reintenta. Si persiste, contacta soporte.", category: "Servidor" },
  { code: "502", title: "Puerta de enlace incorrecta", cause: "Nuestro servidor recibió una respuesta inválida.", solution: "Reintenta en unos segundos.", category: "Servidor" },
  { code: "503", title: "Servicio no disponible", cause: "Estamos en mantenimiento o bajo alta carga.", solution: "Consulta nuestro estado en redes sociales o reintenta más tarde.", category: "Servidor" },
  { code: "504", title: "Tiempo de espera de la puerta", cause: "El servidor no respondió a tiempo.", solution: "Reintenta en unos minutos.", category: "Servidor" },
  { code: "507", title: "Almacenamiento insuficiente", cause: "No hay espacio suficiente para procesar tu solicitud.", solution: "Contacta a soporte si persiste.", category: "Servidor" },
];

const DOC_CATEGORIES = ["Todas", "Autenticación", "Límite de uso", "Créditos", "Licencia", "Servidor", "Comando"];

const httpToneFor = (code: string) => {
  const n = parseInt(code, 10);
  if (n >= 500) return "border-red-500/30 bg-red-500/10 text-red-300";
  if (n === 401 || n === 403) return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (n === 429) return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  return "border-violet-500/30 bg-violet-500/10 text-violet-300";
};

const AyudaTab = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOC_ERRORS.filter((e) => {
      const matchCat = category === "Todas" || e.category === category;
      const matchQ = !q || e.code.includes(q) || e.title.toLowerCase().includes(q) || e.cause.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <section className="space-y-8">
      <Header
        eyebrow="Centro de ayuda"
        title="¿Cómo podemos ayudarte?"
        sub="Encuentra respuestas, documentación de errores y formas de contacto."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HelpContactCard
          icon={<MessageCircle className="w-5 h-5" />}
          title="WhatsApp"
          desc="Soporte rápido por chat"
          action="Escribir ahora"
          href="https://wa.me/000000000"
          tone="emerald"
        />
        <HelpContactCard
          icon={<Mail className="w-5 h-5" />}
          title="Correo electrónico"
          desc="soporte@lovableinfinito.com"
          action="Enviar correo"
          href="mailto:soporte@lovableinfinito.com"
          tone="violet"
        />
        <HelpContactCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Documentación"
          desc="Guías, manuales y FAQs"
          action="Ver guías"
          href="#docs"
          tone="fuchsia"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
        <h3 className="text-lg font-bold tracking-tight mb-4">Preguntas frecuentes</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1" className="border-white/10">
            <AccordionTrigger className="text-left">¿Cómo activo mi llave de licencia?</AccordionTrigger>
            <AccordionContent className="text-zinc-400">
              Ve a la pestaña Mis Llaves, copia tu llave y pégala en la extensión de Chrome al iniciar sesión.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2" className="border-white/10">
            <AccordionTrigger className="text-left">¿Puedo cambiar de plan en cualquier momento?</AccordionTrigger>
            <AccordionContent className="text-zinc-400">
              Sí, puedes actualizar tu plan cuando quieras desde la sección Planes. El tiempo restante se ajusta automáticamente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3" className="border-white/10">
            <AccordionTrigger className="text-left">¿Qué hago si mi llave deja de funcionar?</AccordionTrigger>
            <AccordionContent className="text-zinc-400">
              Verifica que esté vigente en Mis Llaves. Si el problema persiste, contáctanos por WhatsApp con tu correo.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4" className="border-white/10">
            <AccordionTrigger className="text-left">¿La extensión funciona en otros navegadores?</AccordionTrigger>
            <AccordionContent className="text-zinc-400">
              Actualmente está optimizada para Chrome y navegadores basados en Chromium (Edge, Brave, Opera).
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div id="docs" className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2 rounded-full border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest">
              Documentación
            </Badge>
            <h3 className="text-2xl font-bold tracking-tight">Catálogo de errores</h3>
            <p className="text-sm text-zinc-400 mt-1">Encuentra el código, su causa y la solución recomendada.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código o palabra…"
              className="pl-9 rounded-full bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {DOC_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active
                    ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 border-violet-400/30 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/90">
            <p className="font-bold mb-1">Tips rápidos</p>
            <ul className="list-disc pl-5 space-y-1 text-amber-100/80">
              <li>Reinicia la extensión antes de reportar un error.</li>
              <li>Verifica que tu llave esté vigente en Mis Llaves.</li>
              <li>Revisa tu conexión a internet y desactiva VPN si tienes problemas.</li>
              <li>Limpia el caché del navegador en caso de errores 4xx.</li>
              <li>Si nada funciona, contáctanos con la captura del error.</li>
            </ul>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-8">No encontramos errores para tu búsqueda.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filtered.map((e) => (
              <AccordionItem key={e.code} value={e.code} className="border-white/10">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${httpToneFor(e.code)}`}>
                      {e.code}
                    </span>
                    <span className="font-semibold">{e.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Causa</p>
                    <p>{e.cause}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Solución</p>
                    <p>{e.solution}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
};

const helpToneMap: Record<string, string> = {
  emerald: "from-emerald-500/30 to-emerald-500/0 text-emerald-300 border-emerald-400/30",
  violet: "from-violet-500/30 to-violet-500/0 text-violet-300 border-violet-400/30",
  fuchsia: "from-fuchsia-500/30 to-fuchsia-500/0 text-fuchsia-300 border-fuchsia-400/30",
};

const HelpContactCard = ({
  icon,
  title,
  desc,
  action,
  href,
  tone,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action: string;
  href: string;
  tone: "emerald" | "violet" | "fuchsia";
}) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className="group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-white/20 transition flex flex-col"
  >
    <div className={`w-11 h-11 rounded-2xl border bg-gradient-to-br ${helpToneMap[tone]} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="font-bold tracking-tight mb-1">{title}</h3>
    <p className="text-sm text-zinc-400 mb-4">{desc}</p>
    <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-violet-300 group-hover:gap-2 transition-all">
      {action} <ArrowRight className="w-4 h-4" />
    </span>
  </a>
);
