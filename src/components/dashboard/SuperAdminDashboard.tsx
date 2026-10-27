import { useEffect, useMemo, useState } from "react";
import { 
  LayoutDashboard, Users, BarChart3, ShieldAlert, Settings, 
  LogOut, Search, CheckCircle2, XCircle, 
  DollarSign, Key, RefreshCw, Trash2, ShieldCheck, 
  Plus, CreditCard, Zap, Globe, AlertCircle,
  Menu, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { ResellerStatus } from "@/services/resellerApi";
import { useServerFn } from "@tanstack/react-start";
import { setUserActivation, assignLicenseToUser, setUserRole, getAllUsers, deleteUserAccount } from "@/lib/user-actions.functions";
import {
  adminGetResellerStatus, adminListLicenses, adminResetHwid, adminRevokeLicense,
} from "@/lib/reseller-admin.functions";
import { ExtensionUploadCard } from "./ExtensionUploadCard";
import { FlowProGeneratorCard } from "./FlowProGeneratorCard";
import { StatsPanel } from "./SuperAdminStats";
import { 
  ExtendedProfile, roleStyles, roleLabelOf, TrialBadge, 
  LicenseCountBadge, UserActions 
} from "./SuperAdminUserComponents";

export const SuperAdminDashboard = () => {
  const { user, profile, loading } = useAuth(true);
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "flowpro" | "users" | "keys" | "stats" | "system">("summary");
  const [licenseFilter, setLicenseFilter] = useState<"all" | "active" | "expired">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [resellerStatus, setResellerStatus] = useState<ResellerStatus | null>(null);
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
  const resetHwidFn = useServerFn(adminResetHwid);
  const revokeLicenseFn = useServerFn(adminRevokeLicense);
  const deleteFn = useServerFn(deleteUserAccount);

  const [deleteTarget, setDeleteTarget] = useState<ExtendedProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [assignTarget, setAssignTarget] = useState<ExtendedProfile | null>(null);
  const [assignDays, setAssignDays] = useState<number>(30);
  const [assignProvider, setAssignProvider] = useState<"flowpro" | "legacy">("flowpro");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedResult, setAssignedResult] = useState<{ license_key: string; expires_at: string | null } | null>(null);

  const loadUsersWithCredits = async () => {
    try {
      const merged = await getUsersFn({});
      setUsers(merged);
      fetchResellerStatus();
    } catch (error: any) {
      toast.error("Error al cargar usuarios: " + error.message);
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchResellerStatus = async () => {
    try {
      const status = await getStatusFn({});
      setResellerStatus(status as ResellerStatus);
    } catch {
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

  useEffect(() => {
    if (user) {
      loadUsersWithCredits();
      fetchLicenses();
    }
  }, [user?.id]);

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

  const handleAssignLicense = async () => {
    if (!assignTarget) return;
    setIsAssigning(true);
    try {
      const res = await assignFn({ data: { targetUserId: assignTarget.id, days: assignDays, provider: assignProvider } });
      setAssignedResult({ license_key: res.license_key, expires_at: res.expires_at });
      toast.success(`Licencia de Flow-Pro asignada correctamente`);
      loadUsersWithCredits();
      fetchLicenses();
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
    { id: "flowpro", label: "Generador Flow-Pro", icon: Zap, badge: "Oficial" },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "keys", label: "Licencias Emitidas", icon: Key },
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.id === "flowpro" ? "text-destructive" : ""}`} />
                {item.label}
              </div>
              {"badge" in item && (
                <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded font-mono">
                  {item.badge}
                </span>
              )}
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
            <Button
              size="sm"
              onClick={() => setActiveTab("flowpro")}
              className="bg-destructive hover:bg-destructive/90 text-white text-xs h-8 font-medium gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Generar Flow-Pro
            </Button>
            <Badge variant="outline" className="hidden lg:inline-flex border-zinc-700 bg-zinc-900 text-zinc-400 text-[10px] max-w-[220px] truncate">
              {profile?.email}
            </Badge>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 min-w-0">
          {activeTab === "summary" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 text-zinc-400">
                      <span className="text-xs">Usuarios Registrados</span>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-semibold text-white">{users.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 text-zinc-400">
                      <span className="text-xs">Licencias Emitidas</span>
                      <Key className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="text-2xl font-semibold text-white">{licenses.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 text-zinc-400">
                      <span className="text-xs">API Flow-Pro</span>
                      <Zap className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-semibold text-white">Online</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 text-zinc-400">
                      <span className="text-xs">Estado del Servidor</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-semibold text-white">Operativo</div>
                  </CardContent>
                </Card>
              </div>

              {/* Generador Flow-Pro en Resumen para acceso inmediato */}
              <FlowProGeneratorCard onSuccess={fetchLicenses} />

              <ExtensionUploadCard />
            </>
          )}

          {activeTab === "flowpro" && (
            <div className="space-y-6">
              <FlowProGeneratorCard onSuccess={fetchLicenses} />
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Licencias Recientes Flow-Pro</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Últimas claves registradas en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
                    {licenses.slice(0, 10).map((lic) => (
                      <div key={lic.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Key className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <code className="font-mono text-zinc-200 truncate">{lic.license_key}</code>
                          <span className="text-zinc-500 truncate">({lic.display_name})</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-zinc-700">
                          {lic.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-sm font-semibold">Gestión de Usuarios</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    {users.length} registrados
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    placeholder="Buscar por correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-zinc-800 bg-zinc-950/50">
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase">Usuario</th>
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase">Rol</th>
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase">Prueba</th>
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase">Licencias</th>
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase">Créditos</th>
                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchingUsers ? (
                        <tr><td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">Cargando...</td></tr>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-950/50">
                            <td className="px-4 py-3">
                              <p className="text-sm text-white font-medium">{u.email}</p>
                              {u.phone && <p className="text-xs text-green-400">📱 {u.phone}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-[10px] ${roleStyles(u.role || "user")}`}>
                                {roleLabelOf(u.role || "user")}
                              </Badge>
                            </td>
                            <td className="px-4 py-3"><TrialBadge user={u} /></td>
                            <td className="px-4 py-3"><LicenseCountBadge user={u} /></td>
                            <td className="px-4 py-3 text-sm font-semibold">{u.credits ?? 0}</td>
                            <td className="px-4 py-3 text-right">
                              <UserActions
                                user={u}
                                onRecharge={() => { setRechargeTarget(u); setRechargeAmount("10"); }}
                                onToggleActivation={() => handleToggleActivation(u)}
                                onAssignLicense={() => { setAssignTarget(u); setAssignDays(30); setAssignedResult(null); }}
                                onBlockToggle={() => handleBlockToggle(u)}
                                onDelete={() => setDeleteTarget(u)}
                                toggling={togglingUserId === u.id}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">Sin usuarios encontrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "keys" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FlowProGeneratorCard onSuccess={fetchLicenses} />
              </div>
              <div className="lg:col-span-2">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold">Historial de Licencias</CardTitle>
                      <CardDescription className="text-xs text-zinc-500">Claves activas y expiradas</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchLicenses} disabled={isLoadingLicenses} className="h-8 w-8 text-zinc-400">
                      <RefreshCw className={`w-4 h-4 ${isLoadingLicenses ? "animate-spin" : ""}`} />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
                      {filteredLicenses.map((lic) => (
                        <div key={lic.id} className="p-3 sm:p-4 flex items-center justify-between text-sm hover:bg-zinc-950/50">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <Key className="w-3.5 h-3.5 text-destructive shrink-0" />
                              <span className="font-mono text-xs text-amber-300 font-semibold truncate">{lic.license_key}</span>
                            </div>
                            <div className="text-xs text-zinc-400">{lic.display_name} {lic.customer_phone ? `· ${lic.customer_phone}` : ""}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[10px]">{lic.status}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleResetHwid(lic.license_key)} title="Reset HWID">
                              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRevoke(lic.license_key)} title="Revocar">
                              <XCircle className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "stats" && <StatsPanel users={users} licenses={licenses} />}

          {activeTab === "system" && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Configuración de Plataforma</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Parámetros del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div>
                    <p className="text-sm font-medium">API Flow-Pro Endpoint</p>
                    <p className="text-xs text-zinc-500 font-mono">https://flow-pro.online/api/admin/licenses/generate</p>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Conectado</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={!!assignTarget} onOpenChange={(o) => { if (!o) { setAssignTarget(null); setAssignedResult(null); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-destructive" /> Asignar Licencia Flow-Pro
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">{assignTarget?.email}</DialogDescription>
          </DialogHeader>
          {!assignedResult ? (
            <div className="space-y-4 py-2">
              <label className="text-xs text-zinc-400">Duración en Días</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 30, 90, 365].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={assignDays === d ? "default" : "outline"}
                    onClick={() => setAssignDays(d)}
                    className="h-10 text-xs"
                  >
                    {d} días
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-xs text-green-500 font-medium">Licencia asignada con éxito</p>
              <code className="block w-full font-mono text-xs break-all bg-zinc-950 p-2.5 border border-zinc-800 rounded">
                {assignedResult.license_key}
              </code>
            </div>
          )}
          <DialogFooter>
            {!assignedResult ? (
              <Button onClick={handleAssignLicense} disabled={isAssigning} className="bg-destructive hover:bg-destructive/90">
                {isAssigning ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Asignar
              </Button>
            ) : (
              <Button onClick={() => { setAssignTarget(null); setAssignedResult(null); }}>Cerrar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
