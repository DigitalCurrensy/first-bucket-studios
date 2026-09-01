import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";
import { decodeChallengeIds } from "@/lib/walk";

type Search = {
  beat?: number;
  ids?: string[];
};

export const Route = createFileRoute("/games/daily")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const beat = Number(raw.beat);
    return {
      beat: Number.isFinite(beat) ? beat : undefined,
      ids: decodeChallengeIds(raw.ids),
    };
  },
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <EightyTwo mode="daily" challenge={search} />;
}
