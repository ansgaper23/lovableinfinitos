import React from "react";
import { Users, TrendingUp, Activity, Key, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface ExtendedProfile {
  id: string;
  email?: string | null;
  role?: string | null;
  credits?: number;
  created_at: string;
  phone?: string | null;
  licenses_paid?: number;
}

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-zinc-900 border-zinc-800">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3 text-zinc-400">
        <span className="text-[11px] sm:text-xs truncate">{label}</span>
        <span className="shrink-0">{icon}</span>
      </div>
      <div className="text-lg sm:text-2xl font-semibold text-white tabular-nums truncate">{value}</div>
    </CardContent>
  </Card>
);

const MiniRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-zinc-400 flex items-center gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
    <span className="text-white font-mono tabular-nums">{value}</span>
  </div>
);

export const StatsPanel = ({ users, licenses }: { users: any[]; licenses: any[] }) => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const totalUsers = users.length;
  const withPhone = users.filter((u) => !!u.phone).length;
  const phonePct = totalUsers > 0 ? Math.round((withPhone / totalUsers) * 100) : 0;
  const signups7d = users.filter((u) => now - new Date(u.created_at).getTime() < 7 * DAY).length;
  const signups30d = users.filter((u) => now - new Date(u.created_at).getTime() < 30 * DAY).length;
  const signupsToday = users.filter((u) => new Date(u.created_at).toDateString() === new Date().toDateString()).length;
  const totalCredits = users.reduce((sum, u) => sum + (u.credits ?? 0), 0);
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const trialLicenses = licenses.filter((l) => l.type === "trial").length;
  const paidLicenses = licenses.filter((l) => l.type !== "trial").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Usuarios totales" value={totalUsers.toString()} icon={<Users className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Hoy" value={signupsToday.toString()} icon={<TrendingUp className="w-4 h-4 text-green-400" />} />
        <StatCard label="Últimos 7 días" value={signups7d.toString()} icon={<Activity className="w-4 h-4 text-cyan-400" />} />
        <StatCard label="Últimos 30 días" value={signups30d.toString()} icon={<Activity className="w-4 h-4 text-purple-400" />} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Licencias Flow-Pro" value={totalLicenses.toString()} icon={<Key className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Activas" value={activeLicenses.toString()} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
        <StatCard label="Pruebas" value={trialLicenses.toString()} icon={<Clock className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Pagas" value={paidLicenses.toString()} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Métricas de Clientes</CardTitle>
          <CardDescription className="text-xs text-zinc-500">Resumen global del ecosistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <MiniRow label="Usuarios con celular / WhatsApp" value={`${withPhone} (${phonePct}%)`} icon="📱" />
          <MiniRow label="Créditos en circulación" value={totalCredits.toString()} icon="💳" />
          <MiniRow label="Total licencias emitidas" value={totalLicenses.toString()} icon="⚡" />
        </CardContent>
      </Card>
    </div>
  );
};
