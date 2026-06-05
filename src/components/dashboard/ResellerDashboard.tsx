import { LayoutDashboard, Key, ClipboardList, History, Users, Wallet, Settings, LifeBuoy, Zap, Plus, Infinity, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";

export const ResellerDashboard = () => {
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
              <span className="font-bold text-lg tracking-tight text-white uppercase italic">Painel de Revenda</span>
            </div>

            <nav className="space-y-1">
              <ResellerNavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
              <ResellerNavItem icon={<Key className="w-5 h-5" />} label="Gerar Licenças" />
              <ResellerNavItem icon={<ClipboardList className="w-5 h-5" />} label="Licenças Ativas" />
              <ResellerNavItem icon={<History className="w-5 h-5" />} label="Histórico" />
              <ResellerNavItem icon={<Users className="w-5 h-5" />} label="Clientes" />
              <ResellerNavItem icon={<Wallet className="w-5 h-5" />} label="Financeiro" />
              <ResellerNavItem icon={<Settings className="w-5 h-5" />} label="Configurações" />
              <ResellerNavItem icon={<LifeBuoy className="w-5 h-5" />} label="Suporte" />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#02060E]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white italic uppercase tracking-tight">Painel de Revenda</h1>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-md py-0.5 font-bold text-[10px]">Ativo</Badge>
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
              <MetricCard title="LICENÇAS GERADAS" value="128" subtitle="Total de licenças" />
              <MetricCard title="ATIVAS" value="96" subtitle="Licenças ativas" />
              <MetricCard title="TESTE" value="32" subtitle="Licenças de teste" />
              <MetricCard title="REVENDA" value="70%" subtitle="Desconto aplicado" />
            </div>

            {/* License Generation Section */}
            <Card className="rounded-xl border-white/5 bg-[#0A101F] p-8">
              <h2 className="text-xl font-bold text-white italic uppercase tracking-tight mb-2">Gerar Nova Licença</h2>
              <p className="text-muted-foreground text-sm mb-8">Escolha o tipo de licença</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LicenseTypeCard 
                  icon={<Plus className="w-10 h-10 text-primary" />} 
                  title="LICENÇA DE TESTE" 
                  description="Período de teste" 
                />
                <LicenseTypeCard 
                  icon={<CalendarDays className="w-10 h-10 text-primary" />} 
                  title="LICENÇA MENSAL" 
                  description="Acesso por 30 dias" 
                />
                <LicenseTypeCard 
                  icon={<Infinity className="w-10 h-10 text-primary" />} 
                  title="LICENÇA VITALÍCIA" 
                  description="Acesso vitalício" 
                />
              </div>
            </Card>

            {/* Recent Licenses Table */}
            <Card className="rounded-xl border-white/5 bg-[#0A101F] overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-white italic uppercase tracking-tight">Licenças Recentes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/[0.01]">
                      <th className="px-6 py-4">TIPO</th>
                      <th className="px-6 py-4">CÓDIGO</th>
                      <th className="px-6 py-4">PLANO</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-right">DATA</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <LicenseRow type="Teste" code="TEST-ABCD-1234" plan="7 dias" date="20/05/2024" />
                    <LicenseRow type="Mensal" code="MENS-EFGH-5678" plan="30 dias" date="20/05/2024" />
                    <LicenseRow type="Vitalícia" code="VITA-IJKL-9101" plan="Vitalício" date="20/05/2024" />
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary fill-primary" />
              <p className="text-xs text-white/90">Gere licenças e aumente seus lucros revendendo Lovable Adict!</p>
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

const LicenseTypeCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-[#111827] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-all">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-2">{title}</h3>
    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-6">{description}</p>
    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-tighter h-11 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
      GERAR
    </Button>
  </div>
);

const LicenseRow = ({ type, code, plan, date }: { type: string, code: string, plan: string, date: string }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
    <td className="px-6 py-4 text-white font-medium">{type}</td>
    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{code}</td>
    <td className="px-6 py-4 text-muted-foreground">{plan}</td>
    <td className="px-6 py-4">
      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-sm py-0.5 px-2 font-bold text-[10px]">Ativa</Badge>
    </td>
    <td className="px-6 py-4 text-right text-muted-foreground font-medium">{date}</td>
  </tr>
);
