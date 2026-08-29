import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro } from "@/components/page-intro";
import { ResultPoster } from "@/components/result-poster";
import { SeasonRecap } from "@/components/season-recap";
import { ShareCardButton } from "@/components/share-card-button";
import { useMounted } from "@/lib/hooks";
import { PLAYERS_BY_ID, type Player } from "@/lib/nba";
import { formatRun, loadSave, type SavedRun } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({ component: ShopPage });

function rosterOf(run: SavedRun): Player[] {
  return run.roster.map((id) => PLAYERS_BY_ID[id]).filter((p): p is Player => Boolean(p));
}

function kindOf(run: SavedRun) {
  if (run.mode === "goat") return "goat" as const;
  if (run.mode === "16-0") return "playoff" as const;
  return "season" as const;
}

function ShopPage() {
  const mounted = useMounted();
  const runs = mounted ? loadSave().runs : [];
  const [active, setActive] = useState(0);
  const run = runs[active];

  return (
    <div>
      <PageIntro
        kicker="Card Shop"
        title="The posters you already locked."
        lead="Runs live on this device. Open one. Save the PNG. No printer, no fake tape."
      />

      {!mounted ? (
        <p className="text-sm text-muted">Opening the shop…</p>
      ) : runs.length === 0 ? (
        <div>
          <p className="text-muted">No cards yet. Lock a five first.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/games/82-0"
              className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
            >
              Build an 82-0
            </Link>
            <Link to="/games/goat" className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium shadow-border">
              GOAT Five
            </Link>
            <Link to="/games/16-0" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
              Build a 16-0
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <ol className="space-y-2">
            {runs.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex min-h-14 w-full flex-col rounded-xl bg-paper px-4 py-3 text-left shadow-border sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
                    i === active && "bg-surface ring-1 ring-fg",
                  )}
                >
                  <span className="font-medium">
                    {item.team} · {item.era}
                  </span>
                  <span className="text-sm text-muted">{formatRun(item)}</span>
                </button>
              </li>
            ))}
          </ol>
          {run && (
            <div>
              <ResultPoster
                team={run.team}
                era={run.era}
                wins={run.wins}
                roster={rosterOf(run)}
                kind={kindOf(run)}
              />
              <p className="mt-4 text-sm text-subtle">
                {run.mode === "82-0" ? "Regular season" : run.mode === "daily" ? "Daily Bucket" : run.mode === "goat" ? "GOAT Five" : "Playoff 16-0"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ShareCardButton
                  team={run.team}
                  era={run.era}
                  wins={run.wins}
                  roster={rosterOf(run)}
                  kind={kindOf(run)}
                />
              </div>
              {run.recap && <SeasonRecap recap={run.recap} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}