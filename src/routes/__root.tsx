import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DevToolsGuard } from "@/components/security/DevToolsGuard";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable Infinito — Créditos Infinitos para IA" },
      { name: "description", content: "Potencia tu desarrollo con Lovable Infinito. Créditos ilimitados para la plataforma IA más potente, soporte en español y pagos locales en Perú." },
      { name: "author", content: "Lovable Infinito" },
      { name: "keywords", content: "lovable, créditos infinitos, inteligencia artificial, perú, desarrollo web, ia builder, lovable ai" },
      { property: "og:title", content: "Lovable Infinito — Créditos Infinitos para IA" },
      { property: "og:description", content: "Potencia tu desarrollo con Lovable Infinito. Créditos ilimitados para la plataforma IA más potente, soporte en español y pagos locales en Perú." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_PE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@LovableInfinito" },
      { name: "robots", content: "index, follow" },
      { name: "twitter:title", content: "Lovable Infinito — Créditos Infinitos para IA" },
      { name: "twitter:description", content: "Potencia tu desarrollo con Lovable Infinito. Créditos ilimitados para la plataforma IA más potente, soporte en español y pagos locales en Perú." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/65bea7a2-93df-465a-97f9-1fcbfcf817ad" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/65bea7a2-93df-465a-97f9-1fcbfcf817ad" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "canonical",
        href: "https://lovable-infinito.com",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lovable Infinito",
    "url": "https://lovable-infinito.com",
    "description": "Créditos infinitos para Lovable. La solución ideal para builders en Perú con pagos locales y soporte en español.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "author": {
      "@type": "Organization",
      "name": "Lovable Infinito"
    },
    "offers": {
      "@type": "Offer",
      "price": "39.00",
      "priceCurrency": "PEN"
    }
  };

  return (
    <html lang="es">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ea384c" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <DevToolsGuard />
    </QueryClientProvider>
  );
}
