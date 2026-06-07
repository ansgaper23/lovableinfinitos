import { createFileRoute } from "@tanstack/react-router";
import { ResellerDashboard } from "@/components/dashboard/ResellerDashboard";

export const Route = createFileRoute("/reseller")({
  head: () => ({
    meta: [
      { title: "Panel de Revendedor — Lovable Infinito" },
      { name: "description", content: "Genera y gestiona licencias para tus clientes." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResellerDashboard,
});
