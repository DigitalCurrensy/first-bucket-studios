import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageIntro } from "@/components/page-intro";
import { ResultPoster } from "@/components/result-poster";
import { SeasonRecap } from "@/components/season-recap";
import { ShareCardButton } from "@/components/share-card-button";
import { type Luck } from "@/lib/luck";
import { recapOf } from "@/lib/recap";
import { recordLine } from "@/lib/nba";
import { seasonWalk } from "@/lib/sim";
import { rememberWalk } from "@/lib/studio-save";
import { decodeWalk, playersOf } from "@/lib/walk";

export const Route = createFileRoute("/walk/$id")({ component: WalkPage });

function WalkPage() {
  const { id } = Route.useParams();
  const decoded = decodeWalk(id);
  const view = useMemo(() => {
    if (!decoded) return null;
    const roster = playersOf(decoded.ids);
    if (roster.length !== 5) return null;
    const walk = seasonWalk(decoded.team, decoded.era, roster, decoded.luck);
    return {
      roster,
      walk,
      recap: recapOf(walk.nights, walk.projected),
    };
  }, [decoded]);

  if (!decoded || !view) {
    return (
      <div>
        <PageIntro kicker="Walk room" title="This card didn’t land." lead="The URL is the card. This one isn’t in the book." />
        <Link to="/games/82-0" className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper">
          Build an 82-0
        </Link>
      </div>
    );
  }

  const wins = view.walk.wins;

  return (
    <div>
      <PageIntro
        kicker="Walk room"
        title={`${decoded.team} · ${recordLine(wins)}`}
        lead={`${decoded.era} · ${decoded.luck}. Same five. Same walk. Beat it is a new pack in this room.`}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <ResultPoster
          team={decoded.team}
          era={`${decoded.era} · ${decoded.luck}`}
          wins={wins}
          roster={view.roster}
          nights={view.walk.nights}
        />
        <div>
          <p className="text-sm text-muted">
            Projected {view.walk.projected}. The nights are seeded. This URL is the card.
          </p>
          <SeasonRecap recap={view.recap} />
          <div className="mt-6 flex flex-wrap gap-2">
            <ShareCardButton
              team={decoded.team}
              era={decoded.era}
              wins={wins}
              roster={view.roster}
              luck={decoded.luck}
              nights={view.walk.nights}
            />
            <Link
              to="/games/82-0"
              search={{ team: decoded.team, era: decoded.era, luck: decoded.luck as Luck, beat: wins }}
              className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
              onClick={() => rememberWalk(id)}
            >
              Beat it
            </Link>
            <Link to="/wall" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
              The wall
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
