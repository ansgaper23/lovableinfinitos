import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — Lovable Infinito | Créditos Lovable Ilimitados" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en Lovable Infinito y desbloquea créditos Lovable ilimitados al instante." },
      { property: "og:title", content: "Acceso — Lovable Infinito" },
      { property: "og:description", content: "Accede a tu panel de Lovable Infinito y disfruta de créditos Lovable ilimitados." },
      { property: "og:url", content: "https://lovableinfinitos.lovable.app/auth" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://lovableinfinitos.lovable.app/auth" },
    ],
  }),
  component: Auth,
});
