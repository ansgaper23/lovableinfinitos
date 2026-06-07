import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";

const Pricing = lazy(() => import("@/components/landing/Pricing").then(m => ({ default: m.Pricing })));

export const Route = createFileRoute("/precios")({
  head: () => ({
    meta: [
      { title: "Precios — Planes Lovable Ilimitado desde $5.99 | Lovable Infinito" },
      { name: "description", content: "Planes de Lovable Infinito desde $5.99 USD: créditos Lovable ilimitados por 1, 7 o 30 días. Pago seguro, activación inmediata, soporte en español." },
      { property: "og:title", content: "Precios Lovable Infinito — Créditos Ilimitados desde $5.99" },
      { property: "og:description", content: "Compara los planes Diario, Semanal y Mensual de Lovable Infinito. Sin permanencia, soporte 24/7 por WhatsApp." },
      { property: "og:url", content: "https://lovablefree.xyz/precios" },
      { property: "og:type", content: "product" },
    ],
    links: [{ rel: "canonical", href: "https://lovablefree.xyz/precios" }],
  }),
  component: PreciosPage,
});

function PreciosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans">
      <Navbar />
      <main className="pt-32">
        <header className="container mx-auto px-4 text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Precios <span className="text-primary">Lovable Infinito</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que se adapta a tu ritmo de construcción. Desde $5.99 USD, sin permanencia y con activación inmediata.
          </p>
          <nav aria-label="Migas de pan" className="mt-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Inicio</Link> / <span className="text-foreground">Precios</span>
          </nav>
        </header>
        <Suspense fallback={null}>
          <Pricing />
        </Suspense>
        <section className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">¿Dudas antes de comprar?</h2>
          <p className="text-muted-foreground mb-6">Revisa las <Link to="/faq" className="text-primary underline">preguntas frecuentes</Link> o consulta <Link to="/como-funciona" className="text-primary underline">cómo funciona</Link> Lovable Infinito.</p>
        </section>
      </main>
    </div>
  );
}
