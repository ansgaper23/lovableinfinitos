import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — Lovable Infinito" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en Lovable Infinito." },
    ],
  }),
  component: Auth,
});
