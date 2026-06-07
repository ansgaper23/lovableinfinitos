import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Términos y Privacidad — Lovable Infinito" },
      { name: "description", content: "Términos de servicio, política de privacidad y aviso legal de Lovable Infinito. Información sobre uso, pagos, reembolsos y tratamiento de datos." },
      { property: "og:title", content: "Legal — Lovable Infinito" },
      { property: "og:description", content: "Términos, privacidad y políticas de Lovable Infinito." },
      { property: "og:url", content: "https://lovablefree.xyz/legal" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://lovablefree.xyz/legal" }],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans">
      <Navbar />
      <main className="pt-32 pb-24">
        <article className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Información <span className="text-primary">Legal</span>
            </h1>
            <nav aria-label="Migas de pan" className="mt-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link> / <span className="text-foreground">Legal</span>
            </nav>
          </header>

          <section className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Términos de Servicio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Al contratar cualquier plan de Lovable Infinito, aceptas que el servicio se ofrece como
              acceso complementario y de uso personal a la plataforma Lovable AI, sujeto a la
              disponibilidad de la plataforma de origen. Lovable Infinito no es propietaria, afiliada
              ni representante oficial de Lovable.dev; somos un servicio independiente que facilita
              acceso optimizado a builders hispanohablantes.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El acceso es nominal e intransferible. La compartición de credenciales con terceros
              ocasiona la suspensión inmediata sin reembolso.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Pagos y Reembolsos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Los precios se muestran en USD y/o PEN. Los planes no tienen permanencia. Las
              devoluciones se evalúan caso por caso dentro de las primeras 24 horas si el servicio
              no pudo activarse por causas atribuibles a nosotros.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Política de Privacidad</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Recopilamos únicamente los datos necesarios para crear tu cuenta, procesar pagos y
              brindar soporte (correo, nombre, número de WhatsApp). No vendemos ni cedemos tus
              datos a terceros. Los datos se almacenan de forma segura mediante nuestros
              proveedores de infraestructura (Lovable Cloud / Supabase) con cifrado en tránsito y
              en reposo.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Usamos cookies estrictamente necesarias para mantener tu sesión iniciada. No usamos
              cookies de publicidad de terceros.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Contacto</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para ejercer derechos ARCO o cualquier consulta legal: <a className="text-primary underline" href="https://wa.me/51936467898">+51 936 467 898</a> (WhatsApp).
            </p>

            <p className="text-xs text-muted-foreground mt-12 italic">
              Última actualización: junio 2026 · Lovable Infinito Perú.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
