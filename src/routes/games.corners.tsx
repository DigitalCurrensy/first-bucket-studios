import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";

export const Route = createFileRoute("/games/corners")({ component: Page });

function Page() {
  return <EightyTwo mode="corners" />;
}
