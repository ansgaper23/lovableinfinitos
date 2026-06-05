import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export const Hero = () => {
  return (
    <section id="inicio" className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 blur-[100px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      
      <div className="container mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 py-1.5 px-4 border-primary/20 bg-primary/5 text-primary animate-fade-in">
          🚀 +200 Builders activos en LATAM
        </Badge>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 leading-tight">
          ¿SE TE ACABAN LOS <br className="hidden md:block" />
          <span className="text-primary">CRÉDITOS DE LOVABLE?</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Con <span className="text-foreground font-semibold text-primary">Lovable Ilimitado</span> tenés créditos infinitos por una fracción del precio oficial. Sin pausas. Sin límites. Optimizado para el mercado peruano.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" className="h-14 px-8 text-lg font-semibold gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto" asChild>
            <a href="#precios">
              Ver Planes en Soles <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto">
            Mirar cómo funciona
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-border/50">
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
