import { Link } from "@tanstack/react-router";
import { ResultPoster } from "@/components/result-poster";
import { ShareCardButton } from "@/components/share-card-button";
import { decodeWalk, playersOf, type WalkPayload } from "@/lib/walk";
import type { Player } from "@/lib/nba";

export function WalkCard({ id }: { id: string }) {
  const payload = decodeWalk(id);
  const roster = payload ? playersOf(payload.ids) : [];

  if (!payload || roster.length !== 5) {
    return (
      <Link
        to="/walk/$id"
        params={{ id }}
        className="group block min-h-11 rounded-xl bg-fg p-4 text-sm text-paper/70 shadow-border"
      >
        This card didn’t land.
      </Link>
    );
  }

  return (
    <article>
      <Link to="/walk/$id" params={{ id }} className="group block min-h-11">
        <ResultPoster
          compact
          team={payload.team}
          era={payload.era}
          wins={payload.wins}
          roster={roster}
          kind={payload.kind}
        />
      </Link>
      <div className="mt-2 flex flex-wrap gap-2">
        <WalkSend payload={payload} roster={roster} />
      </div>
    </article>
  );
}

function WalkSend({ payload, roster }: { payload: WalkPayload; roster: Player[] }) {
  return (
    <ShareCardButton
      team={payload.team}
      era={payload.era}
      wins={payload.wins}
      roster={roster}
      kind={payload.kind === "playoff" ? "playoff" : payload.kind === "wnba" ? "wnba" : payload.kind === "goat" ? "goat" : "season"}
      luck={payload.kind === "goat" ? undefined : payload.luck}
    />
  );
}
