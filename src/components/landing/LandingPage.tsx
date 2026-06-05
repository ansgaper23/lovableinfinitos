import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Stats } from "@/components/landing/Stats";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pricing />
        <FAQ />
      </main>
      
      <footer className="py-12 px-4 border-t border-border/50 bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">L</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Lovable Ilimitado</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#inicio" className="hover:text-primary transition-colors">Inicio</a>
              <a href="#precios" className="hover:text-primary transition-colors">Precios</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Lovable Ilimitado. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-green-500 hover:bg-green-600 z-50 p-0"
        title="Contactar Soporte"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </Button>
    </div>
  );
};
