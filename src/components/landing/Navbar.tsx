import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MessageCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";


export const Navbar = () => {
  return (
    <header className="fixed top-10 left-0 right-0 z-50 bg-background/40 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <img
            src={logoAsset.url}
            alt="Lovable Infinito Logo"
            className="h-10 w-auto rounded-lg transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/">Inicio</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/como-funciona">Cómo Funciona</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/precios">Precios</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/faq">FAQ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <AuthButtons />
          <Button className="gap-2" asChild>
            <a
              href="https://wa.me/51936467898?text=Hola,%20necesito%20soporte%20de%20Lovable%20Infinito"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4" />
              Soporte
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

const AuthButtons = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="w-20 h-8 bg-white/5 animate-pulse" />;

  if (user) {
    return (
      <Button variant="outline" className="hidden sm:flex font-black italic tracking-tighter uppercase gap-2 border-primary/50 text-primary" asChild>
        <Link to="/dashboard">
          <LayoutDashboard className="w-4 h-4" />
          Mi Panel
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" className="hidden sm:flex font-black italic tracking-tighter uppercase" asChild>
      <Link to="/auth">Acceder</Link>
    </Button>
  );
};
