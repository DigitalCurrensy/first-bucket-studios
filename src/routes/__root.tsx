import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StudioShell } from "@/components/studio-shell";
import appCss from "../styles.css?url";

const APP_NAME = "First Bucket Studio";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "Games and basketball tools. Thoughtfully crafted. Used on purpose." },
      { name: "theme-color", content: "#f3eee4" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  notFoundComponent: () => (
    <div>
      <p className="font-display text-4xl font-semibold">Off the board.</p>
      <p className="mt-3 max-w-md text-muted">That page isn’t in the studio. The games still are.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-sm">
        Back to the studio
      </Link>
    </div>
  ),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <StudioShell>
            <Outlet />
          </StudioShell>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
