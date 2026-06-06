import { useEffect, useState } from "react";
import { LayoutDashboard, Key, ClipboardList, History, Users, Wallet, Settings, LifeBuoy, Zap, Plus, Infinity, CalendarDays, LogOut, Coins, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

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

  useEffect(() => {
    const getLicenses = async () => {
      try {
        const { data, error } = await supabase
          .from("licenses")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLicenses(data || []);
      } catch (error: any) {
        toast.error("Error al cargar licencias: " + error.message);
      } finally {
        setFetchingLicenses(false);
      }
    };

    if (user) {
      getLicenses();
      fetchCredits();
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

    if (!isTest && credits < 1) {
      toast.error("Sin créditos. Contacta al superadmin para recargar.");
      return;
    }

    setIsGenerating(true);
    try {
      if (!isTest) {
        const { data: consumed, error: rpcError } = await supabase.rpc("consume_credit");
        if (rpcError) throw rpcError;
        if (!consumed) {
          toast.error("Sin créditos disponibles.");
          await fetchCredits();
          return;
        }
      }

      const safeName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 12) || 'LIC';
      const code = `${type.toUpperCase()}-${safeName}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data, error } = await supabase
        .from("licenses")
        .insert([{
          code,
          type: type.toLowerCase() as any,
          created_by: user?.id,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      setLicenses([data, ...licenses]);
      if (!isTest) await fetchCredits();
      setGeneratedCode(code);
      setCopied(false);
      setNameDialogOpen(false);
      setResultDialogOpen(true);
      toast.success(isTest ? "Licencia de prueba generada (sin costo)" : "Licencia generada (−1 crédito)");
    } catch (error: any) {
      toast.error("Error al generar licencia: " + error.message);
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

  // Permission check
  if (profile && profile.role !== 'reseller' && profile.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Key className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-black italic uppercase mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6 text-center">No tienes permisos de revendedor.</p>
        <Button onClick={() => navigate({ to: "/dashboard" })} className="bg-primary text-white font-black uppercase tracking-tighter italic h-12 px-8">
          Volver a mi Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <AnnouncementBar />
      <div className="flex-1 mt-10 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#050A15] hidden lg:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-10 group px-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary),0.4)]">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white uppercase italic">Panel de Revendedor</span>
            </div>

            <nav className="space-y-1">
              <ResellerNavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Panel" active />
              <ResellerNavItem icon={<Key className="w-5 h-5" />} label="Generar Licencias" />
              <ResellerNavItem icon={<ClipboardList className="w-5 h-5" />} label="Licencias Activas" />
              <ResellerNavItem icon={<History className="w-5 h-5" />} label="Historial" />
              <ResellerNavItem icon={<Users className="w-5 h-5" />} label="Clientes" />
              <ResellerNavItem icon={<Wallet className="w-5 h-5" />} label="Financiero" />
              <ResellerNavItem icon={<Settings className="w-5 h-5" />} label="Configuración" />
              <ResellerNavItem icon={<LifeBuoy className="w-5 h-5" />} label="Soporte" />
            </nav>
          </div>
            <div className="mt-auto p-6 border-t border-white/5">
              <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="w-full justify-start gap-3 text-muted-foreground hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
                Salir al Inicio
              </Button>
            </div>
          </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#02060E]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white italic uppercase tracking-tight">Panel de Revendedor</h1>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-md py-0.5 font-bold text-[10px]">Activo</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#02060E]" />
                  <LifeBuoy className="w-6 h-6" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                   <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Reseller Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-xl border-primary/40 bg-gradient-to-br from-primary/10 to-[#0A101F] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">CRÉDITOS</p>
                </div>
                <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{credits}</h3>
                <p className="text-xs text-muted-foreground">1 crédito = 1 licencia</p>
              </Card>
              <MetricCard title="LICENCIAS GENERADAS" value={licenses.length.toString()} subtitle="Total de licencias" />
              <MetricCard title="ACTIVAS" value={licenses.filter(l => l.status === 'active').length.toString()} subtitle="Licencias activas" />
              <MetricCard title="PRUEBA" value={licenses.filter(l => l.type === 'test').length.toString()} subtitle="Licencias de prueba" />
            </div>

            {/* License Generation Section */}
            <Card className="rounded-xl border-white/5 bg-[#0A101F] p-8">
              <h2 className="text-xl font-bold text-white italic uppercase tracking-tight mb-2">Generar Nueva Licencia</h2>
              <p className="text-muted-foreground text-sm mb-8">Elige el tipo de licencia</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LicenseTypeCard 
                  icon={<Plus className="w-10 h-10 text-primary" />} 
                  title="LICENCIA DE PRUEBA" 
                  description="Período de prueba" 
                  onClick={() => openGenerateDialog('test')}
                />
                <LicenseTypeCard 
                  icon={<CalendarDays className="w-10 h-10 text-primary" />} 
                  title="LICENCIA MENSUAL" 
                  description="Acceso por 30 días" 
                  onClick={() => openGenerateDialog('monthly')}
                />
                <LicenseTypeCard 
                  icon={<Infinity className="w-10 h-10 text-primary" />} 
                  title="LICENCIA VITALICIA" 
                  description="Acceso de por vida" 
                  onClick={() => openGenerateDialog('lifetime')}
                />
              </div>
            </Card>

            {/* Recent Licenses Table */}
            <Card className="rounded-xl border-white/5 bg-[#0A101F] overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-white italic uppercase tracking-tight">Licencias Recientes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/[0.01]">
                      <th className="px-6 py-4">TIPO</th>
                      <th className="px-6 py-4">CÓDIGO</th>
                      <th className="px-6 py-4">ESTADO</th>
                      <th className="px-6 py-4 text-right">FECHA</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {fetchingLicenses ? (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic uppercase text-xs">Cargando datos...</td></tr>
                    ) : licenses.length > 0 ? (
                      licenses.map((l) => (
                        <LicenseRow 
                          key={l.id}
                          type={l.type.toUpperCase()} 
                          code={l.code} 
                          status={l.status} 
                          date={new Date(l.created_at).toLocaleDateString()} 
                        />
                      ))
                    ) : (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic uppercase text-xs">Ninguna licencia generada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary fill-primary" />
              <p className="text-xs text-white/90">Genera licencias y aumenta tus ganancias revendiendo Lovable Adict!</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const ResellerNavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all group ${
    active ? 'text-white bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'
  }`}>
    {icon}
    {label}
  </a>
);

const MetricCard = ({ title, value, subtitle }: { title: string, value: string, subtitle: string }) => (
  <Card className="rounded-xl border-white/5 bg-[#0A101F] p-6">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{value}</h3>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </Card>
);

const LicenseTypeCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
  <div className="bg-[#111827] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-all">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-2">{title}</h3>
    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-6">{description}</p>
    <Button onClick={onClick} className="w-full bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-tighter h-11 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
      GENERAR
    </Button>
  </div>
);

const LicenseRow = ({ type, code, status, date }: { type: string, code: string, status: string | null, date: string }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
    <td className="px-6 py-4 text-white font-medium">{type}</td>
    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{code}</td>
    <td className="px-6 py-4">
      <Badge className={`${status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} rounded-sm py-0.5 px-2 font-bold text-[10px]`}>
        {status === 'active' ? 'Activa' : 'Inactiva'}
      </Badge>
    </td>
    <td className="px-6 py-4 text-right text-muted-foreground font-medium">{date}</td>
  </tr>
);
