import { useEffect } from "react";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { FileTrayHost } from "@/components/file-tray";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StudioShell } from "@/components/studio-shell";
import { ToastHost } from "@/components/toast-host";
import { armTuesdayTape } from "@/lib/drops";
import { loadRosterPatch } from "@/lib/roster-patch";
import appCss from "../styles.css?url";

const APP_NAME = "First Bucket Studio";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "Rip the pack. Send the card. A franchise lands. The walk is a URL." },
      { name: "theme-color", content: "#0c0b09" },
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
      <p className="mt-3 max-w-md text-muted">That page isn’t in the studio. The pack still is.</p>
      <Link
        to="/games/82-0"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
      >
        Rip the pack
      </Link>
    </div>
  ),
  component: RootDocument,
});

function RootDocument() {
  useEffect(() => {
    void loadRosterPatch();
    armTuesdayTape();
  }, []);
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
          <FileTrayHost />
          <ToastHost />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
