import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";

const HowItWorks = lazy(() => import("@/components/landing/HowItWorks").then(m => ({ default: m.HowItWorks })));

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo Funciona — Lovable Infinito | Activa Créditos Ilimitados en 5 Minutos" },
      { name: "description", content: "Aprende paso a paso cómo activar créditos Lovable ilimitados con Lovable Infinito: registro, pago en soles o USD y acceso inmediato por WhatsApp." },
      { property: "og:title", content: "Cómo funciona Lovable Infinito" },
      { property: "og:description", content: "Tres pasos para desbloquear Lovable AI sin límites, en menos de 5 minutos." },
      { property: "og:url", content: "https://lovablefree.xyz/como-funciona" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://lovablefree.xyz/como-funciona" }],
  }),
  component: HowPage,
});

function HowPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans">
      <Navbar />
      <main className="pt-32">
        <header className="container mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Cómo <span className="text-primary">Funciona</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Activa tu acceso ilimitado a Lovable en tres pasos simples y empieza a construir hoy mismo.
          </p>
          <nav aria-label="Migas de pan" className="mt-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Inicio</Link> / <span className="text-foreground">Cómo funciona</span>
          </nav>
        </header>
        <Suspense fallback={null}>
          <HowItWorks />
        </Suspense>
        <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <p className="text-muted-foreground">Continúa a los <Link to="/precios" className="text-primary underline">planes</Link> o revisa las <Link to="/faq" className="text-primary underline">preguntas frecuentes</Link>.</p>
        </section>
      </main>
    </div>
  );
}
