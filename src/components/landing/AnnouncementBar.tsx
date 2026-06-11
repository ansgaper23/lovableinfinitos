export const AnnouncementBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-primary/10 border-b border-primary/20 flex items-center overflow-hidden z-[60] bg-background">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase italic">
              OFERTA DE LANZAMIENTO: 50% DCTO EN EL PLAN PRO
            </span>
            <span className="w-1.5 h-1.5 bg-primary rotate-45" />
            <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase italic">
              LOVABLE INFINITO — LA LIBERTAD TOTAL PARA BUILDERS
            </span>
            <span className="w-1.5 h-1.5 bg-primary rotate-45" />
          </div>
        ))}
      </div>
    </div>
  );
};
