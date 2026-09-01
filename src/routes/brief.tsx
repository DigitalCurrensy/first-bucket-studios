import { createFileRoute } from "@tanstack/react-router";
import { HouseRedirect } from "@/components/house-redirect";

export const Route = createFileRoute("/brief")({
  validateSearch: (raw: Record<string, unknown>) => ({
    issue: typeof raw.issue === "string" ? raw.issue : undefined,
  }),
  component: HouseRedirect,
});
