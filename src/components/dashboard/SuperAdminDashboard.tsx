import { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, BarChart3, ShieldAlert, Settings, 
  LogOut, Search, MoreVertical, CheckCircle2, XCircle, 
  TrendingUp, DollarSign, Key, RefreshCw, Trash2, ShieldCheck, 
  Clock, Plus, CreditCard, Activity, Zap, Globe, AlertCircle,
  Menu, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";

import { useAuth, Profile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { resellerApi, ResellerStatus } from "@/services/resellerApi";
import { useServerFn } from "@tanstack/react-start";
import { setUserActivation } from "@/lib/user-actions.functions";

interface ExtendedProfile extends Omit<Profile, 'reseller_api_token'> {
  reseller_api_token?: string | null;
  credits?: number;
}

export const SuperAdminDashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "users" | "keys" | "stats" | "system">("summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Reseller states
  const [resellerToken, setResellerToken] = useState("");
  const [resellerStatus, setResellerStatus] = useState<ResellerStatus | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyType, setKeyType] = useState<"trial" | "days" | "lifetime">("days");
  const [keyDisplayName, setKeyDisplayName] = useState("");
  const [keyDays, setKeyDays] = useState("30");
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
  const navigate = useNavigate();

  const [rechargeTarget, setRechargeTarget] = useState<ExtendedProfile | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState("10");
  const [isRecharging, setIsRecharging] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const activateFn = useServerFn(setUserActivation);

  const handleToggleActivation = async (u: ExtendedProfile) => {
    const isActive = u.role === "reseller" || u.role === "superadmin";
    if (u.role === "superadmin") {
      toast.error("No se puede desactivar a un superadmin");
      return;
    }
    setTogglingUserId(u.id);
    try {
      const res = await activateFn({ data: { targetUserId: u.id, activate: !isActive } });
      toast.success(isActive ? "Cuenta desactivada" : "Cuenta activada como revendedor");
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: res.role } : p)));
    } catch (e: any) {
      toast.error(e.message || "Error al cambiar estado");
    } finally {
      setTogglingUserId(null);
    }
  };

  const loadUsersWithCredits = async () => {
    try {
      const [{ data: profilesData, error: pErr }, { data: creditsData }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_credits").select("user_id, credits"),
      ]);
      if (pErr) throw pErr;
      const creditMap = new Map((creditsData || []).map((c: any) => [c.user_id, c.credits]));
      const merged = (profilesData || []).map((p: any) => ({ ...p, credits: creditMap.get(p.id) ?? 0 }));
      setUsers(merged);

      const currentProfile = profilesData?.find(p => p.id === user?.id);
      if (currentProfile?.reseller_api_token) {
        setResellerToken(currentProfile.reseller_api_token);
        fetchResellerStatus(currentProfile.reseller_api_token);
      }
    } catch (error: any) {
      toast.error("Error al cargar usuarios: " + error.message);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (user) loadUsersWithCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRecharge = async () => {
    if (!rechargeTarget) return;
    const amount = parseInt(rechargeAmount, 10);
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Cantidad inválida");
      return;
    }
    setIsRecharging(true);
    try {
      const { data, error } = await supabase.rpc("add_credits", {
        _target: rechargeTarget.id,
        _amount: amount,
      });
      if (error) throw error;
      toast.success(`Créditos actualizados. Total: ${data}`);
      setRechargeTarget(null);
      setRechargeAmount("10");
      await loadUsersWithCredits();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setIsRecharging(false);
    }
  };

  const fetchResellerStatus = async (token: string) => {
    try {
      const status = await resellerApi.getStatus(token);
      setResellerStatus(status);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const fetchLicenses = async () => {
    if (!resellerToken) return;
    setIsLoadingLicenses(true);
    try {
      const data = await resellerApi.listLicenses(resellerToken);
      setLicenses(data.licenses || []);
    } catch (error: any) {
      toast.error("Error al cargar licencias: " + error.message);
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  const updateToken = async () => {
    if (!user) return;
    setIsUpdatingToken(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ reseller_api_token: resellerToken })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success("Token actualizado correctamente");
      fetchResellerStatus(resellerToken);
    } catch (error: any) {
      toast.error("Error al actualizar token: " + error.message);
    } finally {
      setIsUpdatingToken(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!resellerToken) {
      toast.error("Debes configurar tu API Token primero");
      return;
    }
    
    setIsGeneratingKey(true);
    try {
      let result;
      if (keyType === "trial") {
        result = await resellerApi.generateTrial(resellerToken, keyDisplayName);
      } else if (keyType === "lifetime") {
        result = await resellerApi.generateLicense(resellerToken, keyDisplayName, 0, true);
      } else {
        result = await resellerApi.generateLicense(resellerToken, keyDisplayName, parseInt(keyDays));
      }
      
      if (result.success) {
        toast.success(`Llave generada: ${result.license_key}`);
        if (user) await resellerApi.saveLicenseLocally(user.id, result, keyDisplayName);
        fetchResellerStatus(resellerToken);
        fetchLicenses();
        setKeyDisplayName("");
      }
    } catch (error: any) {
      toast.error("Error al generar llave: " + error.message);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleResetHwid = async (key: string) => {
    try {
      await resellerApi.resetHwid(resellerToken, key);
      toast.success("HWID reseteado");
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRevoke = async (key: string) => {
    try {
      await resellerApi.revokeLicense(resellerToken, key);
      toast.success("Licencia revocada");
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando...</div>;
  }

  // Check if user is actually a superadmin (only if profile loaded)
  if (profile && profile.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-black italic uppercase mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6 text-center">No tienes permisos para acceder al Panel Maestro.</p>
        <Button onClick={() => navigate({ to: "/dashboard" })} className="bg-primary text-white font-black uppercase tracking-tighter italic h-12 px-8">
          Volver a mi Panel
        </Button>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-white overflow-hidden font-sans">
      
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-14 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-[#121214] border-white/5"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#121214] border-r border-white/5 
        transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col pt-10
      `}>
        <div className="p-8 flex-1">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-destructive to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-destructive/20 ring-1 ring-white/10">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter italic block leading-none">SUPER<span className="text-destructive">ADMIN</span></span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">Master Control</span>
            </div>
          </div>

          <nav className="space-y-1">
            <AdminNavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Resumen General" 
              active={activeTab === "summary"} 
              onClick={() => { setActiveTab("summary"); setSidebarOpen(false); }}
            />
            <AdminNavItem 
              icon={<Users className="w-4 h-4" />} 
              label="Gestión Usuarios" 
              active={activeTab === "users"} 
              onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
            />
            <AdminNavItem 
              icon={<Key className="w-4 h-4" />} 
              label="Sistema Licencias" 
              active={activeTab === "keys"} 
              onClick={() => { setActiveTab("keys"); setSidebarOpen(false); }}
            />
            <AdminNavItem 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Estadísticas" 
              active={activeTab === "stats"}
              onClick={() => { setActiveTab("stats"); setSidebarOpen(false); }} 
            />
            <AdminNavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Configuración" 
              active={activeTab === "system"}
              onClick={() => { setActiveTab("system"); setSidebarOpen(false); }} 
            />
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0A0A0B]/50">
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 text-center">Modo Administrador</p>
            <p className="text-[11px] text-white/60 text-center leading-tight">Acceso total al núcleo del sistema</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5 transition-all h-11 px-4 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0B] relative pt-10">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="rounded-full border-destructive/20 bg-destructive/5 text-destructive text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                  Panel Principal
                </Badge>
                <div className="h-[1px] w-12 bg-white/10" />
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">v4.0.2 Stable</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">
                Panel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Control</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 uppercase font-black text-[10px] tracking-widest h-11 px-6 backdrop-blur-md">
                <Globe className="w-3 h-3 mr-2 opacity-50" />
                Ver Sitio
              </Button>
              <Button className="rounded-xl bg-destructive hover:bg-destructive/90 text-white uppercase font-black text-[10px] tracking-widest h-11 px-6 shadow-xl shadow-destructive/20 border-t border-white/20">
                <Plus className="w-3 h-3 mr-2" />
                Acción Rápida
              </Button>
            </div>
          </header>

          <div className="space-y-10">
            {/* Tabs Content */}
            {activeTab === "summary" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <AdminStatCard title="Usuarios Totales" value={users.length.toString()} change="Real-time" icon={<Users className="text-destructive" />} />
                  <AdminStatCard title="Ingresos (S/)" value="S/ 0" change="Sin datos" icon={<DollarSign className="text-destructive" />} />
                  <AdminStatCard 
                    title="Créditos API" 
                    value={resellerStatus ? `${resellerStatus.remaining}/${resellerStatus.max}` : "N/A"} 
                    change={resellerStatus ? `${resellerStatus.used} usados` : "Sin Token"} 
                    icon={<CreditCard className="text-destructive" />} 
                  />
                  <AdminStatCard title="Alertas Sistema" value="0" subtitle="Todo estable" icon={<CheckCircle2 className="text-green-500" />} />
                </div>

                <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden group shadow-2xl">
                  <div className="h-1 w-full bg-gradient-to-r from-destructive/0 via-destructive to-destructive/0 opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-destructive" />
                      <CardTitle className="text-lg font-black italic tracking-tighter uppercase">API Reseller Token</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Configura tu token para sincronizar con el proveedor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 group/input">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-destructive transition-colors" />
                        <Input 
                          type="password"
                          placeholder="rsl_your_token_here..." 
                          value={resellerToken}
                          onChange={(e) => setResellerToken(e.target.value)}
                          className="rounded-xl border-white/5 bg-white/5 font-mono text-xs h-13 pl-12 focus:bg-white/[0.08] transition-all" 
                        />
                      </div>
                      <Button 
                        disabled={isUpdatingToken}
                        onClick={updateToken}
                        className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black italic uppercase tracking-widest text-[10px] h-13 px-8 shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                      >
                        {isUpdatingToken ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        Sincronizar Acceso
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5 bg-white/[0.01]">
                      <div>
                        <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Configuración Global</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Reglas de negocio y visibilidad</CardDescription>
                      </div>
                      <Settings className="w-5 h-5 text-muted-foreground/30 group-hover:rotate-90 transition-transform duration-700" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                        <div className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group/item">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-destructive/10 transition-colors">
                              <AlertCircle className="w-5 h-5 text-muted-foreground group-hover/item:text-destructive transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">Modo Mantenimiento</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Bloqueo temporal de acceso</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-white/10 bg-white/5 uppercase text-[9px] font-black px-3 py-1 tracking-widest">Inactivo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group/item">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-green-500/10 transition-colors">
                              <Globe className="w-5 h-5 text-muted-foreground group-hover/item:text-green-500 transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">Registro Público</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Permitir nuevos usuarios</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500 uppercase text-[9px] font-black px-3 py-1 tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">Activo</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden group flex flex-col">
                    <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-destructive" />
                        <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Barra Informativa</CardTitle>
                      </div>
                      <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Anuncio global con scroll infinito</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 space-y-4 flex flex-col justify-center">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Contenido del Anuncio</label>
                        <Input 
                          defaultValue="OFERTA DE LANZAMIENTO: 50% DCTO EN EL PLAN PRO — UNETE AHORA" 
                          className="rounded-xl border-white/5 bg-white/5 font-black uppercase italic text-[11px] h-13 tracking-tight focus:bg-white/[0.08]" 
                        />
                      </div>
                      <Button className="w-full rounded-xl bg-white/10 hover:bg-white/15 text-white font-black italic uppercase tracking-widest text-[10px] h-13 border border-white/10">
                        Propagar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-8 border-b border-white/5 bg-white/[0.01]">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Usuarios Registrados</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Gestión total de cuentas y permisos</CardDescription>
                  </div>
                  <div className="relative w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-destructive transition-colors" />
                    <Input 
                      placeholder="Buscar por email o rol..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 rounded-xl border-white/5 bg-white/5 text-[11px] h-11 tracking-wide focus:bg-white/[0.08] transition-all" 
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Identidad</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Privilegios</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Créditos</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Registro</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchingUsers ? (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic uppercase text-xs">Cargando usuarios de la base de datos...</td></tr>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <UserRow
                            key={u.id}
                            name={u.email?.split('@')[0] || 'Usuario'}
                            email={u.email || 'N/A'}
                            role={u.role || 'user'}
                            credits={u.credits ?? 0}
                            created={new Date(u.created_at).toLocaleDateString()}
                            onRecharge={() => { setRechargeTarget(u); setRechargeAmount("10"); }}
                          />
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic uppercase text-xs">No se encontraron usuarios</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {activeTab === "keys" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden shadow-2xl p-0">
                    <div className="bg-white/[0.01] p-6 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <Plus className="w-4 h-4 text-destructive" />
                        </div>
                        <h3 className="text-sm font-black italic uppercase tracking-tight">Forjar Nueva Llave</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Emisión de licencias al instante</p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identificador Cliente</label>
                        <Input 
                          placeholder="p.ej. Juan Pérez" 
                          value={keyDisplayName}
                          onChange={(e) => setKeyDisplayName(e.target.value)}
                          className="rounded-xl border-white/5 bg-white/5 text-xs h-11 focus:bg-white/[0.08]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plan de Acceso</label>
                        <Select value={keyType} onValueChange={(v: any) => setKeyType(v)}>
                          <SelectTrigger className="rounded-xl border-white/5 bg-white/5 text-xs h-11 focus:bg-white/[0.08]">
                            <SelectValue placeholder="Selecciona el plan" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121214] border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <SelectItem value="trial" className="focus:bg-destructive focus:text-white uppercase font-black text-[10px] py-3">⚡ PRUEBA (30 MIN)</SelectItem>
                            <SelectItem value="days" className="focus:bg-destructive focus:text-white uppercase font-black text-[10px] py-3">📅 DÍAS ACTIVOS</SelectItem>
                            <SelectItem value="lifetime" className="focus:bg-destructive focus:text-white uppercase font-black text-[10px] py-3">💎 VITALICIA (LIFETIME)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {keyType === "days" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Duración (Días)</label>
                          <Input 
                            type="number"
                            value={keyDays}
                            onChange={(e) => setKeyDays(e.target.value)}
                            className="rounded-xl border-white/5 bg-white/5 text-xs h-11 focus:bg-white/[0.08]" 
                          />
                        </div>
                      )}
                      <Button 
                        onClick={handleGenerateKey}
                        disabled={isGeneratingKey || !resellerToken}
                        className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black italic uppercase tracking-[0.15em] text-[10px] h-14 shadow-xl shadow-destructive/20 border-t border-white/20 active:scale-[0.98] transition-all"
                      >
                        {isGeneratingKey ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Key className="w-4 h-4 mr-3" />}
                        GENERAR ACCESO MAESTRO
                      </Button>
                    </div>
                  </Card>

                  <div className="md:col-span-2">
                    <Card className="rounded-2xl border-white/5 bg-[#121214] overflow-hidden shadow-2xl h-full flex flex-col">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.01] py-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-destructive" />
                            <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Historial Maestro</CardTitle>
                          </div>
                          <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Registro de llaves emitidas por el sistema</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={fetchLicenses}
                          disabled={isLoadingLicenses || !resellerToken}
                          className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingLicenses ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0 overflow-auto max-h-[500px]">
                        {!resellerToken ? (
                          <div className="p-8 text-center text-muted-foreground text-xs uppercase italic">Configura tu token para ver el historial</div>
                        ) : isLoadingLicenses ? (
                          <div className="p-8 text-center text-muted-foreground text-xs uppercase italic">Cargando licencias...</div>
                        ) : licenses.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-xs uppercase italic">No hay licencias generadas</div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Llave</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Cliente</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 text-center">Estado</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Vencimiento</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 text-right">Control</th>
                              </tr>
                            </thead>
                            <tbody>
                              {licenses.map((lic) => (
                                <tr key={lic.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-300 group/row">
                                  <td className="p-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-destructive/5 flex items-center justify-center border border-destructive/10">
                                        <Key className="w-3 h-3 text-destructive" />
                                      </div>
                                      <span className="font-mono text-[10px] text-destructive font-black tracking-wider bg-destructive/5 px-2 py-1 rounded border border-destructive/10">{lic.license_key}</span>
                                    </div>
                                  </td>
                                  <td className="p-5">
                                    <span className="text-xs font-bold uppercase tracking-tight text-white/80">{lic.display_name || "S/N"}</span>
                                  </td>
                                  <td className="p-5 text-center">
                                    <Badge variant="outline" className={`rounded-lg uppercase text-[8px] font-black tracking-[0.1em] px-2 py-0.5 border-white/5 ${
                                      lic.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                      lic.status === 'trial' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                                    }`}>
                                      {lic.status}
                                    </Badge>
                                  </td>
                                  <td className="p-5">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-muted-foreground opacity-30" />
                                      <span className="text-[10px] uppercase font-black text-muted-foreground opacity-60">
                                        {lic.lifetime ? "VITALICIA" : lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : "N/A"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-5">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleResetHwid(lic.license_key)}
                                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5"
                                        title="Reset HWID"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleRevoke(lic.license_key)}
                                        className="h-9 w-9 rounded-xl text-destructive hover:text-white hover:bg-destructive shadow-lg hover:shadow-destructive/20"
                                        title="Revocar"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!rechargeTarget} onOpenChange={(open) => !open && setRechargeTarget(null)}>
        <DialogContent className="bg-[#121214] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-black italic uppercase tracking-tight">Recargar Créditos</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-black">
              {rechargeTarget?.email} · Actual: {rechargeTarget?.credits ?? 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cantidad a sumar (use negativo para restar)</label>
            <Input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="rounded-xl border-white/10 bg-white/5 h-12"
            />
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 25, 50, 100].map(n => (
                <Button key={n} size="sm" variant="outline" onClick={() => setRechargeAmount(String(n))} className="rounded-lg border-white/10 bg-white/5 h-8 text-xs">
                  +{n}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRechargeTarget(null)}>Cancelar</Button>
            <Button onClick={handleRecharge} disabled={isRecharging} className="bg-primary hover:bg-primary/90 font-black uppercase italic tracking-widest text-[10px]">
              {isRecharging ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminNavItem = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  onClick: () => void
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group overflow-hidden ${
      active 
        ? 'text-white' 
        : 'text-muted-foreground hover:text-white'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-destructive/10 border-r-4 border-destructive" />
    )}
    <div className={`relative z-10 p-2 rounded-lg transition-colors ${active ? 'bg-destructive text-white shadow-lg shadow-destructive/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
      {icon}
    </div>
    <span className="relative z-10 font-bold uppercase tracking-[0.15em] text-[11px] italic">
      {label}
    </span>
  </button>
);

const AdminStatCard = ({ title, value, change, icon, subtitle }: { title: string, value: string, change?: string, icon: React.ReactNode, subtitle?: string }) => (
  <Card className="relative overflow-hidden group bg-[#121214] border-white/5 hover:border-destructive/20 transition-all duration-500 rounded-2xl">
    <div className="absolute top-0 left-0 w-1 h-full bg-destructive/20 group-hover:bg-destructive transition-all" />
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-destructive/10 rounded-xl text-destructive group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        {change && (
          <Badge variant="outline" className="border-green-500/20 bg-green-500/5 text-green-500 text-[9px] font-black uppercase tracking-widest px-2 py-0">
            {change}
          </Badge>
        )}
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black italic tracking-tighter text-white">{value}</h3>
          {subtitle && <span className="text-[10px] text-muted-foreground uppercase font-medium">{subtitle}</span>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const UserRow = ({ name, email, role, credits, created, onRecharge }: { name: string, email: string, role: string, credits: number, created: string, onRecharge: () => void }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-300 group">
    <td className="p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-xs border border-white/10 group-hover:border-destructive/30 transition-colors">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-sm text-white group-hover:text-destructive transition-colors">{name}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider opacity-60">{email}</p>
        </div>
      </div>
    </td>
    <td className="p-5">
      <Badge variant="outline" className={`rounded-lg border-white/10 uppercase text-[9px] font-black px-2.5 py-0.5 tracking-widest ${
        role === 'superadmin' ? 'bg-destructive/10 text-destructive border-destructive/20' :
        role === 'reseller' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground'
      }`}>{role}</Badge>
    </td>
    <td className="p-5">
      <div className="flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5 text-primary" />
        <span className="text-sm font-black text-white tabular-nums">{credits}</span>
      </div>
    </td>
    <td className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{created}</td>
    <td className="p-5 text-right">
      <Button onClick={onRecharge} size="sm" className="rounded-lg bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest text-[10px] h-9 px-4">
        <Plus className="w-3 h-3 mr-1" /> Recargar
      </Button>
    </td>
  </tr>
);

