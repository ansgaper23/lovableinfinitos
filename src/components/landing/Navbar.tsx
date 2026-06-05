import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
            <span className="text-primary-foreground font-black text-2xl italic">L</span>
          </div>
          <span className="font-black text-2xl tracking-tighter italic hidden sm:inline-block group-hover:text-primary transition-colors">LOVABLE <span className="text-primary text-glow">INFINITO</span></span>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#inicio" className={navigationMenuTriggerStyle()}>
                Inicio
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#funcionamiento" className={navigationMenuTriggerStyle()}>
                Funcionamiento
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#precios" className={navigationMenuTriggerStyle()}>
                Precios
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#faq" className={navigationMenuTriggerStyle()}>
                FAQ
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex font-black italic tracking-tighter uppercase" asChild>
            <a href="/auth">Acceder</a>
          </Button>
          <Button className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Soporte
          </Button>
        </div>
      </div>
    </header>
  );
};
