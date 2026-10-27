import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  return (
    <aside aria-label="Soporte y contacto" className="fixed bottom-6 right-6 z-50 flex items-center group">
      <a
        href="https://wa.me/51936467898?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20Lovable%20Ilimitado"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar soporte por WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
      >
        {/* Ping pulse animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 animate-ping pointer-events-none" />
        
        <MessageCircle className="w-7 h-7 relative z-10" />
      </a>
      
      {/* Tooltip on hover / desktop */}
      <div className="hidden md:block absolute right-16 bg-[#1A1A1A] border border-white/10 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        ¿Dudas? Chatea con soporte por WhatsApp 🇵🇪
      </div>
    </aside>
  );
};
