import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK = "An unexpected error occurred. Try reloading the page.";

function messageFromUnknown(error: unknown): string {
  if (typeof error === "string" && error.length > 0) return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }
  return FALLBACK;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-warn" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted">{messageFromUnknown(error)}</p>
    </main>
  );
}
