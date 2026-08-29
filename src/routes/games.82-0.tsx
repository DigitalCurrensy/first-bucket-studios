import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";
import { LUCKS, type Luck } from "@/lib/luck";
import { ERAS, FRANCHISES, type Era, type Franchise } from "@/lib/nba";

type Search = {
  team?: Franchise;
  era?: Era;
  luck?: Luck;
  beat?: number;
};

export const Route = createFileRoute("/games/82-0")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const team = typeof raw.team === "string" && (FRANCHISES as readonly string[]).includes(raw.team) ? (raw.team as Franchise) : undefined;
    const era = typeof raw.era === "string" && (ERAS as readonly string[]).includes(raw.era) ? (raw.era as Era) : undefined;
    const luck = typeof raw.luck === "string" && (LUCKS as readonly string[]).includes(raw.luck) ? (raw.luck as Luck) : undefined;
    const beat = Number(raw.beat);
    return {
      team,
      era,
      luck,
      beat: Number.isFinite(beat) ? beat : undefined,
    };
  },
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <EightyTwo mode="82-0" challenge={search} />;
}
