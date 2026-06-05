import { createFileRoute } from "@tanstack/react-router";
import { ResellerDashboard } from "@/components/dashboard/ResellerDashboard";

export const Route = createFileRoute("/reseller")({
  head: () => ({
    meta: [
      { title: "Painel de Revenda — Lovable Infinito" },
      { name: "description", content: "Gere e gerencie licenças para seus clientes." },
    ],
  }),
  component: ResellerDashboard,
});
