import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
  Flame, Star, Crown, Check, TrendingUp, DollarSign, 
  ShoppingBag, ArrowUpRight, Sparkles, RefreshCw, 
  Clock, ShieldCheck, Zap, Download, CreditCard, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ExtensionDownloadCard } from "./ExtensionDownloadCard";

interface Order {
  id: string;
  amount_pen: number;
  currency: string;
  days: number;
  status: string;
  plan_id: string;
  license_key: string | null;
  created_at: string;
}

export interface CardSummaryProps {
  orders?: Order[];
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * Componente CardSummary: Resumen de ventas con paleta estética completamente MORADA
 */
export const CardSummary = ({ orders = [], loading = false, onRefresh }: CardSummaryProps) => {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "month" | "today">("all");

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      if (filterPeriod === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (filterPeriod === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, filterPeriod]);

  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter((o) => o.status === "paid" || o.status === "approved");
    const totalCents = (paidOrders.length > 0 ? paidOrders : filteredOrders).reduce(
      (sum, o) => sum + (o.amount_pen || 0),
      0
    );
    const totalPen = totalCents > 1000 ? (totalCents / 100).toFixed(2) : totalCents.toFixed(2);
    const count = filteredOrders.length;
    const paidCount = paidOrders.length;
    const avgTicket = count > 0 ? (Number(totalPen) / count).toFixed(2) : "0.00";

    return {
      totalPen,
      count,
      paidCount,
      avgTicket,
    };
  }, [filteredOrders]);

  return (
    <div className="relative rounded-3xl border border-purple-500/50 bg-gradient-to-br from-[#1b082e] via-[#120520] to-[#0a0214] p-6 lg:p-8 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl overflow-hidden transition-all duration-300">
      {/* Resplandores decorativos morados intensos de fondo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-purple-500/15 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Cabecera del Resumen de ventas */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/30 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-600/50 text-white">
              <DollarSign className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-extrabold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Métricas Comerciales
                </span>
                <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/50 text-[10px] uppercase font-black tracking-wider shadow-sm shadow-purple-600/30">
                  En Vivo
                </Badge>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Resumen de ventas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex bg-purple-950/80 border border-purple-500/40 rounded-2xl p-1 shadow-inner shadow-purple-950">
              <button
                type="button"
                onClick={() => setFilterPeriod("all")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  filterPeriod === "all"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/50"
                    : "text-purple-200/80 hover:text-white hover:bg-purple-900/40"
                }`}
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("month")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  filterPeriod === "month"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/50"
                    : "text-purple-200/80 hover:text-white hover:bg-purple-900/40"
                }`}
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("today")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  filterPeriod === "today"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/50"
                    : "text-purple-200/80 hover:text-white hover:bg-purple-900/40"
                }`}
              >
                Hoy
              </button>
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={loading}
                className="border-purple-500/40 bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/80 h-10 w-10 rounded-2xl shadow-md shadow-purple-950/40 transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Bloque principal de estadísticas en morado radiante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta 1: Total facturado */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-900/40 to-purple-950/60 p-5 relative overflow-hidden backdrop-blur hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-900/40 transition duration-300">
            <div className="flex items-center justify-between text-purple-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Total Facturado</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-purple-100 shadow-sm shadow-purple-600/30">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight tabular-nums">
              S/ {stats.totalPen}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-purple-300 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-purple-300" />
              <span>Ingresos brutos acumulados</span>
            </div>
          </div>

          {/* Tarjeta 2: Órdenes registradas */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-900/40 to-purple-950/60 p-5 relative overflow-hidden backdrop-blur hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-900/40 transition duration-300">
            <div className="flex items-center justify-between text-purple-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Órdenes Generadas</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-purple-100 shadow-sm shadow-purple-600/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight tabular-nums">
              {stats.count}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-purple-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>Pedidos de planes o recargas</span>
            </div>
          </div>

          {/* Tarjeta 3: Ventas confirmadas */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-900/40 to-purple-950/60 p-5 relative overflow-hidden backdrop-blur hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-900/40 transition duration-300">
            <div className="flex items-center justify-between text-purple-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Ventas Confirmadas</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-purple-100 shadow-sm shadow-purple-600/30">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight tabular-nums">
              {stats.paidCount > 0 ? stats.paidCount : stats.count}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-purple-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Licencias activadas y entregadas</span>
            </div>
          </div>

          {/* Tarjeta 4: Ticket promedio */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-900/40 to-purple-950/60 p-5 relative overflow-hidden backdrop-blur hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-900/40 transition duration-300">
            <div className="flex items-center justify-between text-purple-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Ticket Promedio</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-purple-100 shadow-sm shadow-purple-600/30">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight tabular-nums">
              S/ {stats.avgTicket}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-purple-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-purple-300" />
              <span>Promedio por transacción</span>
            </div>
          </div>
        </div>

        {/* Tabla/Listado reciente con estilo morado */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 overflow-hidden shadow-inner">
          <div className="px-5 py-3.5 border-b border-purple-500/25 flex items-center justify-between bg-purple-900/30">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-200">
              Últimas Transacciones Registradas
            </span>
            <span className="text-[11px] text-purple-300/90 font-semibold">
              Moneda: PEN (Soles peruanos)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 text-purple-300/80 uppercase tracking-wider bg-purple-950/30">
                  <th className="px-4 py-3 font-bold">ID Orden</th>
                  <th className="px-4 py-3 font-bold">Plan / Días</th>
                  <th className="px-4 py-3 font-bold">Monto</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 font-bold text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15 text-white/90">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-purple-300/70 font-medium">
                      No hay transacciones registradas actualmente.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const amount =
                      order.amount_pen > 1000
                        ? (order.amount_pen / 100).toFixed(2)
                        : Number(order.amount_pen).toFixed(2);
                    const isPaid = order.status === "paid" || order.status === "approved";

                    return (
                      <tr key={order.id} className="hover:bg-purple-800/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-purple-200 font-medium">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-semibold capitalize text-purple-100">
                          {order.plan_id || "Plan Estándar"} ({order.days}d)
                        </td>
                        <td className="px-4 py-3 font-extrabold text-purple-300">
                          S/ {amount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isPaid
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-purple-500/30 text-purple-200 border-purple-400/40"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPaid ? "bg-emerald-400" : "bg-purple-400 animate-pulse"
                              }`}
                            />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-purple-300/80 font-mono">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth(true);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("payment_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error("Error al cargar ordenes:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const plans = [
    {
      planId: "diario",
      name: "Plan Diario",
      duration: "24 Horas",
      pricePen: "S/ 39.00",
      priceUsd: "≈ $10.50 USD",
      icon: <Flame className="w-5 h-5" />,
      features: [
        "Lovable ilimitado por 24 horas",
        "Sin consumo de créditos oficiales",
        "Acceso instantáneo al panel",
        "Soporte por WhatsApp en español",
      ],
    },
    {
      planId: "semanal",
      name: "Plan Semanal",
      duration: "7 Días",
      pricePen: "S/ 79.00",
      priceUsd: "≈ $21.00 USD",
      popular: true,
      icon: <Star className="w-5 h-5" />,
      features: [
        "Lovable ilimitado por 7 días",
        "Sin consumo de créditos oficiales",
        "Acceso prioritario y panel exclusivo",
        "Soporte prioritario 24/7",
        "Guía de optimización de prompts",
      ],
    },
    {
      planId: "quincenal",
      name: "Plan Quincenal",
      duration: "15 Días",
      pricePen: "S/ 149.00",
      priceUsd: "≈ $39.50 USD",
      icon: <Crown className="w-5 h-5" />,
      features: [
        "Lovable ilimitado por 15 días continuos",
        "Sin consumo de créditos oficiales",
        "Acceso multi-proyecto sin restricciones",
        "Soporte VIP directo",
        "Actualizaciones de extensión garantizadas",
      ],
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-purple-400 font-bold">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f071b] via-[#130726] to-[#0a0414] text-white pb-16 relative overflow-hidden">
      {/* Luces ambientales moradas de fondo */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Barra superior con tonalidades moradas */}
      <header className="sticky top-0 z-30 border-b border-purple-500/20 bg-[#0f071b]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">LOVABLE INFINITO</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Panel Principal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile?.role === "superadmin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/superadmin" })}
              className="border-purple-500/40 text-purple-200 hover:bg-purple-900/50 text-xs font-semibold"
            >
              Panel SuperAdmin
            </Button>
          )}
          {profile?.role === "reseller" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/reseller" })}
              className="border-purple-500/40 text-purple-200 hover:bg-purple-900/50 text-xs font-semibold"
            >
              Panel Reseller
            </Button>
          )}
          <span className="text-xs text-purple-200/70 hidden md:inline-block font-mono">{profile?.email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-10">
        {/* Componente CardSummary: Resumen de ventas con color morado */}
        <CardSummary
          orders={orders}
          loading={loadingOrders}
          onRefresh={fetchOrders}
        />

        {/* Sección de Selección de Planes */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Planes activos en Soles
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Elige el ritmo que necesitas</h2>
            <p className="text-sm text-purple-200/70">
              Energía ilimitada para tus proyectos en Lovable. Paga en Soles (S/) vía Izipay, Yape o Tarjetas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-6 transition duration-200 hover:-translate-y-1 backdrop-blur-xl ${
                  p.popular
                    ? "border-purple-500/80 bg-gradient-to-b from-purple-900/70 via-purple-950/80 to-[#0e051d] shadow-2xl shadow-purple-600/25 ring-1 ring-purple-500/40"
                    : "border-purple-500/30 bg-gradient-to-b from-purple-950/50 to-[#0e051d]/70 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-950/50"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-md shadow-purple-600/40 text-white">
                    Más popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/40 to-purple-600/10 border border-purple-500/40 flex items-center justify-center mb-5 text-purple-300 shadow-sm shadow-purple-600/20">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-4">
                  {p.duration}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold tracking-tight">{p.pricePen}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-6 font-mono">
                  {p.priceUsd} • Tarifa final en PEN
                </p>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate({ to: "/checkout/$plan", params: { plan: p.planId } })}
                  className={`w-full rounded-2xl h-12 font-bold text-sm tracking-wide transition-all ${
                    p.popular
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/40 text-white"
                      : "bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200"
                  }`}
                >
                  Activar acceso
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Descarga de extensión */}
        <ExtensionDownloadCard />
      </main>
    </div>
  );
};
export default Dashboard;
