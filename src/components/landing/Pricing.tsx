import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Rocket, Heart, TrendingUp, Zap, DollarSign, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Pricing = () => {
  const plans = [
    {
      id: "basico",
      name: "Plan Básico",
      duration: "1 Día",
      price: "$5.99",
      pricePen: "S/ 22.50",
      description: "Ideal para probar el servicio o finalizar un pequeño proyecto.",
      features: [
        "Lovable ilimitado por 1 día",
        "Sin consumo de créditos oficiales",
        "Acceso inmediato al panel",
        "Soporte por WhatsApp",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Plan Pro",
      duration: "7 Días",
      price: "$13.99",
      pricePen: "S/ 52.50",
      description: "La opción preferida por builders y freelancers en Perú.",
      features: [
        "Lovable ilimitado por 7 días",
        "Sin consumo de créditos oficiales",
        "Acceso inmediato al panel",
        "Soporte prioritario 24/7",
        "Guía de optimización de prompts",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Plan Premium",
      duration: "30 Días",
      price: "$18.99",
      pricePen: "S/ 71.50",
      oldPrice: "$35.00",
      oldPricePen: "S/ 131.00",
      badge: "Oferta por tiempo limitado",
      description: "Para agencias y desarrolladores de alto rendimiento.",
      features: [
        "Lovable ilimitado por 30 días",
        "Sin consumo de créditos oficiales",
        "Acceso inmediato al panel",
        "Soporte VIP directo",
        "Actualizaciones garantizadas",
      ],
      popular: false,
    },
  ];

  return (
    <section id="precios" className="py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_80%)] opacity-[0.03] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter">
            PLANES DE <span className="text-primary text-glow">ALTO RENDIMIENTO</span>
          </h2>
          <p className="text-muted-foreground text-xl font-light">
            Energía ilimitada para tus proyectos. Paga solo por el tiempo que necesitas, sin letras pequeñas.
          </p>
          <div className="inline-block mt-8 py-2 px-6 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <p className="text-sm font-bold text-primary tracking-widest uppercase">
              Precios en Soles (PEN) • Pago Seguro con Izipay
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border ${
                plan.popular 
                  ? "border-primary/50 glass-card shadow-[0_0_40px_rgba(var(--color-primary),0.1)]" 
                  : "border-white/10 bg-white/[0.02] backdrop-blur-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-tighter text-primary-foreground">
                  Más Recomendado
                </div>
              )}
              <CardContent className="p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white">{plan.name}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{plan.duration}</p>
                  </div>
                  {plan.badge && (
                    <span className="px-3 py-1 bg-destructive/20 border border-destructive/30 text-destructive text-[10px] font-black uppercase tracking-tight rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                
                <div className="mb-10 flex items-baseline gap-3">
                  <span className="text-5xl font-black tracking-tighter text-white">{plan.price}</span>
                  {plan.oldPrice && (
                    <span className="text-lg text-muted-foreground line-through decoration-destructive decoration-2">{plan.oldPrice}</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-8 h-12 leading-relaxed">{plan.description}</p>
                
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm group">
                      <div className="w-5 h-5 rounded-sm border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary transition-colors">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-white/80 group-hover:text-white transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/checkout/$plan"
                  params={{ plan: plan.id }}
                  className={`block w-full py-5 rounded-none font-black uppercase tracking-widest text-center transition-all duration-300 transform ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)]"
                      : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)]"
                  }`}
                >
                  Pagar Ahora
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-3xl border p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">Comparativa: ¿Por qué Lovable Infinito?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-xl font-bold text-destructive">
                  <ShieldAlert className="w-6 h-6" /> Créditos Oficiales
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span>Créditos Finitos: Se terminan rápido y pagas más cada vez.</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span>Precios en USD: Sujetos a la volatilidad del dólar.</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="w-5 h-5 text-destructive shrink-0" />
                    <span>Miedo a experimentar: Cada click te cuesta dinero.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-xl font-bold text-primary">
                  <Rocket className="w-6 h-6" /> Lovable Infinito
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">Libertad Total: Construye sin mirar el contador.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">Precios Globales: Accesibles en dólares (USD).</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">Enfoque en Lanzar: Termina tus proyectos en tiempo récord.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 text-center pt-8 border-t">
              <p className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500" /> para builders de Perú
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-10 md:p-16 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_60%)] opacity-[0.08] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-block py-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
                Oportunidad de Negocio
              </span>
              
              <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">
                TU PROPIO NEGOCIO DE <span className="text-primary text-glow">LICENCIAS</span>
              </h3>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                ¿Cansado de intercambiar horas por dinero? Conviértete en revendedor, genera licencias ilimitadas y cobra lo que <span className="text-foreground font-semibold">tú decidas</span>. Una inversión mínima que se recupera con tus primeras ventas. Tú pones el precio, tú te quedas con la ganancia.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto text-left">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Margen 100% Tuyo</p>
                    <p className="text-xs text-muted-foreground mt-1">Tú pones el precio. Tú cobras. Sin intermediarios.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Panel Automático</p>
                    <p className="text-xs text-muted-foreground mt-1">Genera y entrega licencias en segundos, sin esfuerzo.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Clientes Ilimitados</p>
                    <p className="text-xs text-muted-foreground mt-1">No hay techo. Cuantos más vendas, más ganas.</p>
                  </div>
                </div>
              </div>
              
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--color-primary),0.3)]"
              >
                <TrendingUp className="w-4 h-4" />
                Quiero Generar Ingresos
              </Link>
              
              <p className="mt-6 text-xs text-muted-foreground uppercase tracking-widest">
                Inversión mínima • Recupera con tus primeras ventas • Soporte incluido
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
