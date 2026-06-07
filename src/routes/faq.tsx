import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";

const FAQ = lazy(() => import("@/components/landing/FAQ").then(m => ({ default: m.FAQ })));

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preguntas Frecuentes — Lovable Infinito | Créditos Ilimitados" },
      { name: "description", content: "Respuestas a las dudas más comunes sobre Lovable Infinito: cómo funciona, seguridad de tu cuenta, planes, pagos y soporte en español." },
      { property: "og:title", content: "FAQ — Lovable Infinito" },
      { property: "og:description", content: "Todo lo que necesitas saber antes de empezar con créditos Lovable ilimitados." },
      { property: "og:url", content: "https://lovablefree.xyz/faq" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://lovablefree.xyz/faq" }],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans">
      <Navbar />
      <main className="pt-32">
        <header className="container mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Preguntas <span className="text-primary">Frecuentes</span>
          </h1>
          <nav aria-label="Migas de pan" className="mt-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Inicio</Link> / <span className="text-foreground">FAQ</span>
          </nav>
        </header>
        <Suspense fallback={null}>
          <FAQ />
        </Suspense>
        <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <p className="text-muted-foreground">¿Listo? Mira los <Link to="/precios" className="text-primary underline">planes</Link> o entiende <Link to="/como-funciona" className="text-primary underline">cómo funciona</Link>.</p>
        </section>
      </main>
    </div>
  );
}
