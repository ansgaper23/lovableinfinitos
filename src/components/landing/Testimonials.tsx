import { Star, Quote, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  flag: string;
  avatarInitials: string;
  rating: number;
  content: string;
  highlight: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: "Carlos Mendoza",
    role: "Founder de SaaS & Fullstack Dev",
    location: "Lima, Perú",
    flag: "🇵🇪",
    avatarInitials: "CM",
    rating: 5,
    highlight: "Ahorro de más de $300 al mes",
    content: "Antes me quedaba sin créditos en Lovable a mitad de semana entregando clientes. Con Lovable Ilimitado pude programar durante 15 días continuos sin pensar en el contador. Es una locura el retorno de inversión.",
    verified: true,
  },
  {
    name: "Valentina Ríos",
    role: "Product Designer & No-Code Builder",
    location: "Medellín, Colombia",
    flag: "🇨🇴",
    avatarInitials: "VR",
    rating: 5,
    highlight: "Soporte rápido por WhatsApp",
    content: "La activación fue inmediata. Me contacté con el soporte por WhatsApp y me guiaron paso a paso con la extensión. Desarrollé 4 MVPs en menos de una semana.",
    verified: true,
  },
  {
    name: "Mateo Silva",
    role: "Agencia de Software",
    location: "Buenos Aires, Argentina",
    flag: "🇦🇷",
    avatarInitials: "MS",
    rating: 5,
    highlight: "Revendedor y usuario",
    content: "Comencé usando el Plan Semanal para mis proyectos y luego compré el acceso de revendedor. Ahora vendo licencias a mis propios colegas y recuperé la inversión el primer día.",
    verified: true,
  },
  {
    name: "Andrés Quispe",
    role: "Indie Hacker & Creador",
    location: "Arequipa, Perú",
    flag: "🇵🇪",
    avatarInitials: "AQ",
    rating: 5,
    highlight: "Precios justos en Soles",
    content: "Poder pagar en Soles (S/) sin comisiones de bancos internacionales ni cambios de divisa sorpresa hace una gran diferencia en Perú. Funciona 10/10.",
    verified: true,
  },
  {
    name: "Sofía Delgado",
    role: "Tech Lead",
    location: "Santiago, Chile",
    flag: "🇨🇱",
    avatarInitials: "SD",
    rating: 5,
    highlight: "Estabilidad absoluta",
    content: "Probé otras alternativas que se caían a los dos días. Lovable Ilimitado mantiene la extensión actualizada con cada release oficial. No pierdes tiempo.",
    verified: true,
  },
  {
    name: "Diego Morales",
    role: "Freelancer Web & AI",
    location: "Ciudad de México, México",
    flag: "🇲🇽",
    avatarInitials: "DM",
    rating: 5,
    highlight: "Libertad creativa total",
    content: "La sensación de no tener que medir cada palabra en el prompt para no gastar créditos es impagable. Pruebo arquitecturas complejas con total tranquilidad.",
    verified: true,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonios" className="py-24 px-4 relative overflow-hidden bg-background/50">
      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Quote className="w-3.5 h-3.5" />
            Comunidad de Creadores
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 italic tracking-tighter">
            LO QUE DICEN <span className="text-primary text-glow">NUESTROS BUILDERS</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light">
            Desarrolladores, agencias y fundadores en toda Latinoamérica que ya construyen sin límites de créditos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Card
              key={idx}
              className="border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {t.highlight}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed mb-6 italic">
                    "{t.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {t.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{t.name}</span>
                        {t.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium" title={t.location}>
                    <span className="text-base">{t.flag}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-white/[0.02] border border-white/10 px-5 py-2.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Más de 1,200 proyectos generados este mes en LATAM
          </div>
        </div>
      </div>
    </section>
  );
};
