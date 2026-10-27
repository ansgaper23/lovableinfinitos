import { MousePointerClick, Unlock, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Elige tu plan",
    description: "Selecciona la duración que necesites: 1, 7 o 30 días de acceso ilimitado.",
    icon: MousePointerClick,
  },
  {
    number: "02",
    title: "Activa tu panel",
    description: "Recibe tus credenciales de acceso de forma inmediata tras confirmar tu pago.",
    icon: Unlock,
  },
  {
    number: "03",
    title: "Construye sin límites",
    description: "Usa Lovable con créditos infinitos mientras dure tu licencia. Sin restricciones.",
    icon: Rocket,
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] opacity-[0.04] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter">
            ¿CÓMO <span className="text-primary text-glow">FUNCIONA?</span>
          </h2>
          <p className="text-muted-foreground text-xl font-light">
            Tres pasos simples para empezar a construir sin límites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative group p-10 border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-tighter text-primary/50 border-b border-l border-primary/10">
                Paso {step.number}
              </div>

              <div className="mb-8">
                <div className="w-14 h-14 border border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors duration-500">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              <h3 className="text-2xl font-black italic tracking-tighter text-white mb-4">
                {step.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Showcase Banner de la Interfaz */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-xl">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              Vista previa del entorno
            </span>
            <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-white mt-3">
              Así luce Lovable con <span className="text-primary">FlowPro Activo</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sin contadores que se agoten ni restricciones de prompts.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-950 group">
            <img
              src="/images/banner_hero.png"
              alt="Interfaz Lovable con FlowPro"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
