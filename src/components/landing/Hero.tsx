import { useEffect, useRef, lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import videoAsset from "@/assets/hero-video.mp4.asset.json";
import videoPosterAsset from "@/assets/video-poster.jpg.asset.json";

// Iconos cargados de forma diferida para mejorar el FCP
const ZapIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Zap })));
const ShieldIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Shield })));
const GlobeIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Globe })));
const ArrowRightIcon = lazy(() => import("lucide-react").then(m => ({ default: m.ArrowRight })));
const PlayIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Play })));
const ImageIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Image })));
const SparklesIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Sparkles })));
const MaximizeIcon = lazy(() => import("lucide-react").then(m => ({ default: m.Maximize2 })));

export const Hero = () => {
  const [activeView, setActiveView] = useState<"banner" | "video">("banner");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
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
        if (videoRef.current && activeView === "video") {
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
  }, [activeView]);

  return (
    <section id="inicio" className="pt-28 pb-12 md:pt-36 md:pb-20 px-4 overflow-hidden relative">
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
          🚀 +200 Builders activos en Perú y LATAM
        </Badge>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-5 leading-tight italic">
          <span className="block text-2xl sm:text-3xl md:text-4xl text-primary font-bold not-italic tracking-normal mb-2">
            ¿Sin créditos en Lovable?
          </span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            CONSTRUYE SIN LÍMITES
          </span>
          <span className="text-primary text-glow">CON CRÉDITOS ILIMITADOS</span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed font-light">
          Rompe las barreras de gasto en <span className="text-foreground font-bold border-b-2 border-primary/50">Lovable</span>. Acceso ilimitado, sin cuotas por mensaje, con soporte en español y pago en <span className="text-white font-medium">Soles (S/)</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-black italic tracking-tighter uppercase gap-3 shadow-[0_0_30px_rgba(var(--color-primary),0.4)] hover:shadow-[0_0_50px_rgba(var(--color-primary),0.6)] w-full sm:w-auto rounded-xl transition-all duration-300 transform hover:-translate-y-1 bg-primary text-primary-foreground" asChild>
            <a href="#precios">
              VER PLANES DESDE S/ 39 <Suspense fallback={null}><ArrowRightIcon className="w-6 h-6" /></Suspense>
            </a>
          </Button>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-3 border-b border-transparent hover:border-primary/40"
          >
            <Suspense fallback={null}><ZapIcon className="w-4 h-4" /></Suspense>
            Acceder al Panel
          </Link>
        </div>

        {/* Hero Interactive Showcase (Banner & Video) */}
        <div className="max-w-5xl mx-auto mb-14">
          <div className="relative group">
            {/* Browser Mockup Header with Switcher */}
            <div className="bg-[#1A1A1A] border-x border-t border-white/10 rounded-t-2xl p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-md px-3 py-1 border border-white/5">
                  <Suspense fallback={null}><GlobeIcon className="w-3 h-3 text-muted-foreground" /></Suspense>
                  <span className="text-[11px] text-muted-foreground font-mono tracking-wider">lovable.dev/app/flowpro</span>
                </div>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveView("banner")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeView === "banner"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Suspense fallback={null}><ImageIcon className="w-3.5 h-3.5" /></Suspense>
                  <span>Interfaz Lovable</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView("video");
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeView === "video"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Suspense fallback={null}><PlayIcon className="w-3.5 h-3.5" /></Suspense>
                  <span>Video Tutorial</span>
                </button>
              </div>
            </div>
            
            {/* Visual Container */}
            <div className="relative aspect-video sm:aspect-[16/9] bg-black border-x border-b border-white/10 rounded-b-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              {/* VISTA 1: BANNER HERO IMAGE */}
              {activeView === "banner" && (
                <div 
                  className="relative w-full h-full group/image overflow-hidden flex items-center justify-center bg-zinc-950 cursor-pointer"
                  onClick={() => setIsZoomOpen(true)}
                >
                  <img
                    src="/images/banner_hero.png"
                    alt="Banner Hero - FlowPro Lovable Créditos Ilimitados"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/image:scale-[1.02]"
                    loading="eager"
                    decoding="async"
                  />

                  {/* Floating Badges on Banner */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md border border-primary/40 text-primary shadow-lg shadow-black/50">
                      <Suspense fallback={null}><SparklesIcon className="w-3.5 h-3.5 text-primary" /></Suspense>
                      FlowPro Activo
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Créditos Infinitos
                    </span>
                  </div>

                  {/* Action Controls Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomOpen(true);
                      }}
                      className="bg-black/60 hover:bg-black/80 text-white border-white/20 text-xs font-bold uppercase tracking-wider gap-1.5 backdrop-blur-md"
                    >
                      <Suspense fallback={null}><MaximizeIcon className="w-3.5 h-3.5" /></Suspense>
                      Ampliar
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView("video");
                        if (videoRef.current) {
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="bg-primary/90 hover:bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2 shadow-lg backdrop-blur-md border border-primary/50"
                    >
                      <Suspense fallback={null}><PlayIcon className="w-3.5 h-3.5 fill-current" /></Suspense>
                      Ver demo en video
                    </Button>
                  </div>

                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* VISTA 2: VIDEO TUTORIAL */}
              {activeView === "video" && (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <img
                    src={videoPosterAsset.url}
                    alt="Vista previa de la guía rápida de Lovable Ilimitado"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />

                  {hasVideoError && (
                    <a
                      href={videoAsset.url}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 text-sm font-black uppercase tracking-[0.2em] text-primary backdrop-blur-[2px]"
                    >
                      Abrir video en nueva pestaña
                    </a>
                  )}

                  <video 
                    ref={videoRef}
                    className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 ${hasVideoError ? 'opacity-0' : 'opacity-100'}`}
                    loop 
                    autoPlay
                    playsInline
                    controls
                    onError={() => {
                      setHasVideoError(true);
                    }}
                    preload="metadata"
                    poster={videoPosterAsset.url}
                  >
                    <source src={videoAsset.url} type="video/mp4" />
                    Tu navegador no soporta el video.
                  </video>
                  
                  {/* Overlay glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* Border glow on hover */}
              <div className="absolute -inset-px rounded-b-2xl border border-primary/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-primary/25 blur-3xl -z-10 opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-center mt-6">
            <p className="text-sm text-muted-foreground italic font-medium uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              Acceso ilimitado con la extensión oficial FlowPro para Lovable
            </p>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><ZapIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Créditos Infinitos</h3>
            <p className="text-sm text-muted-foreground text-center">Construye prototipos y apps completas sin mirar el contador.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><ShieldIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Acceso Inmediato</h3>
            <p className="text-sm text-muted-foreground text-center">Entrega de licencia y activación en menos de 3 minutos.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Suspense fallback={null}><GlobeIcon className="w-6 h-6" /></Suspense>
            </div>
            <h3 className="font-bold text-lg text-primary">Soporte 24/7 en Español</h3>
            <p className="text-sm text-muted-foreground text-center">Asistencia directa por WhatsApp para resolver cualquier consulta.</p>
          </div>
        </div>
      </div>

      {/* Modal Zoom de la Imagen Banner Hero */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-6xl p-2 bg-[#090D18] border-white/20 text-white overflow-hidden">
          <DialogTitle className="sr-only">
            Vista ampliada de la interfaz de Lovable con FlowPro
          </DialogTitle>
          <div className="relative rounded-xl overflow-hidden bg-black">
            <img
              src="/images/banner_hero.png"
              alt="Interfaz Lovable en alta resolución"
              className="w-full h-auto max-h-[85vh] object-contain mx-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
