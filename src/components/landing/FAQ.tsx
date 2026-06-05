import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "¿Qué es exactamente Lovable Ilimitado?",
      answer: "Es una solución optimizada que permite a desarrolladores y agencias utilizar la plataforma Lovable de manera ilimitada, eliminando las restricciones de créditos del plan oficial por un tiempo determinado (1, 7 o 15 días).",
    },
    {
      question: "¿Cómo recibo el acceso después de pagar?",
      answer: "El acceso es inmediato. Una vez verificado tu pago en Soles, recibirás las credenciales de tu panel personalizado por correo y WhatsApp en menos de 5 minutos.",
    },
    {
      question: "¿Es seguro para mi cuenta de Lovable?",
      answer: "Totalmente. Nuestro sistema funciona de manera externa y complementaria, no requiere acceso a tus proyectos personales ni pone en riesgo tu cuenta oficial.",
    },
    {
      question: "¿Puedo cancelar o cambiar de plan?",
      answer: "Sí, nuestros planes no tienen contratos de permanencia. Puedes elegir un plan diferente al finalizar tu periodo actual.",
    },
    {
      question: "¿Qué pasa si tengo problemas técnicos?",
      answer: "Contamos con un equipo de soporte dedicado vía WhatsApp disponible 24/7 para ayudarte con cualquier duda o inconveniente en español.",
    },
  ];

  return (
    <section id="faq" className="py-32 px-4 bg-background relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)] opacity-[0.02] pointer-events-none" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter uppercase">
            SOPORTE <span className="text-primary">TÉCNICO</span>
          </h2>
          <p className="text-muted-foreground text-xl font-light">
            Despeja tus dudas y empieza a construir hoy mismo.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 border-white/5">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/5 py-4 last:border-0 group">
                <AccordionTrigger className="text-left font-black text-xl italic tracking-tight hover:no-underline group-hover:text-primary transition-colors uppercase">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg font-light leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
