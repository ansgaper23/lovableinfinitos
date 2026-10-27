import { useEffect, useMemo, useState } from "react";
import { 
  LayoutDashboard, Users, BarChart3, ShieldAlert, Settings, 
  LogOut, Search, MoreVertical, CheckCircle2, XCircle, 
  TrendingUp, DollarSign, Key, RefreshCw, Trash2, ShieldCheck, 
  Clock, Plus, CreditCard, Activity, Zap, Globe, AlertCircle,
  Menu, X, Copy, Check
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
import type { ResellerStatus } from "@/services/resellerApi";
import { useServerFn } from "@tanstack/react-start";
import { setUserActivation, assignLicenseToUser, setUserRole, getAllUsers, deleteUserAccount } from "@/lib/user-actions.functions";
import {
  adminGetResellerStatus, adminListLicenses, adminGenerateTrial,
  adminGenerateLicense, adminResetHwid, adminRevokeLicense,
} from "@/lib/reseller-admin.functions";
import { ExtensionUploadCard } from "./ExtensionUploadCard";

interface ExtendedProfile extends Omit<Profile, 'reseller_api_token'> {
  reseller_api_token?: string | null;
  credits?: number;
  trial_requested?: boolean;
  trial_requested_at?: string | null;
  trial_expires_at?: string | null;
  has_assigned_license?: boolean;
  assigned_expires_at?: string | null;
  licenses_total?: number;
  licenses_trial?: number;
  licenses_assigned?: number;
  licenses_paid?: number;
  signup_ip?: string | null;
  phone?: string | null;
}

export const SuperAdminDashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "users" | "keys" | "stats" | "system">("summary");
  const [licenseFilter, setLicenseFilter] = useState<"all" | "active" | "expired">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Reseller states
  // El token del reseller vive en el servidor (RESELLER_API_KEY); nunca lo exponemos al cliente.
  const [resellerStatus, setResellerStatus] = useState<ResellerStatus | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyType, setKeyType] = useState<"trial" | "days" | "lifetime">("days");
  const [keyDisplayName, setKeyDisplayName] = useState("");
  const [keyDays, setKeyDays] = useState("30");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
  const navigate = useNavigate();

  const [rechargeTarget, setRechargeTarget] = useState<ExtendedProfile | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState("10");
  const [isRecharging, setIsRecharging] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const activateFn = useServerFn(setUserActivation);
  const assignFn = useServerFn(assignLicenseToUser);
  const roleFn = useServerFn(setUserRole);
  const getUsersFn = useServerFn(getAllUsers);
  const getStatusFn = useServerFn(adminGetResellerStatus);
  const listLicensesFn = useServerFn(adminListLicenses);
  const generateTrialFn = useServerFn(adminGenerateTrial);
  const generateLicenseFn = useServerFn(adminGenerateLicense);
  const resetHwidFn = useServerFn(adminResetHwid);
  const revokeLicenseFn = useServerFn(adminRevokeLicense);
  const deleteFn = useServerFn(deleteUserAccount);

  const [deleteTarget, setDeleteTarget] = useState<ExtendedProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFn({ data: { targetUserId: deleteTarget.id } });
      toast.success("Cuenta eliminada");
      setUsers((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBlockToggle = async (u: ExtendedProfile) => {
    if (u.role === "superadmin") {
      toast.error("No se puede bloquear a un superadmin");
      return;
    }
    const targetRole = u.role === "blocked" ? "user" : "blocked";
    setTogglingUserId(u.id);
    try {
      const res = await roleFn({ data: { targetUserId: u.id, role: targetRole } });
      toast.success(targetRole === "blocked" ? "Cuenta bloqueada" : "Cuenta desbloqueada");
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: res.role } : p)));
    } catch (e: any) {
      toast.error(e.message || "Error al cambiar estado");
    } finally {
      setTogglingUserId(null);
    }
  };

  const [assignTarget, setAssignTarget] = useState<ExtendedProfile | null>(null);
  const [assignDays, setAssignDays] = useState<number>(7);
  const [assignProvider, setAssignProvider] = useState<"flowpro" | "legacy">("flowpro");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedResult, setAssignedResult] = useState<{ license_key: string; expires_at: string | null } | null>(null);

  const handleAssignLicense = async () => {
    if (!assignTarget) return;
    setIsAssigning(true);
    try {
      const res = await assignFn({ data: { targetUserId: assignTarget.id, days: assignDays, provider: assignProvider } });
      setAssignedResult({ license_key: res.license_key, expires_at: res.expires_at });
      toast.success(`Licencia de ${assignDays} día${assignDays > 1 ? "s" : ""} asignada`);
      // refrescar lista de usuarios para reflejar cambios
      loadUsersWithCredits();
    } catch (e: any) {
      toast.error(e.message || "Error al asignar licencia");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleActivation = async (u: ExtendedProfile) => {
    if (u.role === "superadmin") {
      toast.error("No se puede desactivar a un superadmin");
      return;
    }
    if (u.role === "blocked") {
      toast.error("Desbloquea la cuenta primero");
      return;
    }
    const isActive = u.role === "reseller";
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
      const merged = await getUsersFn({});
      setUsers(merged);
      // El token de revendedor vive en el servidor (RESELLER_API_KEY).
      // Cargamos el estado vía server function.
      fetchResellerStatus();
    } catch (error: any) {
      toast.error("Error al cargar usuarios: " + error.message);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUsersWithCredits();
      fetchLicenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const fetchResellerStatus = async () => {
    try {
      const status = await getStatusFn({});
      setResellerStatus(status as ResellerStatus);
    } catch (error) {
      console.error("Error fetching status");
    }
  };

  const fetchLicenses = async () => {
    setIsLoadingLicenses(true);
    try {
      const data = await listLicensesFn({ data: { page: 1, perPage: 50 } });
      setLicenses(data.licenses || []);
    } catch (error: any) {
      toast.error("Error al cargar licencias: " + error.message);
    } finally {
      setIsLoadingLicenses(false);
    }
  };


  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      let result: any;
      if (keyType === "trial") {
        result = await generateTrialFn({ data: { displayName: keyDisplayName, minutes: 15 } });
      } else if (keyType === "lifetime") {
        result = await generateLicenseFn({ data: { displayName: keyDisplayName, lifetime: true } });
      } else {
        result = await generateLicenseFn({ data: { displayName: keyDisplayName, days: parseInt(keyDays), lifetime: false } });
      }

      if (result.success) {
        toast.success("Licencia generada correctamente");
        setGeneratedKey(result.license_key);
        setCopiedKey(false);
        if (user) {
          await supabase.from("reseller_licenses").insert({
            user_id: user.id,
            license_key: result.license_key,
            display_name: keyDisplayName,
            type: result.type,
            expires_at: result.expires_at,
            duration_seconds: result.duration_seconds,
            lifetime: result.lifetime || false,
          });
        }
        fetchResellerStatus();
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
      await resetHwidFn({ data: { licenseKey: key } });
      toast.success("HWID reseteado");
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRevoke = async (key: string) => {
    try {
      await revokeLicenseFn({ data: { licenseKey: key } });
      toast.success("Licencia revocada");
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const licenseCounts = useMemo(() => {
    let active = 0, expired = 0;
    for (const lic of licenses) {
      if (lic.lifetime) { active++; continue; }
      const isExp = lic.expires_at ? new Date(lic.expires_at).getTime() < Date.now() : false;
      if (isExp) expired++; else active++;
    }
    return { all: licenses.length, active, expired };
  }, [licenses]);

  const filteredLicenses = useMemo(() => {
    if (licenseFilter === "all") return licenses;
    return licenses.filter((lic) => {
      if (lic.lifetime) return licenseFilter === "active";
      const isExp = lic.expires_at ? new Date(lic.expires_at).getTime() < Date.now() : false;
      return licenseFilter === "active" ? !isExp : isExp;
    });
  }, [licenses, licenseFilter]);

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


  const navItems = [
    { id: "summary", label: "Resumen", icon: LayoutDashboard },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "keys", label: "Licencias", icon: Key },
    { id: "stats", label: "Estadísticas", icon: BarChart3 },
    { id: "system", label: "Sistema", icon: Settings },
  ] as const;

  const activeLabel = navItems.find((n) => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-destructive/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm font-semibold tracking-tight">SuperAdmin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-zinc-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as typeof activeTab);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-14 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 flex items-center px-3 sm:px-4 lg:px-8 gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-zinc-400 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-sm sm:text-lg font-semibold tracking-tight truncate min-w-0">{activeLabel}</h1>
          <div className="ml-auto flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="hidden lg:inline-flex border-zinc-700 bg-zinc-900 text-zinc-400 text-[10px] max-w-[220px] truncate">
              {profile?.email}
            </Badge>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 min-w-0">
          {activeTab === "summary" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Usuarios" value={users.length.toString()} icon={<Users className="w-4 h-4" />} />
                <StatCard label="Ingresos" value="S/ 0" icon={<DollarSign className="w-4 h-4" />} />
                <StatCard
                  label="Créditos API"
                  value={resellerStatus ? `${resellerStatus.remaining}` : "—"}
                  hint={resellerStatus ? `de ${resellerStatus.max}` : "Sin token"}
                  icon={<CreditCard className="w-4 h-4" />}
                />
                <StatCard label="Alertas" value="0" hint="Estable" icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} />
              </div>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-destructive" /> API Reseller
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Token gestionado en el servidor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-3 rounded-md bg-green-500/5 border border-green-500/15">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      El token nunca se expone al navegador. Todas las operaciones se ejecutan vía funciones de servidor protegidas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <ExtensionUploadCard />
            </>
          )}

          {activeTab === "users" && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-sm font-semibold">Usuarios</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    {users.length} registrados
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="min-w-[900px]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-y border-zinc-800 bg-zinc-950/50">
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Usuario</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Rol</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Prueba</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Licencias</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">IP</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Registro</th>
                          <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchingUsers ? (
                          <tr><td colSpan={8} className="p-8 text-center text-zinc-500 text-xs">Cargando...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                          <UserRow
                              key={u.id}
                              user={u}
                              onRecharge={() => { setRechargeTarget(u); setRechargeAmount("10"); }}
                              onToggleActivation={() => handleToggleActivation(u)}
                              onAssignLicense={() => { setAssignTarget(u); setAssignDays(7); setAssignedResult(null); }}
                              onBlockToggle={() => handleBlockToggle(u)}
                              onDelete={() => setDeleteTarget(u)}
                              toggling={togglingUserId === u.id}
                            />
                          ))
                        ) : (
                          <tr><td colSpan={8} className="p-8 text-center text-zinc-500 text-xs">Sin resultados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden divide-y divide-zinc-800">
                  {fetchingUsers ? (
                    <div className="p-6 text-center text-xs text-zinc-500">Cargando...</div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                    <UserCard
                        key={u.id}
                        user={u}
                        onRecharge={() => { setRechargeTarget(u); setRechargeAmount("10"); }}
                        onToggleActivation={() => handleToggleActivation(u)}
                        onAssignLicense={() => { setAssignTarget(u); setAssignDays(7); setAssignedResult(null); }}
                        onBlockToggle={() => handleBlockToggle(u)}
                        onDelete={() => setDeleteTarget(u)}
                        toggling={togglingUserId === u.id}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-500">Sin resultados</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "keys" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-destructive" /> Nueva licencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Cliente</label>
                    <Input
                      placeholder="Nombre"
                      value={keyDisplayName}
                      onChange={(e) => setKeyDisplayName(e.target.value)}
                      className="h-9 bg-zinc-950 border-zinc-800 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Plan</label>
                    <Select value={keyType} onValueChange={(v: any) => setKeyType(v)}>
                      <SelectTrigger className="h-9 bg-zinc-950 border-zinc-800 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="trial">Prueba (15 min)</SelectItem>
                        <SelectItem value="days">Días</SelectItem>
                        <SelectItem value="lifetime">Vitalicia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {keyType === "days" && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">Días</label>
                      <Input
                        type="number"
                        value={keyDays}
                        onChange={(e) => setKeyDays(e.target.value)}
                        className="h-9 bg-zinc-950 border-zinc-800 text-sm"
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleGenerateKey}
                    disabled={isGeneratingKey || !keyDisplayName}
                    className="w-full h-9 bg-destructive hover:bg-destructive/90 text-white text-sm"
                  >
                    {isGeneratingKey ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                    Generar
                  </Button>
                  {generatedKey && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-green-500 font-medium">Licencia generada</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-xs break-all bg-zinc-950 px-3 py-2 border border-zinc-800 rounded-md text-zinc-200">
                          {generatedKey}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-zinc-400 hover:text-white"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(generatedKey);
                              setCopiedKey(true);
                              toast.success("Licencia copiada");
                              setTimeout(() => setCopiedKey(false), 2000);
                            } catch {
                              toast.error("No se pudo copiar");
                            }
                          }}
                        >
                          {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Historial</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">Licencias emitidas</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchLicenses}
                    disabled={isLoadingLicenses}
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingLicenses ? "animate-spin" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-4 pt-2 pb-1 border-b border-zinc-800">
                    {([
                      { key: "all" as const, label: "Todas" },
                      { key: "active" as const, label: "Activas" },
                      { key: "expired" as const, label: "Vencidas" },
                    ]).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setLicenseFilter(f.key)}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                          licenseFilter === f.key
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        {f.label}{" "}
                        <span className="ml-1 text-zinc-500 tabular-nums">
                          {f.key === "all" ? licenseCounts.all : f.key === "active" ? licenseCounts.active : licenseCounts.expired}
                        </span>
                      </button>
                    ))}
                  </div>
                  {isLoadingLicenses ? (
                    <div className="p-6 text-center text-xs text-zinc-500">Cargando...</div>
                  ) : filteredLicenses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      {licenses.length === 0 ? "Sin licencias" : "Sin licencias en esta categoría"}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
                      {filteredLicenses.map((lic) => (
                        <div key={lic.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm hover:bg-zinc-950/50">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <Key className="w-3 h-3 text-destructive shrink-0" />
                              <span className="font-mono text-[11px] sm:text-xs text-zinc-200 truncate">{lic.license_key}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-500">
                                <span className="truncate">{lic.display_name || "S/N"}</span>
                              </div>
                              {lic.customer_phone && (
                                <span className="text-[10px] text-zinc-600 truncate">{lic.customer_phone}</span>
                              )}
                              <LicenseExpirationBar lic={lic} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${
                              lic.status === "active" ? "border-green-500/30 bg-green-500/10 text-green-400" :
                              lic.status === "trial" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
                              "border-destructive/30 bg-destructive/10 text-destructive"
                            }`}>{lic.status}</Badge>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleResetHwid(lic.license_key)}
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                title="Reset HWID"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRevoke(lic.license_key)}
                                className="h-8 w-8 text-zinc-400 hover:text-destructive"
                                title="Revocar"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "stats" && (
            <StatsPanel users={users} licenses={licenses} />
          )}

          {activeTab === "system" && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Sistema</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Configuración global</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-800 pt-0">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm">Modo mantenimiento</p>
                      <p className="text-xs text-zinc-500">Bloqueo temporal</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">Inactivo</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="text-sm">Registro público</p>
                      <p className="text-xs text-zinc-500">Permitir nuevos usuarios</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-[10px]">Activo</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={!!rechargeTarget} onOpenChange={(open) => !open && setRechargeTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md w-[calc(100vw-1.5rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Recargar créditos</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {rechargeTarget?.email} · Actual: {rechargeTarget?.credits ?? 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs text-zinc-400">Cantidad (use negativo para restar)</label>
            <Input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="h-10 bg-zinc-950 border-zinc-800"
            />
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 25, 50, 100].map((n) => (
                <Button key={n} size="sm" variant="outline" onClick={() => setRechargeAmount(String(n))} className="h-8 text-xs border-zinc-700 bg-zinc-950">
                  +{n}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRechargeTarget(null)}>Cancelar</Button>
            <Button onClick={handleRecharge} disabled={isRecharging} className="bg-primary hover:bg-primary/90">
              {isRecharging ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignTarget} onOpenChange={(o) => { if (!o) { setAssignTarget(null); setAssignedResult(null); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md w-[calc(100vw-1.5rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-destructive" /> Asignar licencia
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">{assignTarget?.email}</DialogDescription>
          </DialogHeader>
          {!assignedResult ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Proveedor de Licencia</label>
                <Select value={assignProvider} onValueChange={(v: any) => setAssignProvider(v)}>
                  <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="flowpro">Flow-Pro Key (Oficial)</SelectItem>
                    <SelectItem value="legacy">Legacy Key (Automática)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="text-xs text-zinc-400">Duración predeterminada</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 7, 30, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => setAssignDays(d)}
                    className={`rounded-md border h-14 flex flex-col items-center justify-center transition-colors ${
                      assignDays === d
                        ? "border-destructive bg-destructive/15 text-white"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-lg font-semibold">{d}</span>
                    <span className="text-[10px] text-zinc-500">{d === 1 ? "día" : "días"}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">O días personalizados (1 - 3650)</label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={assignDays}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) setAssignDays(Math.max(1, Math.min(3650, v)));
                  }}
                  className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus:outline-none focus:border-destructive"
                  placeholder="Ej: 31, 45, 90..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-xs text-green-500 font-medium">Licencia asignada</p>
              <code className="block w-full font-mono text-xs break-all bg-zinc-950 px-3 py-2.5 border border-zinc-800 rounded-md">
                {assignedResult.license_key}
              </code>
              {assignedResult.expires_at && (
                <p className="text-xs text-zinc-500">Expira: {new Date(assignedResult.expires_at).toLocaleString()}</p>
              )}
            </div>
          )}
          <DialogFooter>
            {!assignedResult ? (
              <>
                <Button variant="ghost" onClick={() => setAssignTarget(null)}>Cancelar</Button>
                <Button onClick={handleAssignLicense} disabled={isAssigning} className="bg-destructive hover:bg-destructive/90">
                  {isAssigning ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                  Asignar
                </Button>
              </>
            ) : (
              <Button onClick={() => { setAssignTarget(null); setAssignedResult(null); }} className="bg-primary hover:bg-primary/90">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md w-[calc(100vw-1.5rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" /> Eliminar cuenta
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {deleteTarget?.email} — Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-xs text-zinc-400">
              Se borrarán todos los datos del usuario: perfil, créditos, licencias y registros de IP.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button onClick={handleDeleteUser} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) => (
  <Card className="bg-zinc-900 border-zinc-800">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3 text-zinc-400">
        <span className="text-[11px] sm:text-xs truncate">{label}</span>
        <span className="shrink-0">{icon}</span>
      </div>
      <div className="text-lg sm:text-2xl font-semibold text-white tabular-nums truncate">{value}</div>
      {hint && <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">{hint}</div>}
    </CardContent>
  </Card>
);

const TrialBadge = ({ user }: { user: ExtendedProfile }) => {
  if (!user.trial_requested) {
    return (
      <Badge variant="outline" className="text-[10px] border-zinc-700 bg-zinc-950 text-zinc-500">
        No solicitada
      </Badge>
    );
  }
  const requested = user.trial_requested_at
    ? new Date(user.trial_requested_at).toLocaleString(undefined, {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      })
    : null;
  const expiresAt = user.trial_expires_at ? new Date(user.trial_expires_at).getTime() : null;
  const expired = expiresAt !== null && expiresAt < Date.now();
  return (
    <Badge
      variant="outline"
      title={requested ? `Solicitada: ${requested}` : "Solicitada"}
      className={`text-[10px] gap-1 ${
        expired
          ? "border-zinc-700 bg-zinc-950 text-zinc-400"
          : "border-blue-500/30 bg-blue-500/10 text-blue-400"
      }`}
    >
      <Clock className="w-3 h-3" />
      {expired ? "Prueba expirada" : "Prueba activa"}
      {requested && <span className="text-zinc-500 font-normal">· {requested}</span>}
    </Badge>
  );
};

const LicenseCountBadge = ({ user }: { user: ExtendedProfile }) => {
  const total = user.licenses_total ?? 0;
  const trial = user.licenses_trial ?? 0;
  const assigned = user.licenses_assigned ?? 0;
  const paid = user.licenses_paid ?? 0;
  const tooltip = `Total: ${total}\nPrueba: ${trial}\nAsignadas: ${assigned}${paid ? `\nGeneradas (pago): ${paid}` : ""}`;
  return (
    <div title={tooltip} className="flex items-center gap-1.5 text-sm">
      <Key className="w-3.5 h-3.5 text-primary" />
      <span className="tabular-nums text-white">{total}</span>
      {total > 0 && (
        <span className="text-[10px] text-zinc-500">
          ({paid > 0 ? `${paid}p · ` : ""}{assigned}a · {trial}t)
        </span>
      )}
    </div>
  );
};

const roleStyles = (role: string) => {
  if (role === "superadmin") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (role === "reseller") return "border-primary/30 bg-primary/10 text-primary";
  if (role === "blocked") return "border-red-500/30 bg-red-500/10 text-red-400";
  return "border-amber-500/30 bg-amber-500/10 text-amber-400";
};

const roleLabelOf = (role: string) =>
  role === "user" ? "pendiente" : role === "blocked" ? "bloqueado" : role;

type UserActionProps = {
  user: ExtendedProfile;
  onRecharge: () => void;
  onToggleActivation: () => void;
  onAssignLicense: () => void;
  onBlockToggle: () => void;
  onDelete: () => void;
  toggling: boolean;
};

const UserActions = ({ user, onRecharge, onToggleActivation, onAssignLicense, onBlockToggle, onDelete, toggling }: UserActionProps) => {
  const isReseller = user.role === "reseller";
  const isSuper = user.role === "superadmin";
  const isBlocked = user.role === "blocked";
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-1.5 w-full">
      {!isSuper && !isBlocked && (
        <Button
          onClick={onToggleActivation}
          disabled={toggling}
          size="sm"
          variant="outline"
          className={`h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 ${
            isReseller ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"
          }`}
        >
          {toggling ? <RefreshCw className="w-3 h-3 animate-spin" /> : isReseller ? "Quitar reseller" : "Hacer reseller"}
        </Button>
      )}
      {!isSuper && !isReseller && !isBlocked && (
        <Button onClick={onAssignLicense} size="sm" variant="outline" className="h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 text-destructive hover:text-destructive">
          <Key className="w-3 h-3 mr-1" /> Asignar
        </Button>
      )}
      {!isSuper && (
        <Button
          onClick={onBlockToggle}
          disabled={toggling}
          size="sm"
          variant="outline"
          className={`h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 ${
            isBlocked ? "text-green-400" : "text-red-400"
          }`}
        >
          {toggling ? <RefreshCw className="w-3 h-3 animate-spin" /> : isBlocked ? "Desbloquear" : "Bloquear"}
        </Button>
      )}
      {!isSuper && (
        <Button
          onClick={onDelete}
          size="sm"
          variant="outline"
          className="h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Eliminar
        </Button>
      )}
      <Button onClick={onRecharge} size="sm" className="h-8 px-2 sm:px-3 text-[11px] sm:text-xs bg-primary hover:bg-primary/90 text-white">
        <Plus className="w-3 h-3 mr-1" /> Recargar
      </Button>
    </div>
  );
};

const UserRow = (props: UserActionProps) => {
  const { user } = props;
  const name = user.email?.split("@")[0] || "Usuario";
  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-950/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{name}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            {user.phone && (
              <a
                href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-green-400/80 hover:text-green-400 truncate block"
                title="Abrir WhatsApp"
              >
                📱 {user.phone}
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={`text-[10px] ${roleStyles(user.role || "user")}`}>
          {roleLabelOf(user.role || "user")}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <TrialBadge user={user} />
      </td>
      <td className="px-4 py-3">
        <LicenseCountBadge user={user} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm">
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          <span className="tabular-nums">{user.credits ?? 0}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-zinc-400" title={user.signup_ip || "Sin registro"}>
          {user.signup_ip || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-zinc-400">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <UserActions {...props} />
      </td>
    </tr>
  );
};

const UserCard = (props: UserActionProps) => {
  const { user } = props;
  const name = user.email?.split("@")[0] || "Usuario";
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            {user.phone && (
              <a
                href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-green-400/80 hover:text-green-400 truncate block"
              >
                📱 {user.phone}
              </a>
            )}
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${roleStyles(user.role || "user")}`}>
          {roleLabelOf(user.role || "user")}
        </Badge>
      </div>
      <TrialBadge user={user} />
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <LicenseCountBadge user={user} />
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          <span className="text-zinc-200 tabular-nums">{user.credits ?? 0}</span>
          <span>créditos</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">IP</span>
        <span className="font-mono text-zinc-300">{user.signup_ip || "—"}</span>
      </div>
      <div className="text-xs text-zinc-400 text-right">{new Date(user.created_at).toLocaleDateString()}</div>
      <UserActions {...props} />
    </div>
  );
};

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expirado";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  const m = minutes % 60;
  if (days > 0) return `${days}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function getLicenseExpirationProgress(lic: any): { percent: number; remainingMs: number; text: string } {
  if (lic.lifetime) return { percent: 100, remainingMs: Infinity, text: "Vitalicia" };
  const created = new Date(lic.created_at).getTime();
  const expires = new Date(lic.expires_at).getTime();
  const now = Date.now();
  const total = expires - created;
  const remaining = expires - now;
  const percent = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;
  return { percent, remainingMs: remaining, text: formatTimeLeft(remaining) };
}

const LicenseExpirationBar = ({ lic }: { lic: any }) => {
  const progress = getLicenseExpirationProgress(lic);
  const isExpired = progress.remainingMs <= 0;
  const isLifetime = lic.lifetime;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-400">
            {isLifetime ? "Plan vitalicio" : isExpired ? "Plan expirado" : "Plano expira em"}
          </span>
        </div>
        <span className={`text-[11px] font-semibold ${isLifetime ? "text-zinc-400" : isExpired ? "text-zinc-500" : "text-orange-500"}`}>
          {progress.text}
        </span>
      </div>
      {!isLifetime && (
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isExpired ? "bg-zinc-600" : "bg-gradient-to-r from-violet-500 to-blue-400"}`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================
// Stats Panel
// ============================================================
const StatsPanel = ({ users, licenses }: { users: ExtendedProfile[]; licenses: any[] }) => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const totalUsers = users.length;
  const byRole = users.reduce<Record<string, number>>((acc, u) => {
    const r = u.role || "user";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  const withPhone = users.filter((u) => !!u.phone).length;
  const phonePct = totalUsers > 0 ? Math.round((withPhone / totalUsers) * 100) : 0;

  const signups7d = users.filter((u) => now - new Date(u.created_at).getTime() < 7 * DAY).length;
  const signups30d = users.filter((u) => now - new Date(u.created_at).getTime() < 30 * DAY).length;
  const signupsToday = users.filter((u) => {
    const d = new Date(u.created_at);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;

  const totalCredits = users.reduce((sum, u) => sum + (u.credits ?? 0), 0);

  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const trialLicenses = licenses.filter((l) => l.type === "trial").length;
  const paidLicenses = licenses.filter((l) => l.type !== "trial").length;
  const lifetimeLicenses = licenses.filter((l) => l.lifetime).length;

  // Signups by day for the last 14 days (mini bar chart)
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now - i * DAY);
    const key = day.toDateString();
    const count = users.filter((u) => new Date(u.created_at).toDateString() === key).length;
    days.push({ label: `${day.getDate()}/${day.getMonth() + 1}`, count });
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Usuarios totales" value={totalUsers.toString()} icon={<Users className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Hoy" value={signupsToday.toString()} icon={<TrendingUp className="w-4 h-4 text-green-400" />} />
        <StatCard label="Últimos 7 días" value={signups7d.toString()} icon={<Activity className="w-4 h-4 text-cyan-400" />} />
        <StatCard label="Últimos 30 días" value={signups30d.toString()} icon={<Activity className="w-4 h-4 text-purple-400" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Licencias totales" value={totalLicenses.toString()} icon={<Key className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Activas" value={activeLicenses.toString()} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
        <StatCard label="De prueba" value={trialLicenses.toString()} icon={<Clock className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Pagas" value={paidLicenses.toString()} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
      </div>

      {/* Signups chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Registros últimos 14 días</CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Total: {days.reduce((s, d) => s + d.count, 0)} · Pico: {maxCount}/día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div className="text-[10px] tabular-nums text-zinc-400 font-mono">{d.count || ""}</div>
                <div
                  className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-sm transition-all hover:opacity-80"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "1px" }}
                  title={`${d.label}: ${d.count} registros`}
                />
                <div className="text-[9px] text-zinc-600 font-mono truncate">{d.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles + extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Distribución por rol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(["user", "reseller", "superadmin", "blocked"] as const).map((r) => {
              const count = byRole[r] || 0;
              const pct = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={r} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${roleStyles(r).split(" ").find((c) => c.startsWith("text-"))}`}>
                      {roleLabelOf(r)}
                    </span>
                    <span className="text-zinc-400 tabular-nums">{count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Indicadores clave</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MiniRow label="Usuarios con celular" value={`${withPhone} (${phonePct}%)`} icon="📱" />
            <MiniRow label="Créditos totales en circulación" value={totalCredits.toString()} icon="💳" />
            <MiniRow label="Licencias vitalicias" value={lifetimeLicenses.toString()} icon="♾️" />
            <MiniRow
              label="Conversión a licencia"
              value={`${totalUsers > 0 ? Math.round((users.filter(u => (u.licenses_paid ?? 0) > 0).length / totalUsers) * 100) : 0}%`}
              icon="📈"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


const MiniRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-zinc-400 flex items-center gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
    <span className="text-white font-mono tabular-nums">{value}</span>
  </div>
);
