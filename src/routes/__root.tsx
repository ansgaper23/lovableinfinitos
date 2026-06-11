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
import { Toaster } from "sonner";

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
      { title: "Lovable Gratis — Créditos Lovable Ilimitados | Lovable Infinito" },
      { name: "description", content: "Usa Lovable gratis con créditos ilimitados. Accede a Lovable AI sin límites, sin consumir tus créditos oficiales. Soporte en español para builders de Latinoamérica y España." },
      { name: "author", content: "Lovable Infinito" },
      { name: "keywords", content: "lovable gratis, creditos lovable, lovable ilimitado, lovable infinito, lovable ai gratis, lovable sin limites, creditos lovable gratis, lovable español, alternativa lovable, lovable barato, builder ia, no code ia" },
      { name: "language", content: "Spanish" },
      { name: "geo.region", content: "ES-LATAM" },
      { property: "og:title", content: "Lovable Gratis — Créditos Lovable Ilimitados | Lovable Infinito" },
      { property: "og:description", content: "Usa Lovable gratis con créditos ilimitados. Accede a Lovable AI sin límites, sin consumir tus créditos oficiales. Soporte en español para builders de Latinoamérica y España." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:locale:alternate", content: "es_MX" },
      { property: "og:site_name", content: "Lovable Infinito" },
      { property: "og:url", content: "https://lovablefree.xyz" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@LovableInfinito" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "twitter:title", content: "Lovable Gratis — Créditos Lovable Ilimitados | Lovable Infinito" },
      { name: "twitter:description", content: "Usa Lovable gratis con créditos ilimitados. Accede a Lovable AI sin límites, sin consumir tus créditos oficiales. Soporte en español para builders de Latinoamérica y España." },
      { property: "og:image", content: "https://lovablefree.xyz/og-image.jpg" },
      { name: "twitter:image", content: "https://lovablefree.xyz/og-image.jpg" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://ia801400.us.archive.org"
      },
      {
        rel: "preload",
        as: "style",
        href: appCss
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      { rel: "alternate", hrefLang: "es", href: "https://lovablefree.xyz" },
      { rel: "alternate", hrefLang: "x-default", href: "https://lovablefree.xyz" },
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
    "alternateName": ["Lovable Gratis", "Créditos Lovable Ilimitados"],
    "url": "https://lovablefree.xyz",
    "description": "Usa Lovable gratis con créditos ilimitados. Plataforma para builders hispanohablantes que necesitan Lovable AI sin límites.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "inLanguage": "es",
    "author": {
      "@type": "Organization",
      "name": "Lovable Infinito",
      "url": "https://lovablefree.xyz"
    },
    "offers": {
      "@type": "Offer",
      "price": "5.99",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="es" className="dark">
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
      <Toaster theme="dark" position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
