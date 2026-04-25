import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BakeEase — Mumbai's Freshest Online Bakery" },
      {
        name: "description",
        content:
          "Order handcrafted cakes, cupcakes, pastries and breads online in Mumbai. Fresh-baked, delivered to your door.",
      },
      { name: "author", content: "BakeEase" },
      { property: "og:title", content: "BakeEase — Mumbai's Freshest Online Bakery" },
      {
        property: "og:description",
        content: "Handcrafted cakes & pastries delivered fresh across Mumbai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BakeEase — Mumbai's Freshest Online Bakery" },
      { name: "description", content: "BakeEase is an online bakery ordering app for Mumbai, India." },
      { property: "og:description", content: "BakeEase is an online bakery ordering app for Mumbai, India." },
      { name: "twitter:description", content: "BakeEase is an online bakery ordering app for Mumbai, India." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/692b6588-013a-4acd-a15b-2bce59e6173b/id-preview-6d316173--8961ffb4-ec67-458d-a9de-13a63d7789a3.lovable.app-1777108593665.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/692b6588-013a-4acd-a15b-2bce59e6173b/id-preview-6d316173--8961ffb4-ec67-458d-a9de-13a63d7789a3.lovable.app-1777108593665.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
