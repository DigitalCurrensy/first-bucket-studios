import { createFileRoute } from "@tanstack/react-router";
import { HouseRedirect } from "@/components/house-redirect";

export const Route = createFileRoute("/tape")({ component: HouseRedirect });
