import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export const Hero = () => {
  return (
    <section id="inicio" className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-50 blur-[120px] bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] pointer-events-none" />
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float pointer-events-none" />
      
      <div className="container mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 py-1.5 px-4 border-primary/30 bg-primary/10 text-primary animate-fade-in backdrop-blur-sm neon-border">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          🚀 +200 Builders activos en LATAM
        </Badge>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight italic">
          <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">LIBERA TU</span>
          <span className="text-primary text-glow">POTENCIAL IA</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          Rompe las barreras de <span className="text-foreground font-bold border-b-2 border-primary/50">Lovable</span>. Créditos infinitos, sin fricción, optimizado para la comunidad de builders en Perú.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Button size="lg" className="h-16 px-10 text-xl font-black italic tracking-tighter uppercase gap-3 shadow-[0_0_30px_rgba(var(--color-primary),0.4)] hover:shadow-[0_0_50px_rgba(var(--color-primary),0.6)] w-full sm:w-auto rounded-none transition-all duration-300 transform hover:-translate-y-1" asChild>
            <a href="#precios">
              ACTUALIZAR A INFINITO <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black italic tracking-tighter uppercase w-full sm:w-auto rounded-none border-white/20 bg-white/5 hover:bg-white/10 transition-all" asChild>
            <a href="/dashboard">VER DEMO <Zap className="w-5 h-5 ml-2 text-primary" /></a>
          </Button>
        </div>

        <div className="hidden grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Créditos Infinitos</h3>
            <p className="text-sm text-muted-foreground text-center">Construye sin mirar el contador de créditos.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Acceso Inmediato</h3>
            <p className="text-sm text-muted-foreground text-center">Configuración en menos de 5 minutos.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Soporte 24/7</h3>
            <p className="text-sm text-muted-foreground text-center">Asistencia personalizada por WhatsApp en español.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
