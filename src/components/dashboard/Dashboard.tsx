import { LayoutDashboard, Zap, Clock, Settings, LogOut, MessageSquare, CreditCard, ShieldCheck, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";




export const Dashboard = () => {
  const { user, loading } = useAuth(true);
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AnnouncementBar />
      <div className="flex-1 mt-10 bg-background text-foreground dark font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl hidden lg:flex flex-col">
        <div className="p-8">
          <a href="/" className="flex items-center gap-3 mb-12 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <span className="text-primary-foreground font-black text-2xl italic">L</span>
            </div>
            <span className="font-black text-xl tracking-tighter italic">INFINITO</span>
          </a>

          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
            <NavItem icon={<Zap className="w-5 h-5" />} label="Créditos" />
            <NavItem icon={<Clock className="w-5 h-5" />} label="Historial" />
            <NavItem icon={<CreditCard className="w-5 h-5" />} label="Suscripción" />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Ajustes" />
            <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
              <NavItem icon={<ShieldCheck className="w-5 h-5 text-destructive" />} label="SuperAdmin" href="/superadmin" />
              <NavItem icon={<Key className="w-5 h-5 text-primary" />} label="Revendedor" href="/reseller" />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">

            <a href="/">
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_80%)] bg-opacity-[0.02]">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-background/40 backdrop-blur-md">
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-[10px] font-black tracking-widest text-primary uppercase">Plan Premium</p>
            </div>
            <div className="w-10 h-10 rounded-none bg-primary/20 border border-primary/30 flex items-center justify-center font-black italic text-primary uppercase">
              {user?.email?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Welcome Card */}
          <div className="glass-card p-8 border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black italic tracking-tighter mb-2">¡BIENVENIDO A LOVABLE INFINITO!</h2>
              <p className="text-muted-foreground max-w-xl mb-6">Tu acceso está activo. Construye sin límites y lanza tus proyectos en tiempo récord con energía ilimitada.</p>
              <div className="flex flex-wrap gap-4">
                <Button className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
                  Ir a Lovable <Zap className="w-4 h-4 fill-primary-foreground" />
                </Button>
                <Button variant="outline" className="rounded-none font-black italic tracking-tighter uppercase gap-2 px-6 h-12 border-white/10 bg-white/5">
                  Ver Tutorial
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Estado de Suscripción" 
              value="ACTIVA" 
              subtitle="Quedan 6 días, 14 horas"
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              progress={80}
            />
            <StatCard 
              title="Créditos Utilizados" 
              value="ILIMITADOS" 
              subtitle="1,240 créditos hoy"
              icon={<Zap className="w-6 h-6 text-primary" />}
            />
            <StatCard 
              title="Soporte VIP" 
              value="DISPONIBLE" 
              subtitle="Respuesta en < 5 min"
              icon={<MessageSquare className="w-6 h-6 text-primary" />}
            />
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActivityItem title="Prompts enviados" time="Hace 5 minutos" value="+12" />
                <ActivityItem title="Nuevos proyectos" time="Hace 2 horas" value="3" />
                <ActivityItem title="Soporte contactado" time="Ayer" value="1" />
              </CardContent>
            </Card>

            <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Tu Plan Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 border border-primary/20 bg-primary/5 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black italic tracking-tighter text-xl uppercase">Plan Pro</span>
                    <span className="text-primary font-black italic tracking-tighter">S/ 79 / 7 DÍAS</span>
                  </div>
                  <Progress value={85} className="h-1 bg-white/5" />
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mt-4">
                    EXPIRA EL 12 JUN, 2026
                  </p>
                </div>
                <Button variant="outline" className="w-full rounded-none font-black italic tracking-tighter uppercase border-white/10 hover:border-primary transition-colors h-12">
                  Renovar o Mejorar Plan
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

const NavItem = ({ icon, label, active = false, href = "#" }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) => (
  <a href={href} className={`flex items-center gap-3 px-4 py-3 font-black italic tracking-tighter uppercase text-sm transition-all group ${
    active ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted-foreground hover:text-white hover:bg-white/5'
  }`}>
    <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}>
      {icon}
    </span>
    {label}
  </a>
);

const StatCard = ({ title, value, subtitle, icon, progress }: { title: string, value: string, subtitle: string, icon: React.ReactNode, progress?: number }) => (
  <Card className="rounded-none border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-primary/30 transition-colors group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">{title}</p>
      <h3 className="text-3xl font-black italic tracking-tighter text-white mb-1">{value}</h3>
      <p className="text-xs text-primary font-bold uppercase tracking-widest">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-4">
          <Progress value={progress} className="h-1 bg-white/5" />
        </div>
      )}
    </CardContent>
  </Card>
);

const ActivityItem = ({ title, time, value }: { title: string, time: string, value: string }) => (
  <div className="flex justify-between items-center group">
    <div>
      <p className="font-black italic tracking-tighter uppercase text-sm group-hover:text-primary transition-colors">{title}</p>
      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{time}</p>
    </div>
    <div className="text-xl font-black italic tracking-tighter text-white">{value}</div>
  </div>
);
