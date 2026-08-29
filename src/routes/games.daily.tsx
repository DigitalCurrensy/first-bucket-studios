import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";

export const Route = createFileRoute("/games/daily")({ component: Page });

function Page() {
  return <EightyTwo mode="daily" />;
}
