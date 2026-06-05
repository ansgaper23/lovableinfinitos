import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lovable Ilimitado — Créditos infinitos en Soles" },
      { name: "description", content: "Construye sin límites con créditos ilimitados para Lovable. Planes en Soles exclusivos para Perú." },
      { property: "og:title", content: "Lovable Ilimitado — Créditos infinitos en Soles" },
      { property: "og:description", content: "Construye sin límites con créditos ilimitados para Lovable. Planes en Soles exclusivos para Perú." },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
