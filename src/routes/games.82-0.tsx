import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";

export const Route = createFileRoute("/games/82-0")({ component: Page });

function Page() {
  return <EightyTwo mode="82-0" />;
}
