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
    <section id="faq" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Preguntas Frecuentes</h2>
          <p className="text-muted-foreground text-lg">
            Todo lo que necesitas saber sobre Lovable Ilimitado.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 py-2">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
