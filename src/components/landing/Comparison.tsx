import { Check, X, ArrowRight } from "lucide-react";

export const Comparison = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] opacity-[0.04] pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-5">
            Antes vs. Después
          </span>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-5">
            EL MISMO LOVABLE.{" "}
            <span className="text-primary text-glow">UNA FRACCIÓN DEL PRECIO.</span>
          </h2>
          <p className="text-muted-foreground text-lg font-light">
            Esto es lo que pagas hoy en Lovable oficial vs. lo que pagas aquí por la
            <span className="text-foreground font-semibold"> misma experiencia sin límites</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-4 items-stretch">
          {/* Lovable Oficial */}
          <div className="relative rounded-2xl border border-destructive/30 bg-destructive/[0.03] p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-destructive">
                Lovable Oficial
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 px-2 py-1 rounded-full border border-destructive/30">
                Lo que pagas hoy
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-white/90">$25</span>
                <span className="text-muted-foreground font-medium">/mes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                Plan Pro — créditos limitados
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                "Créditos que se acaban en días",
                "Pagos recurrentes en USD",
                "Miedo a experimentar (cada click cuesta)",
                "Sin soporte en español",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow / VS */}
          <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0">
            <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent to-primary/40" />
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary),0.3)]">
              <ArrowRight className="w-5 h-5 text-primary md:rotate-0 rotate-90" />
            </div>
            <div className="hidden md:block w-px h-12 bg-gradient-to-t from-transparent to-primary/40" />
          </div>

          {/* Lovable Infinito */}
          <div className="relative rounded-2xl border border-primary/50 bg-primary/[0.04] p-8 backdrop-blur-sm shadow-[0_0_40px_rgba(var(--color-primary),0.12)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                Lovable Infinito
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/40">
                Lo que pagas aquí
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-white">$5.99</span>
                <span className="text-muted-foreground font-medium">desde</span>
              </div>
              <p className="text-xs text-primary mt-2 uppercase tracking-widest font-bold">
                Hasta 76% menos · Pago único
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                "Créditos ilimitados durante tu plan",
                "Pago único, sin suscripciones",
                "Experimenta sin contar cada prompt",
                "Soporte 24/7 por WhatsApp en español",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <a
            href="#precios"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors border-b-2 border-primary/40 hover:border-primary pb-1"
          >
            Ver los 3 planes disponibles <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
