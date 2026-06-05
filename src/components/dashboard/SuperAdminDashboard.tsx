import { LayoutDashboard, Users, BarChart3, ShieldAlert, Settings, LogOut, Search, MoreVertical, CheckCircle2, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


export const SuperAdminDashboard = () => {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <AnnouncementBar />
      <div className="flex-1 mt-10 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl hidden lg:flex flex-col">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12 group">
              <div className="w-10 h-10 bg-destructive rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-destructive),0.3)]">
                <span className="text-white font-black text-2xl italic">A</span>
              </div>
              <span className="font-black text-xl tracking-tighter italic">SUPER<span className="text-destructive">ADMIN</span></span>
            </div>

            <nav className="space-y-2">
              <AdminNavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Resumen" active />
              <AdminNavItem icon={<Users className="w-5 h-5" />} label="Gestión Usuarios" />
              <AdminNavItem icon={<BarChart3 className="w-5 h-5" />} label="Estadísticas" />
              <AdminNavItem icon={<ShieldAlert className="w-5 h-5" />} label="Seguridad" />
              <AdminNavItem icon={<Settings className="w-5 h-5" />} label="Sistema" />
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-white/5">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              Salir al Inicio
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(circle_at_top_left,var(--color-destructive),transparent_90%)] bg-opacity-[0.02]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Control Maestro</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-black">Sistema de Gestión Centralizada</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-none border-white/10 bg-white/5 uppercase font-black text-xs tracking-widest">
                  Exportar Reporte
                </Button>
                <Button className="rounded-none bg-destructive hover:bg-destructive/90 text-white uppercase font-black text-xs tracking-widest shadow-[0_0_20px_rgba(var(--color-destructive),0.3)]">
                  Nuevo Usuario
                </Button>
              </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <AdminStatCard title="Usuarios Totales" value="1,284" change="+12% mensual" icon={<Users className="text-destructive" />} />
              <AdminStatCard title="Ingresos (S/)" value="S/ 45,200" change="+8% esta semana" icon={<DollarSign className="text-destructive" />} />
              <AdminStatCard title="Créditos Consumidos" value="4.2M" change="Normal" icon={<TrendingUp className="text-destructive" />} />
              <AdminStatCard title="Alertas Sistema" value="0" subtitle="Todo estable" icon={<CheckCircle2 className="text-green-500" />} />
            </div>

            {/* User Management Table */}
            <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-white/5">
                <div>
                  <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Usuarios Recientes</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Control de acceso y planes</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar usuario..." className="pl-10 rounded-none border-white/10 bg-white/5 text-xs h-10" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usuario</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expira</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <UserRow name="Carlos Ruiz" email="carlos@example.com" plan="Premium" status="Activo" expiry="15 Jun 2026" />
                    <UserRow name="Ana Belén" email="ana@peru.pe" plan="Pro" status="Activo" expiry="12 Jun 2026" />
                    <UserRow name="Miguel Angel" email="miguel@agencia.com" plan="Básico" status="Expirado" expiry="01 Jun 2026" />
                    <UserRow name="Lucía Torres" email="lucia@builder.dev" plan="Pro" status="Activo" expiry="20 Jun 2026" />
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* System Configuration Quick Actions */}
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
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminNavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 font-black italic tracking-tighter uppercase text-sm transition-all group ${
    active ? 'text-destructive bg-destructive/10 border-r-2 border-destructive' : 'text-muted-foreground hover:text-white hover:bg-white/5'
  }`}>
    {icon}
    {label}
  </a>
);

const AdminStatCard = ({ title, value, change, icon, subtitle }: { title: string, value: string, change?: string, icon: React.ReactNode, subtitle?: string }) => (
  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-destructive/30 transition-colors group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-none bg-white/5 flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">{title}</p>
      <h3 className="text-3xl font-black italic tracking-tighter text-white mb-1">{value}</h3>
      {change && <p className="text-[10px] text-primary font-black uppercase tracking-widest">{change}</p>}
      {subtitle && <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{subtitle}</p>}
    </CardContent>
  </Card>
);

const UserRow = ({ name, email, plan, status, expiry }: { name: string, email: string, plan: string, status: string, expiry: string }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
    <td className="p-4">
      <div>
        <p className="font-bold text-sm text-white">{name}</p>
        <p className="text-[10px] text-muted-foreground uppercase font-black">{email}</p>
      </div>
    </td>
    <td className="p-4">
      <Badge variant="outline" className="rounded-none border-primary/30 text-primary uppercase text-[9px] font-black">{plan}</Badge>
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        {status === "Activo" ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-destructive" />}
        <span className={`text-[10px] font-black uppercase tracking-widest ${status === "Activo" ? "text-green-500" : "text-destructive"}`}>{status}</span>
      </div>
    </td>
    <td className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{expiry}</td>
    <td className="p-4">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </td>
  </tr>
);
