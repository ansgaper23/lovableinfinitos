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
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { useAuth, Profile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { resellerApi, ResellerStatus } from "@/services/resellerApi";

interface ExtendedProfile extends Omit<Profile, 'reseller_api_token'> {
  reseller_api_token?: string | null;
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

  useEffect(() => {
    const getUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data || []);
        
        // Find current admin profile to set token
        const currentProfile = data?.find(p => p.id === user?.id);
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

    if (user) getUsers();
  }, [user]);

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
      <AnnouncementBar />
      
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
                  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Configuración Global</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.01]">
                        <div>
                          <p className="text-sm font-bold">Mantenimiento</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Desactiva el acceso a todos</p>
                        </div>
                        <Badge variant="outline" className="border-white/20 uppercase text-[10px]">OFF</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.01]">
                        <div>
                          <p className="text-sm font-bold">Registro Público</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Permitir nuevos registros</p>
                        </div>
                        <Badge variant="outline" className="border-green-500/50 text-green-500 uppercase text-[10px]">ON</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Mensaje de Barra (Scroll)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input defaultValue="OFERTA DE LANZAMIENTO: 50% DCTO EN EL PLAN PRO" className="rounded-none border-white/10 bg-white/5 font-bold uppercase italic text-xs h-12" />
                      <Button className="w-full rounded-none bg-primary text-primary-foreground font-black italic uppercase tracking-widest text-xs h-12">
                        Actualizar Mensaje Global
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-white/5">
                  <div>
                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Usuarios Recientes</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Control de acceso y planes</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar usuario..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-none border-white/10 bg-white/5 text-xs h-10" 
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usuario</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rol</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Creado</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
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
                            status="Activo" 
                            created={new Date(u.created_at).toLocaleDateString()} 
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
                  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl p-6">
                    <h3 className="text-sm font-black italic uppercase mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-destructive" />
                      Generar Nueva Llave
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre del Cliente</label>
                        <Input 
                          placeholder="Juan Pérez" 
                          value={keyDisplayName}
                          onChange={(e) => setKeyDisplayName(e.target.value)}
                          className="rounded-none border-white/10 bg-white/5 text-xs h-10" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de Licencia</label>
                        <Select value={keyType} onValueChange={(v: any) => setKeyType(v)}>
                          <SelectTrigger className="rounded-none border-white/10 bg-white/5 text-xs h-10">
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-white/10 rounded-none">
                            <SelectItem value="trial">PRUEBA (30 MIN)</SelectItem>
                            <SelectItem value="days">DÍAS ACTIVOS</SelectItem>
                            <SelectItem value="lifetime">VITALICIA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {keyType === "days" && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Días</label>
                          <Input 
                            type="number"
                            value={keyDays}
                            onChange={(e) => setKeyDays(e.target.value)}
                            className="rounded-none border-white/10 bg-white/5 text-xs h-10" 
                          />
                        </div>
                      )}
                      <Button 
                        onClick={handleGenerateKey}
                        disabled={isGeneratingKey || !resellerToken}
                        className="w-full rounded-none bg-destructive hover:bg-destructive/90 text-white font-black italic uppercase tracking-widest text-xs h-12 shadow-[0_0_20px_rgba(var(--color-destructive),0.3)]"
                      >
                        {isGeneratingKey ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                        GENERAR LICENCIA
                      </Button>
                    </div>
                  </Card>

                  <div className="md:col-span-2">
                    <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl h-full">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                        <div>
                          <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Historial de Licencias</CardTitle>
                          <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Licencias generadas por la API</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={fetchLicenses}
                          disabled={isLoadingLicenses || !resellerToken}
                          className="text-muted-foreground hover:text-white"
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
                              <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Llave</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expira</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {licenses.map((lic) => (
                                <tr key={lic.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4 font-mono text-[10px] text-primary">{lic.license_key}</td>
                                  <td className="p-4 text-xs font-bold">{lic.display_name || "N/A"}</td>
                                  <td className="p-4">
                                    <Badge variant="outline" className={`rounded-none uppercase text-[8px] border-white/10 ${
                                      lic.status === 'active' ? 'text-green-500' : 
                                      lic.status === 'trial' ? 'text-blue-500' : 'text-destructive'
                                    }`}>
                                      {lic.status}
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-[10px] uppercase font-black text-muted-foreground">
                                    {lic.lifetime ? "VITALICIA" : lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : "N/A"}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleResetHwid(lic.license_key)}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                                        title="Reset HWID"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleRevoke(lic.license_key)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                                        title="Revocar"
                                      >
                                        <XCircle className="w-3 h-3" />
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

const UserRow = ({ name, email, role, status, created }: { name: string, email: string, role: string, status: string, created: string }) => (
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
      <div className="flex items-center gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${status === "Activo" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${status === "Activo" ? "text-green-500" : "text-destructive"}`}>{status}</span>
      </div>
    </td>
    <td className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{created}</td>
    <td className="p-5">
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </td>
  </tr>
);

