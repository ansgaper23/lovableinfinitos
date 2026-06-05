import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Rocket, Heart } from "lucide-react";

export const Pricing = () => {
  const plans = [
    {
      name: "Plan Básico",
      duration: "1 Día",
      price: "S/ 39",
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
      price: "S/ 79",
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
      duration: "15 Días",
      price: "S/ 149",
      description: "Para agencias y desarrolladores de alto rendimiento.",
      features: [
        "Lovable ilimitado por 15 días",
        "Sin consumo de créditos oficiales",
        "Acceso inmediato al panel",
        "Soporte VIP directo",
        "Actualizaciones garantizadas",
      ],
      popular: false,
    },
  ];

  return (
    <section id="precios" className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Planes Flexibles para tu Éxito</h2>
          <p className="text-muted-foreground text-lg">
            Selecciona el plan que mejor se adapte a tu flujo de trabajo. Sin suscripciones forzosas, paga solo por lo que necesitas.
          </p>
          <p className="text-sm font-medium text-primary mt-4 italic">
            * Precios expresados en Soles (S/). Equivalencias aproximadas según tipo de cambio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 ${
                plan.popular ? "border-primary shadow-xl shadow-primary/10" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-10 rotate-45 translate-x-[30px] translate-y-[15px]">
                    Más Popular
                  </div>
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground font-medium ml-1">/ {plan.duration}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold transition-colors ${
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}>
                  Empezar Ahora
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-3xl border p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">Comparativa: ¿Por qué Lovable Ilimitado?</h3>
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
                  <Rocket className="w-6 h-6" /> Lovable Ilimitado
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
