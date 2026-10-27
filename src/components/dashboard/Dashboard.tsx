import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtensionDownloadCard } from "./ExtensionDownloadCard";
import {
  Flame,
  Star,
  Crown,
  Check,
  Zap,
  Shield,
  Sparkles,
  LogOut,
  ExternalLink,
  Laptop,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const Dashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"planes" | "extension" | "interfaz">("planes");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white italic font-black">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>CARGANDO PANEL...</span>
        </div>
      </div>
    );
  }

  // Si el usuario es reseller o superadmin, ofrecer acceso directo a sus consolas dedicadas
  const isReseller = profile?.role === "reseller";
  const isSuperAdmin = profile?.role === "superadmin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-foreground selection:bg-primary/30">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0B101E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary),0.5)]">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black italic text-base tracking-tight text-white leading-tight">
                  LOVABLE <span className="text-primary text-glow">INFINITO</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  Panel de Usuario
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/superadmin" })}
                className="hidden sm:inline-flex border-primary/40 text-primary hover:bg-primary/10 text-xs font-bold uppercase tracking-wider"
              >
                Panel SuperAdmin
              </Button>
            )}
            {isReseller && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/reseller" })}
                className="hidden sm:inline-flex border-accent/40 text-accent hover:bg-accent/10 text-xs font-bold uppercase tracking-wider"
              >
                Panel Reseller
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-semibold gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-primary/15 via-[#0d1428] to-[#080d1a] p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                  <UserCheck className="w-3 h-3 mr-1" /> Builder Activo
                </Badge>
                {profile?.role && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                    {profile.role}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black italic tracking-tight text-white mb-2">
                Bienvenido a tu Espacio Ilimitado
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Conectado como <span className="text-white font-mono">{user?.email}</span>. Activa tu licencia, descarga la extensión oficial y construye en Lovable sin cuotas por mensaje.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setActiveTab("interfaz")}
                variant="outline"
                className="border-white/15 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider gap-2"
              >
                <Laptop className="w-4 h-4 text-primary" /> Ver Entorno Lovable
              </Button>
              <Button
                onClick={() => setActiveTab("planes")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider gap-2 shadow-lg shadow-primary/25"
              >
                <Sparkles className="w-4 h-4" /> Activar Plan
              </Button>
            </div>
          </div>
        </div>

        {/* View Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("planes")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "planes"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            Planes y Activación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interfaz")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "interfaz"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            Vista Previa de la Interfaz
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("extension")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "extension"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            Extensión Chrome
          </button>
        </div>

        {/* TAB 1: INTERFAZ SHOWCASE (INTEGRACIÓN DE LA IMAGEN banner_hero.png) */}
        {activeTab === "interfaz" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0C1222] p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-primary">
                      Entorno de Trabajo
                    </span>
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tight text-white mt-1">
                    Interfaz de Lovable con FlowPro Integrado
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tu espacio oficial de Lovable con el generador de créditos perpetuos en segundo plano.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <a href="https://lovable.dev" target="_blank" rel="noreferrer">
                    Abrir Lovable.dev <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>

              {/* Showcase Frame de la Imagen */}
              <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-950 group">
                {/* Header Mockup */}
                <div className="bg-[#151B2B] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    <span className="text-[11px] font-mono text-zinc-400 ml-3">
                      https://lovable.dev/app/flowpro
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    FlowPro Conectado
                  </span>
                </div>

                <div className="relative">
                  <img
                    src="/images/banner_hero.png"
                    alt="Interfaz oficial de Lovable con FlowPro créditos ilimitados"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                    <Zap className="w-4 h-4" /> Créditos Automáticos
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Los mensajes y prompts se auto-renuevan en tiempo real para evitar que tus sesiones se corten.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                    <Shield className="w-4 h-4" /> Compatibilidad 100%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Funciona directamente en tu cuenta existente de Lovable sin necesidad de cambiar tus proyectos.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" /> Multi-Proyecto
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Crea prototipos, añade páginas, edita componentes y exporta código a GitHub libremente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLANES DISPONIBLES */}
        {activeTab === "planes" && <PlanesTab navigate={navigate} />}

        {/* TAB 3: EXTENSIÓN */}
        {activeTab === "extension" && (
          <div className="space-y-6">
            <ExtensionDownloadCard />
            <Card className="bg-[#0A101F] border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Instrucciones de Instalación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Descarga el archivo ZIP desde el botón de arriba.</li>
                  <li>Descomprime el archivo en una carpeta de tu ordenador.</li>
                  <li>Abre Google Chrome y dirígete a <code className="text-primary font-mono">chrome://extensions</code>.</li>
                  <li>Activa el <strong>Modo de desarrollador</strong> en la esquina superior derecha.</li>
                  <li>Haz clic en <strong>Cargar descomprimida</strong> y selecciona la carpeta de la extensión.</li>
                  <li>Ingresa a Lovable.dev e introduce tu clave de licencia para disfrutar de créditos ilimitados.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

const PlanesTab = ({ navigate }: { navigate: (to: { to: string; params?: any }) => void }) => {
  const plans = [
    {
      planId: "diario",
      name: "Plan Diario",
      duration: "24 Horas",
      pricePen: "S/ 39.00",
      priceUsd: "≈ $10.50 USD",
      icon: <Flame className="w-5 h-5" />,
      tone: "violet" as const,
      features: [
        "Lovable ilimitado por 24 horas",
        "Sin consumo de créditos oficiales",
        "Acceso instantáneo al panel",
        "Soporte por WhatsApp en español",
      ],
    },
    {
      planId: "semanal",
      name: "Plan Semanal",
      duration: "7 Días",
      pricePen: "S/ 79.00",
      priceUsd: "≈ $21.00 USD",
      popular: true,
      icon: <Star className="w-5 h-5" />,
      tone: "fuchsia" as const,
      features: [
        "Lovable ilimitado por 7 días",
        "Sin consumo de créditos oficiales",
        "Acceso prioritario y panel exclusivo",
        "Soporte prioritario 24/7",
        "Guía de optimización de prompts",
      ],
    },
    {
      planId: "quincenal",
      name: "Plan Quincenal",
      duration: "15 Días",
      pricePen: "S/ 149.00",
      priceUsd: "≈ $39.50 USD",
      icon: <Crown className="w-5 h-5" />,
      tone: "pink" as const,
      features: [
        "Lovable ilimitado por 15 días continuos",
        "Sin consumo de créditos oficiales",
        "Acceso multi-proyecto sin restricciones",
        "Soporte VIP directo",
        "Actualizaciones de extensión garantizadas",
      ],
    },
  ];

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
          Planes en Soles (PEN)
        </span>
        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white mt-3">
          Elige el ritmo que necesitas
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Paga en Soles (S/) vía Izipay, Yape, Plin o Tarjetas bancarias sin cargos internacionales en USD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl border bg-white/[0.03] backdrop-blur-xl p-6 transition hover:-translate-y-1 ${
              p.popular ? "border-primary/60 shadow-2xl shadow-primary/20 ring-1 ring-primary/40" : "border-white/10"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-md">
                ⭐ Más popular
              </span>
            )}
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mb-5">
              {p.icon}
            </div>
            <h3 className="text-xl font-black italic tracking-tight text-white">{p.name}</h3>
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase mb-4">{p.duration}</p>
            <div className="mb-1">
              <span className="text-4xl font-black tracking-tight text-white">{p.pricePen}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 font-mono">
              {p.priceUsd} • Tarifa final en PEN
            </p>
            <ul className="space-y-2 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate({ to: `/checkout/${p.planId}` })}
              className={`w-full rounded-xl h-12 font-black uppercase italic tracking-wider ${
                p.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              Activar acceso <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
