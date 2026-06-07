import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Rocket, Heart } from "lucide-react";

export const Pricing = () => {
  const plans = [
    {
      name: "Plan Básico",
      duration: "1 Día",
      price: "$5.99",
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
      name: "Plan Pro",
      duration: "7 Días",
      price: "S/ 52",
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
      name: "Plan Premium",
      duration: "30 Días",
      price: "S/ 69",
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
              Precios en Soles (S/) • Pago Seguro
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
                </div>
                
                <div className="mb-10">
                  <span className="text-5xl font-black tracking-tighter text-white">{plan.price}</span>
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
                
                <button className={`w-full py-5 rounded-none font-black uppercase tracking-widest transition-all duration-300 transform ${
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)]" 
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}>
                  Activar Acceso
                </button>
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
                    <span className="font-medium text-foreground">Optimizado para Perú: Precios accesibles en Soles.</span>
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
      </div>
    </section>
  );
};
