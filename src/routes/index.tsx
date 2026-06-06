import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lovable Infinito — Créditos infinitos en Soles para Perú" },
      { name: "description", content: "Construye sin límites con créditos infinitos para Lovable. La solución ideal para builders en Perú con pagos locales y soporte en español." },
      { property: "og:title", content: "Lovable Infinito — Créditos infinitos en Soles" },
      { property: "og:description", content: "Construye sin límites con créditos infinitos para Lovable. Planes en Soles exclusivos para Perú." },
      { property: "og:url", content: "https://lovable-infinito.com" },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
