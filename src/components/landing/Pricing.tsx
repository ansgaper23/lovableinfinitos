import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Rocket, Heart, TrendingUp, Zap, DollarSign, Users, Flame, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Pricing = () => {
  const plans = [
    {
      id: "diario",
      name: "Plan Diario",
      duration: "Acceso 24 Horas",
      price: "S/ 39.00",
      priceUsd: "≈ $10.50 USD",
      description: "Ideal para probar el servicio o finalizar entregas rápidas de proyectos.",
      features: [
        "Lovable Ilimitado por 24 horas",
        "Sin consumo de créditos oficiales",
        "Acceso instantáneo al panel",
        "Generación sin cuotas por prompt",
        "Soporte por WhatsApp en español",
      ],
      popular: false,
    },
    {
      id: "semanal",
      name: "Plan Semanal",
      duration: "Acceso 7 Días",
      price: "S/ 79.00",
      priceUsd: "≈ $21.00 USD",
      oldPrice: "S/ 119.00",
      badge: "Más Popular",
      description: "La opción preferida por builders, startups y freelancers activos.",
      features: [
        "Lovable Ilimitado por 7 días completos",
        "Sin consumo de créditos oficiales",
        "Acceso prioritario y panel exclusivo",
        "Soporte prioritario 24/7 vía WhatsApp",
        "Guía de optimización de prompts y flujos",
        "Garantía de uptime 99.9%",
      ],
      popular: true,
    },
    {
      id: "quincenal",
      name: "Plan Quincenal",
      duration: "Acceso 15 Días",
      price: "S/ 149.00",
      priceUsd: "≈ $39.50 USD",
      oldPrice: "S/ 219.00",
      badge: "Mejor Valor",
      description: "Para desarrolladores intensivos y agencias que construyen a gran escala.",
      features: [
        "Lovable Ilimitado por 15 días continuos",
        "Sin consumo de créditos oficiales",
        "Acceso multi-proyecto sin restricciones",
        "Soporte VIP directo",
        "Actualizaciones de extensión garantizadas",
        "Máximo ahorro por día de desarrollo",
      ],
      popular: false,
    },
  ];

  return (
    <section id="precios" className="py-28 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_80%)] opacity-[0.03] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Precios en Soles (S/)
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter">
            PLANES <span className="text-primary text-glow">ILIMITADOS</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-light">
            Energía ilimitada para tus proyectos. Paga en tu moneda local sin sorpresas ni costes ocultos por crédito.
          </p>
          <div className="inline-block mt-4 py-2 px-6 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-md">
            <p className="text-xs md:text-sm font-semibold text-primary/90 tracking-wide">
              🇵🇪 Precios fijos en Soles (S/) • Aceptamos Tarjetas, Yape, Plin y transferencia vía Izipay
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden flex flex-col transition-all duration-300 hover:translate-y-[-4px] border ${
                plan.popular 
                  ? "border-primary/60 bg-gradient-to-b from-primary/10 via-background to-background shadow-[0_0_40px_rgba(var(--color-primary),0.15)] ring-1 ring-primary/40" 
                  : "border-white/10 bg-white/[0.02] backdrop-blur-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[11px] font-black uppercase tracking-wider text-primary-foreground">
                  ⭐ Más Popular
                </div>
              )}
              {plan.badge && !plan.popular && (
                <div className="absolute top-0 right-0 bg-secondary/80 text-foreground px-4 py-1 text-[11px] font-black uppercase tracking-wider border-b border-l border-white/10">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" /> {plan.badge}
                  </span>
                </div>
              )}
              <CardContent className="p-8 md:p-10 flex flex-col flex-grow justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-black italic tracking-tighter text-white">{plan.name}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{plan.duration}</p>
                  </div>
                  
                  <div className="mb-2 flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-white">{plan.price}</span>
                    {plan.oldPrice && (
                      <span className="text-lg text-muted-foreground line-through decoration-destructive decoration-2">{plan.oldPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 font-mono">
                    {plan.priceUsd} • Tarifa final sin impuestos adicionales
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-6 min-h-[40px] leading-relaxed">{plan.description}</p>
                  
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={`${plan.id}-feat-${idx}`} className="flex items-start gap-3 text-sm group">
                        <div className="w-5 h-5 rounded-sm border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary transition-colors bg-primary/10">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-white/90 group-hover:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link
                  to="/auth"
                  className={`block w-full py-4 rounded-lg font-black uppercase tracking-wider text-center text-sm transition-all duration-300 shadow-md ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--color-primary),0.5)] hover:brightness-110"
                      : "bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                  }`}
                >
                  Activar {plan.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparativa: Lovable Oficial vs Lovable Ilimitado */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-background/80 rounded-3xl border border-white/10 p-8 md:p-12 shadow-xl backdrop-blur-md">
            <h3 className="text-2xl md:text-3xl font-black mb-10 text-center tracking-tight">
              Comparativa: <span className="text-muted-foreground">Lovable Oficial</span> vs <span className="text-primary text-glow">Lovable Ilimitado</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6 p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
                <h4 className="flex items-center gap-2 text-xl font-bold text-destructive">
                  <ShieldAlert className="w-6 h-6" /> Lovable Oficial
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-muted-foreground text-sm">
                    <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Créditos Finitos:</strong> Se agotan rápido y debes recargar packs costosos constantemente.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground text-sm">
                    <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Precios en USD:</strong> Cobros en dólares con recargos bancarios e impuestos de tarjeta.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground text-sm">
                    <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Ansiedad por créditos:</strong> Miedo a iterar o experimentar porque cada prompt consume saldo.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6 p-6 rounded-2xl bg-primary/5 border border-primary/30">
                <h4 className="flex items-center gap-2 text-xl font-bold text-primary">
                  <Rocket className="w-6 h-6" /> Lovable Ilimitado
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground"><strong>Libertad Total:</strong> Construye e itera sin mirar el contador de créditos.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground"><strong>Precios en Soles (S/):</strong> Pagos directos en moneda local vía Yape, Plin y tarjetas.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground"><strong>Enfoque en Lanzar:</strong> Desarrolla aplicaciones completas en tiempo récord sin pausas.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 text-center pt-6 border-t border-white/5">
              <p className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
                Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500" /> para la comunidad de builders en Perú y Latinoamérica
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Negocio / Revendedor */}
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-14 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_60%)] opacity-[0.08] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-block py-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
                Oportunidad de Negocio
              </span>
              
              <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">
                TU PROPIO NEGOCIO DE <span className="text-primary text-glow">LICENCIAS</span>
              </h3>
              
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                ¿Cansado de intercambiar horas por dinero? Conviértete en revendedor, genera licencias ilimitadas y cobra lo que <span className="text-foreground font-semibold">tú decidas</span>. Tú pones el precio, tú te quedas con el 100% de la ganancia.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto text-left">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Margen 100% Tuyo</p>
                    <p className="text-xs text-muted-foreground mt-1">Tú pones el precio y cobras directo sin comisiones ocultas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Panel Automático</p>
                    <p className="text-xs text-muted-foreground mt-1">Genera y entrega licencias a clientes en segundos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Clientes Ilimitados</p>
                    <p className="text-xs text-muted-foreground mt-1">Alta demanda entre programadores, agencias y creadores.</p>
                  </div>
                </div>
              </div>
              
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--color-primary),0.4)] hover:brightness-110"
              >
                <TrendingUp className="w-4 h-4" />
                Quiero Ser Revendedor
              </Link>
              
              <p className="mt-6 text-xs text-muted-foreground uppercase tracking-widest">
                Inversión mínima • Recupera con tus primeras ventas • Soporte y capacitación incluidos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
