import { Card, CardContent } from "@/components/ui/card";
import { Users, Code, Award, Zap } from "lucide-react";

export const Stats = () => {
  const stats = [
    { label: "USUARIOS ACTIVOS", value: "200+", icon: Users },
    { label: "PROMPTS ENVIADOS", value: "150K+", icon: Zap },
    { label: "PROYECTOS LANZADOS", value: "850+", icon: Rocket },
    { label: "SATISFACCIÓN", value: "99.9%", icon: Award },
  ];

  return (
    <div className="container mx-auto px-4 -mt-12 relative z-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
              <div className="text-[10px] md:text-xs font-bold tracking-widest text-muted-foreground uppercase">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { Rocket } from "lucide-react";
