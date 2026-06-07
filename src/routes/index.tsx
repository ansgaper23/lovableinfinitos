import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lovable Gratis — Créditos Lovable Ilimitados sin Límites" },
      { name: "description", content: "Usa Lovable gratis con créditos ilimitados. Accede a Lovable AI sin consumir tus créditos oficiales. Para builders hispanohablantes en Latinoamérica y España." },
      { property: "og:title", content: "Lovable Gratis — Créditos Lovable Ilimitados" },
      { property: "og:description", content: "Lovable AI ilimitado, sin fricción, en español. Planes desde $5.99 USD para builders de todo el mundo hispano." },
      { property: "og:url", content: "https://lovablefree.xyz" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://lovablefree.xyz" },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
