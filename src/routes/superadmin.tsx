import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";

export const Route = createFileRoute("/superadmin")({
  head: () => ({
    meta: [
      { title: "Control Maestro — SuperAdmin" },
      { name: "description", content: "Panel de administración centralizada de Lovable Infinito." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SuperAdminDashboard,
});
