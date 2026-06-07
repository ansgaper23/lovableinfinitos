import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lovable Infinito" },
      { name: "description", content: "Gestiona tu acceso ilimitado a Lovable." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});
