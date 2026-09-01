import { createFileRoute } from "@tanstack/react-router";
import { EightyTwo } from "@/components/eighty-two";
import { HOUSE_PACK } from "@/lib/house-pack";
import { LUCKS, type Luck } from "@/lib/luck";
import { ERAS, FRANCHISES, type Era } from "@/lib/nba";
import { decodeChallengeIds } from "@/lib/walk";

type Search = {
  team?: string;
  era?: Era;
  luck?: Luck;
  beat?: number;
  ids?: string[];
  pack?: "house";
};

export const Route = createFileRoute("/games/82-0")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const team = typeof raw.team === "string" && (FRANCHISES as readonly string[]).includes(raw.team) ? raw.team : undefined;
    const era = typeof raw.era === "string" && (ERAS as readonly string[]).includes(raw.era) ? (raw.era as Era) : undefined;
    const luck = typeof raw.luck === "string" && (LUCKS as readonly string[]).includes(raw.luck) ? (raw.luck as Luck) : undefined;
    const beat = Number(raw.beat);
    if (raw.pack === "house") {
      return {
        team: HOUSE_PACK.team,
        era: HOUSE_PACK.era,
        luck: HOUSE_PACK.luck,
        pack: "house",
      };
    }
    const challenge = Boolean(team && era);
    if (!challenge) return {};
    return {
      team,
      era,
      luck,
      beat: Number.isFinite(beat) ? beat : undefined,
      ids: decodeChallengeIds(raw.ids),
    };
  },
  head: () => ({
    meta: [
      { title: "Rip the pack. Send the card. · First Bucket Studio" },
      { name: "description", content: "Tear the foil. A franchise lands. Five names. The card is yours." },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <EightyTwo mode="82-0" challenge={search} />;
}