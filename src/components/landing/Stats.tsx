import { Users, Award, Zap, Rocket } from "lucide-react";

export const Stats = () => {
  const stats = [
    { label: "USUARIOS ACTIVOS", value: "200+", icon: Users },
    { label: "PROMPTS ENVIADOS", value: "150K+", icon: Zap },
    { label: "PROYECTOS LANZADOS", value: "850+", icon: Rocket },
    { label: "SATISFACCIÓN", value: "99.9%", icon: Award },
  ];

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10 text-3xl md:text-5xl font-black text-white group-hover:text-primary transition-colors mb-2 italic tracking-tighter">{stat.value}</div>
            <div className="relative z-10 text-[10px] md:text-xs font-black tracking-[0.2em] text-muted-foreground uppercase group-hover:text-white transition-colors">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
