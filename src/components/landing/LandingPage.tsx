import { Navbar } from "@/components/landing/Navbar";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Stats } from "@/components/landing/Stats";


import { Button } from "@/components/ui/button";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 dark font-sans">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pricing />
        <FAQ />
      </main>
      
      <footer className="py-24 px-4 border-t border-white/5 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-700">
                <span className="text-primary-foreground font-black text-2xl italic">L</span>
              </div>
              <div>
                <span className="font-black text-2xl tracking-tighter italic block">LOVABLE INFINITO</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Elite Builder Access</span>
              </div>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-12 text-sm font-black uppercase tracking-widest text-muted-foreground">
              <a href="#inicio" className="hover:text-primary transition-colors hover:text-glow">Inicio</a>
              <a href="#precios" className="hover:text-primary transition-colors hover:text-glow">Planes</a>
              <a href="#faq" className="hover:text-primary transition-colors hover:text-glow">FAQ</a>
              <a href="#" className="hover:text-primary transition-colors hover:text-glow opacity-50 cursor-not-allowed">Legal</a>
            </nav>
            
            <div className="text-right flex flex-col items-center md:items-end gap-2">
              <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">
                © 2026 LOVABLE INFINITO PERÚ
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                  <span className="sr-only">Social</span>
                  <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-primary" />
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                  <span className="sr-only">Social</span>
                  <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
