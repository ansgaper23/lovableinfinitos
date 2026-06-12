import { useEffect, useRef, lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import videoAsset from "@/assets/guia-lovable-demo.mp4.asset.json";
import videoPosterAsset from "@/assets/video-poster.jpg.asset.json";

// Iconos cargados de forma diferida para mejorar el FCP
const ZapIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Zap })));
const ShieldIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Shield })));
const GlobeIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Globe })));
const ArrowRightIcon = lazy(() => import("lucide-react").then(m => ({ default: m.ArrowRight })));

export const Hero = () => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Force scroll to top on mount
    window.scrollTo(0, 0);
    
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch((error) => {
              console.log("Autoplay prevented:", error);
            });
          } else {
            videoRef.current.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);


  return (
    <section id="inicio" className="pt-40 pb-16 md:pt-56 md:pb-32 px-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 blur-[120px] bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] pointer-events-none" />
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 py-1.5 px-4 border-primary/30 bg-primary/10 text-primary opacity-0 animate-fade-in backdrop-blur-sm neon-border" style={{ animationFillMode: 'forwards' }}>
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
          Rompe las barreras de <span className="text-foreground font-bold border-b-2 border-primary/50">Lovable</span>. Créditos infinitos, sin fricción, optimizado para la comunidad de builders.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: 'forwards' }}>
          <Button size="lg" className="h-16 px-10 text-xl font-black italic tracking-tighter uppercase gap-3 shadow-[0_0_30px_rgba(var(--color-primary),0.4)] hover:shadow-[0_0_50px_rgba(var(--color-primary),0.6)] w-full sm:w-auto rounded-none transition-all duration-300 transform hover:-translate-y-1" asChild>
            <a href="#precios">
              VER PLANES <Suspense fallback={null}><ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></Suspense>
            </a>
          </Button>
          <Button size="lg" className="h-16 px-10 text-xl font-black italic tracking-tighter uppercase w-full sm:w-auto rounded-none bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)] transition-all" asChild>
            <Link to="/auth">VER DEMO <Suspense fallback={null}><ZapIcon className="w-5 h-5 ml-2" /></Suspense></Link>
          </Button>
        </div>

        {/* Video Demo Mockup */}
        <div className="max-w-4xl mx-auto mb-20 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: 'forwards' }}>
          <div className="relative group">
            {/* Browser Mockup Header */}
            <div className="bg-[#1A1A1A] border-x border-t border-white/10 rounded-t-xl p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="mx-auto bg-white/5 rounded-md px-4 py-1 flex items-center gap-2 max-w-[200px] md:max-w-md w-full">
                <Suspense fallback={null}><GlobeIcon className="w-3 h-3 text-muted-foreground" /></Suspense>
                <span className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-widest">lovablefree.xyz/guia-rapida</span>
              </div>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video bg-black border-x border-b border-white/10 rounded-b-xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src={videoPosterAsset.url}
                alt="Vista previa de la guía rápida de Lovable Infinito"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />

              {isVideoLoading && !hasVideoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Cargando demo...</p>
                </div>
              )}

              {hasVideoError && (
                <a
                  href={videoAsset.url}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 text-sm font-black uppercase tracking-[0.2em] text-primary backdrop-blur-[2px]"
                >
                  Abrir video
                </a>
              )}

              <video 
                ref={videoRef}
                className={`relative z-10 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoading || hasVideoError ? 'opacity-0' : 'opacity-100'}`}
                loop 
                muted
                autoPlay
                playsInline
                controls
                onCanPlay={() => setIsVideoLoading(false)}
                onError={() => {
                  setIsVideoLoading(false);
                  setHasVideoError(true);
                }}
                preload="auto"
                poster={videoPosterAsset.url}
              >
                <source src={videoAsset.url} type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
              
              {/* Overlay glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute -inset-px rounded-xl border border-primary/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground italic font-medium uppercase tracking-widest">
              Mira cómo activar tus créditos ilimitados en menos de 60 segundos ⚡
            </p>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><ZapIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Créditos Infinitos</h3>
            <p className="text-sm text-muted-foreground text-center">Construye sin mirar el contador de créditos.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><ShieldIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Acceso Inmediato</h3>
            <p className="text-sm text-muted-foreground text-center">Configuración en menos de 5 minutos.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><GlobeIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Soporte 24/7</h3>
            <p className="text-sm text-muted-foreground text-center">Asistencia personalizada por WhatsApp en español.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
