import { useEffect, useState } from "react";
import { LayoutDashboard, Key, ClipboardList, History, Users, Wallet, Settings, LifeBuoy, Zap, Plus, Infinity, CalendarDays, LogOut, Coins, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { resellerApi } from "@/services/resellerApi";

interface License {
  id: string;
  code: string;
  type: string;
  status: string | null;
  created_at: string;
}

export const ResellerDashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [fetchingLicenses, setFetchingLicenses] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState("");
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();
    setCredits(data?.credits ?? 0);
  };

  const fetchApiToken = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("reseller_api_token")
      .eq("id", user.id)
      .maybeSingle();
    setApiToken(data?.reseller_api_token ?? null);
  };

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from("reseller_licenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped: License[] = (data || []).map((r: any) => ({
        id: r.id,
        code: r.license_key,
        type: r.type,
        status: r.expires_at && new Date(r.expires_at) < new Date() ? 'expired' : 'active',
        created_at: r.created_at,
      }));
      setLicenses(mapped);
    } catch (error: any) {
      toast.error("Error al cargar licencias: " + error.message);
    } finally {
      setFetchingLicenses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLicenses();
      fetchCredits();
      fetchApiToken();
    }
  }, [user]);

  const openGenerateDialog = (type: string) => {
    setPendingType(type);
    setLicenseName("");
    setNameDialogOpen(true);
  };

  const generateLicense = async () => {
    if (isGenerating || !pendingType) return;
    const type = pendingType;
    const isTest = type.toLowerCase() === 'test';
    const name = licenseName.trim();

    if (!name) {
      toast.error("Ingresa un nombre para la licencia");
      return;
    }

    if (!apiToken) {
      toast.error("Tu cuenta no tiene un token de API. Contacta al superadmin.");
      return;
    }

    if (!isTest && credits < 1) {
      toast.error("Sin créditos. Contacta al superadmin para recargar.");
      return;
    }

    setIsGenerating(true);
    let creditConsumed = false;
    try {
      if (!isTest) {
        const { data: consumed, error: rpcError } = await supabase.rpc("consume_credit");
        if (rpcError) throw rpcError;
        if (!consumed) {
          toast.error("Sin créditos disponibles.");
          await fetchCredits();
          return;
        }
        creditConsumed = true;
      }

      // Llamada real a la API del proveedor
      let apiResp;
      if (isTest) {
        apiResp = await resellerApi.generateTrial(apiToken, name, 15);
      } else if (type.toLowerCase() === 'lifetime') {
        apiResp = await resellerApi.generateLicense(apiToken, name, 0, true);
      } else {
        // monthly = 30 días por defecto
        apiResp = await resellerApi.generateLicense(apiToken, name, 30, false);
      }

      if (!apiResp?.license_key) {
        throw new Error(apiResp?.message || "La API no devolvió una clave válida");
      }

      // Guardar en nuestra DB
      await resellerApi.saveLicenseLocally(user!.id, apiResp, name);

      await fetchLicenses();
      if (!isTest) await fetchCredits();
      setGeneratedCode(apiResp.license_key);
      setCopied(false);
      setNameDialogOpen(false);
      setResultDialogOpen(true);
      toast.success(isTest ? "Licencia de prueba generada (sin costo)" : "Licencia generada (−1 crédito)");
    } catch (error: any) {
      // Reembolsar crédito si la API falló después de consumirlo
      if (creditConsumed) {
        try { await supabase.rpc("add_credits", { _target: user!.id, _amount: 1 }); } catch {}
        await fetchCredits();
      }
      toast.error("Error al generar licencia: " + (error?.message || "desconocido"));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Clave copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white italic font-black">ENTRANDO AL PANEL...</div>;
  }

  // Pending activation screen for non-activated users
  if (profile && profile.role !== 'reseller' && profile.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <Badge variant="outline" className="mb-3 rounded-none border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1">
            Cuenta pendiente
          </Badge>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-3">Esperando activación</h1>
          <p className="text-muted-foreground mb-2">
            Tu cuenta aún no ha sido activada por el administrador.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Una vez activada, podrás generar y gestionar licencias (1 día, 7 días, 30 días y 60 días) desde este panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate({ to: "/dashboard" })} className="bg-primary text-white font-black uppercase tracking-tighter italic h-12 px-8 rounded-none">
              Volver a mi Panel
            </Button>
            <Button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} variant="outline" className="font-black uppercase tracking-tighter italic h-12 px-8 rounded-none border-white/10">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/[0.06] bg-gradient-to-b from-[#070B18] to-[#03060F] hidden lg:flex flex-col relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.08),transparent_60%)] pointer-events-none" />
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-10 group px-2">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                <Zap className="w-5 h-5 text-white fill-white" />
                <div className="absolute inset-0 rounded-xl bg-primary/40 blur-lg -z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">RESELLER</span>
                <span className="text-[10px] text-primary tracking-[0.2em] uppercase">Lovable Infinito</span>
              </div>
            </div>

            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mb-3">Menú</p>
            <nav className="space-y-1">
              <ResellerNavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Panel" active />
              <ResellerNavItem icon={<Key className="w-4 h-4" />} label="Generar Licencias" />
              <ResellerNavItem icon={<ClipboardList className="w-4 h-4" />} label="Licencias Activas" />
              <ResellerNavItem icon={<History className="w-4 h-4" />} label="Historial" />
              <ResellerNavItem icon={<Users className="w-4 h-4" />} label="Clientes" />
              <ResellerNavItem icon={<Wallet className="w-4 h-4" />} label="Financiero" />
            </nav>

            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mt-8 mb-3">Cuenta</p>
            <nav className="space-y-1">
              <ResellerNavItem icon={<Settings className="w-4 h-4" />} label="Configuración" />
              <ResellerNavItem icon={<LifeBuoy className="w-4 h-4" />} label="Soporte" />
            </nav>
          </div>
          <div className="mt-auto p-4 relative z-10">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Saldo</p>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">{credits}</p>
              <p className="text-[10px] text-muted-foreground">créditos disponibles</p>
            </div>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors rounded-xl">
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Cerrar sesión</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#02060E] relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Revendedor</h1>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Bienvenido de vuelta, gestiona tus claves y clientes.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reseller</span>
                    <span className="text-xs text-white font-medium truncate max-w-[160px]">{profile?.email || 'cuenta'}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative rounded-xl bg-white/[0.03] border border-white/10 w-10 h-10">
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#02060E]" />
                  <LifeBuoy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                accent
                icon={<Coins className="w-4 h-4" />}
                title="Créditos"
                value={credits.toString()}
                subtitle="1 crédito = 1 licencia"
              />
              <MetricCard
                icon={<Key className="w-4 h-4" />}
                title="Generadas"
                value={licenses.length.toString()}
                subtitle="Total acumulado"
              />
              <MetricCard
                icon={<Zap className="w-4 h-4" />}
                title="Activas"
                value={licenses.filter(l => l.status === 'active').length.toString()}
                subtitle="En uso por clientes"
              />
              <MetricCard
                icon={<Plus className="w-4 h-4" />}
                title="Pruebas"
                value={licenses.filter(l => l.type === 'test' || l.type === 'trial').length.toString()}
                subtitle="Trial gratuitas"
              />
            </div>

            {/* License Generation */}
            <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0A1224] via-[#0A101F] to-[#070C18] p-8 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Generar Nueva Licencia</h2>
                    <p className="text-muted-foreground text-sm mt-1">Elige el tipo de clave que deseas emitir</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Coins className="w-4 h-4 text-primary" />
                    <span><span className="text-white font-bold">{credits}</span> créditos</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <LicenseTypeCard
                    icon={<Plus className="w-6 h-6" />}
                    title="Licencia de Prueba"
                    description="15 minutos"
                    badge="GRATIS"
                    badgeColor="emerald"
                    onClick={() => openGenerateDialog('test')}
                  />
                  <LicenseTypeCard
                    icon={<CalendarDays className="w-6 h-6" />}
                    title="Licencia Mensual"
                    description="Acceso por 30 días"
                    badge="1 CRÉDITO"
                    badgeColor="primary"
                    onClick={() => openGenerateDialog('monthly')}
                  />
                  <LicenseTypeCard
                    icon={<Infinity className="w-6 h-6" />}
                    title="Licencia Vitalicia"
                    description="Acceso ilimitado"
                    badge="1 CRÉDITO"
                    badgeColor="primary"
                    onClick={() => openGenerateDialog('lifetime')}
                  />
                </div>
              </div>
            </div>

            {/* Recent Licenses */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A101F]/80 backdrop-blur overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Licencias Recientes</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Historial de las claves emitidas</p>
                </div>
                <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-white/[0.03] border border-white/10">
                  {licenses.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] bg-white/[0.015]">
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Código</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {fetchingLicenses ? (
                      <tr><td colSpan={4} className="p-12 text-center text-muted-foreground text-xs uppercase tracking-widest">Cargando datos…</td></tr>
                    ) : licenses.length > 0 ? (
                      licenses.slice(0, 10).map((l) => (
                        <LicenseRow
                          key={l.id}
                          type={l.type.toUpperCase()}
                          code={l.code}
                          status={l.status}
                          date={new Date(l.created_at).toLocaleDateString()}
                        />
                      ))
                    ) : (
                      <tr><td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Key className="w-8 h-8 opacity-30" />
                          <p className="text-xs uppercase tracking-widest">Aún no has generado licencias</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary fill-primary" />
              </div>
              <p className="text-xs text-white/80">Genera licencias y aumenta tus ganancias revendiendo <span className="text-white font-bold">Lovable Infinito</span>.</p>
            </div>
          </div>
        </main>
      </div>


      {/* Name input dialog */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent className="bg-[#0A101F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="italic uppercase tracking-tight">
              Nombre de la licencia {pendingType ? `(${pendingType.toUpperCase()})` : ''}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Asigna un nombre para identificar al cliente o destino de esta clave.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="license-name">Nombre / Cliente</Label>
            <Input
              id="license-name"
              autoFocus
              value={licenseName}
              onChange={(e) => setLicenseName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generateLicense(); }}
              placeholder="Ej: Juan Pérez"
              maxLength={50}
              className="bg-[#02060E] border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNameDialogOpen(false)} disabled={isGenerating}>
              Cancelar
            </Button>
            <Button
              onClick={generateLicense}
              disabled={isGenerating || !licenseName.trim()}
              className="bg-primary hover:bg-primary/90 text-white font-black italic uppercase"
            >
              {isGenerating ? 'Generando...' : 'Generar Clave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="bg-[#0A101F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="italic uppercase tracking-tight">Licencia generada</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Copia esta clave y entrégala al cliente. No se mostrará de nuevo en este diálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#02060E] border border-primary/30 rounded-lg p-4 flex items-center justify-between gap-3">
            <code className="text-primary font-mono text-sm break-all">{generatedCode}</code>
            <Button size="icon" variant="ghost" onClick={copyCode} className="shrink-0 text-white hover:bg-white/5">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={copyCode} className="bg-primary hover:bg-primary/90 text-white font-black italic uppercase">
              {copied ? 'Copiado ✓' : 'Copiar Clave'}
            </Button>
            <Button variant="ghost" onClick={() => setResultDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ResellerNavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all group relative ${
    active
      ? 'text-white bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 font-semibold'
      : 'text-muted-foreground hover:text-white hover:bg-white/[0.04] font-medium'
  }`}>
    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.6)]" />}
    <span className={active ? 'text-primary' : ''}>{icon}</span>
    {label}
  </a>
);

const MetricCard = ({ title, value, subtitle, icon, accent = false }: { title: string, value: string, subtitle: string, icon?: React.ReactNode, accent?: boolean }) => (
  <div className={`relative rounded-2xl border p-5 overflow-hidden group transition-all hover:-translate-y-0.5 ${
    accent
      ? 'border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent'
      : 'border-white/[0.06] bg-[#0A101F]'
  }`}>
    {accent && <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-3xl pointer-events-none" />}
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/[0.04] text-muted-foreground border border-white/10'}`}>
            {icon}
          </div>
        )}
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent ? 'text-primary' : 'text-muted-foreground'}`}>{title}</p>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight tabular-nums">{value}</h3>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const LicenseTypeCard = ({ icon, title, description, badge, badgeColor = 'primary', onClick }: { icon: React.ReactNode, title: string, description: string, badge?: string, badgeColor?: 'primary' | 'emerald', onClick: () => void }) => (
  <div className="relative bg-gradient-to-br from-[#0F1729] to-[#0A101F] border border-white/[0.08] p-6 rounded-2xl flex flex-col group hover:border-primary/40 transition-all overflow-hidden hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/[0.04] group-hover:to-transparent transition-all pointer-events-none" />
    <div className="relative flex items-start justify-between mb-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
        {icon}
      </div>
      {badge && (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
          badgeColor === 'emerald'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-primary bg-primary/10 border-primary/20'
        }`}>{badge}</span>
      )}
    </div>
    <div className="relative flex-1">
      <h3 className="text-base font-bold text-white tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-6">{description}</p>
    </div>
    <Button onClick={onClick} className="relative w-full bg-white/[0.04] hover:bg-primary text-white font-semibold h-11 rounded-xl border border-white/10 hover:border-primary transition-all group/btn">
      <span className="flex items-center justify-center gap-2">
        Generar Clave
        <Key className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
      </span>
    </Button>
  </div>
);

const LicenseRow = ({ type, code, status, date }: { type: string, code: string, status: string | null, date: string }) => {
  const isActive = status === 'active';
  const isExpired = status === 'expired';
  return (
    <tr className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-1 rounded-md bg-primary/10 border border-primary/20">{type}</span>
      </td>
      <td className="px-6 py-4 font-mono text-white/80 text-xs">{code}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
          isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : isExpired ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-red-400 bg-red-500/10 border-red-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : isExpired ? 'bg-amber-400' : 'bg-red-400'}`} />
          {isActive ? 'Activa' : isExpired ? 'Expirada' : 'Inactiva'}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-muted-foreground text-xs tabular-nums">{date}</td>
    </tr>
  );
};
