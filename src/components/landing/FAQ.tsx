import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, CreditCard, Scale, RefreshCw, MessageCircle, Zap } from "lucide-react";

type FaqCategory = "legalidad" | "pago" | "soporte" | "producto";

interface Faq {
  question: string;
  answer: string;
  category: FaqCategory;
}

const categoryMeta: Record<FaqCategory, { label: string; icon: typeof ShieldCheck; color: string }> = {
  legalidad: { label: "Legalidad y Seguridad", icon: Scale, color: "text-primary" },
  pago: { label: "Pago y Reembolsos", icon: CreditCard, color: "text-primary" },
  soporte: { label: "Soporte y Acceso", icon: MessageCircle, color: "text-primary" },
  producto: { label: "Cómo Funciona", icon: Zap, color: "text-primary" },
};

export const FAQ = () => {
  const faqs: Faq[] = [
    // --- LEGALIDAD / SEGURIDAD (objeciones #1 más comunes) ---
    {
      category: "legalidad",
      question: "¿Esto es legal? ¿Voy a tener problemas usándolo?",
      answer:
        "Sí, es completamente legal. Lovable Infinito no hackea ni vulnera la plataforma oficial: opera de forma externa y complementaria, optimizando el consumo para builders. No estás violando ningún término de uso al construir tus propios proyectos, y no compartimos datos sensibles con terceros.",
    },
    {
      category: "legalidad",
      question: "¿Me pueden banear mi cuenta oficial de Lovable por usar esto?",
      answer:
        "No. Lovable Infinito funciona en una capa separada, no requiere tus credenciales personales ni toca tu cuenta original. Más de 200 builders activos en LATAM lo usan a diario sin ningún incidente reportado de baneo desde nuestro lanzamiento.",
    },
    {
      category: "legalidad",
      question: "¿Mis proyectos y código están seguros?",
      answer:
        "Sí. Todo lo que construyas es 100% tuyo y privado. Nuestro sistema no almacena, copia ni indexa tu código. Toda la comunicación va cifrada y el panel está protegido con autenticación.",
    },

    // --- PAGO / REEMBOLSOS ---
    {
      category: "pago",
      question: "¿Cómo puedo pagar desde Perú, México, Colombia o el resto de LATAM?",
      answer:
        "Aceptamos pagos en Soles (PEN) a través de Izipay con Yape, Plin, tarjeta de débito/crédito y transferencia bancaria. Para el resto de LATAM y España aceptamos tarjeta internacional Visa/Mastercard en USD. Todos los precios están publicados en USD con su equivalente referencial en PEN.",
    },
    {
      category: "pago",
      question: "¿Hay reembolso si no me gusta o tengo problemas?",
      answer:
        "Sí. Si dentro de las primeras 24 horas no logras acceder al servicio por una falla nuestra, te devolvemos el 100% sin preguntas. Pasado ese plazo, evaluamos caso por caso vía WhatsApp. Como el acceso es inmediato y el producto es digital de consumo, no aplicamos reembolso por arrepentimiento una vez activado el plan.",
    },
    {
      category: "pago",
      question: "¿Es un pago único o una suscripción que se renueva sola?",
      answer:
        "Es 100% pago único. No hay cobros recurrentes ni permanencia. Cuando termine tu plan (1, 7 o 30 días) decides libremente si renuevas o no. Nada se carga automáticamente a tu tarjeta.",
    },

    // --- PRODUCTO / CAMBIOS LOVABLE ---
    {
      category: "producto",
      question: "¿Qué pasa si Lovable cambia su sistema y deja de funcionar?",
      answer:
        "Nuestro equipo monitorea la plataforma 24/7 y adapta el servicio en cuestión de horas cuando Lovable hace cambios. Si por una actualización mayor el servicio queda inactivo más de 24 horas, extendemos tu plan por el doble del tiempo perdido sin costo adicional. Tu inversión está protegida.",
    },
    {
      category: "producto",
      question: "¿Realmente son créditos ilimitados o tienen un tope oculto?",
      answer:
        "Son ilimitados durante toda la duración de tu plan. No hay letra pequeña, ni topes diarios, ni reducción de velocidad después de cierto uso. Construye tantos proyectos y envía tantos prompts como quieras.",
    },
    {
      category: "producto",
      question: "¿Funciona con mi cuenta actual de Lovable o necesito una nueva?",
      answer:
        "Te entregamos acceso a un panel propio configurado por nosotros, listo para usar desde el minuto uno. No necesitas tu cuenta oficial ni mezclar credenciales: simplemente entras al panel y empiezas a construir.",
    },

    // --- SOPORTE ---
    {
      category: "soporte",
      question: "¿En cuánto tiempo recibo mi acceso después de pagar?",
      answer:
        "El acceso es inmediato. Apenas se confirma tu pago (normalmente menos de 5 minutos con Yape/Plin/tarjeta), recibes tus credenciales por correo y WhatsApp. Si pasados 10 minutos no las tienes, escríbenos al WhatsApp y lo resolvemos al instante.",
    },
    {
      category: "soporte",
      question: "¿Qué pasa si tengo problemas técnicos a las 3 de la mañana?",
      answer:
        "Tenemos soporte real por WhatsApp 24/7 en español. No bots, personas reales. El tiempo de respuesta promedio es menor a 15 minutos, incluso de madrugada y fines de semana.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id="faq" className="py-32 px-4 bg-background relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)] opacity-[0.02] pointer-events-none" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-5">
            Resolvemos tus dudas
          </span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter uppercase">
            ANTES DE <span className="text-primary text-glow">COMPRAR</span>
          </h2>
          <p className="text-muted-foreground text-xl font-light max-w-2xl mx-auto">
            Las preguntas reales que nos hacen los builders antes de pagar. Sin rodeos.
          </p>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { icon: ShieldCheck, label: "100% Legal" },
            { icon: RefreshCw, label: "Garantía 24h" },
            { icon: Zap, label: "Acceso < 5 min" },
            { icon: MessageCircle, label: "Soporte 24/7" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 justify-center px-3 py-3 rounded-xl border border-primary/20 bg-primary/[0.04] backdrop-blur-sm"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 md:p-10 border-white/5">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => {
              const meta = categoryMeta[faq.category];
              const Icon = meta.icon;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-white/5 py-2 last:border-0 group"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <div className="flex items-start gap-4 pr-4">
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                          {meta.label}
                        </span>
                        <span className="font-black text-lg md:text-xl italic tracking-tight group-hover:text-primary transition-colors uppercase">
                          {faq.question}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base md:text-lg font-light leading-relaxed pt-2 pb-5 pl-[3.25rem]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground mb-4">¿Tienes otra duda específica?</p>
          <a
            href="https://wa.me/51936467898?text=Hola,%20tengo%20una%20pregunta%20sobre%20Lovable%20Infinito"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)]"
          >
            <MessageCircle className="w-4 h-4" />
            Pregúntanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};
