import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { PageIntro } from "@/components/page-intro";
import { JobTicket } from "@/components/press-furniture";
import { ResultPoster } from "@/components/result-poster";
import { SeasonRecap } from "@/components/season-recap";
import { ShareCardButton } from "@/components/share-card-button";
import { recapOf } from "@/lib/recap";
import { goatLabel, goatScore, playoffLabel, playoffLine, recordLine } from "@/lib/nba";
import { playoffWalk, seasonWalk, wnbaWalk } from "@/lib/sim";
import { attemptsFor, rememberWalk, type SavedRun } from "@/lib/studio-save";
import { decodeWalk, playersOf } from "@/lib/walk";
import { cardSerial } from "@/lib/plates";
import { useMounted } from "@/lib/hooks";

export const Route = createFileRoute("/walk/$id")({
  head: ({ params }) => {
    const decoded = decodeWalk(params.id);
    if (!decoded) {
      return { meta: [{ title: "Walk · First Bucket Studio" }] };
    }
    const roster = playersOf(decoded.ids);
    const names = roster.map((p) => p.name).join(", ");
    const title = names ? `${names} · First Bucket Studio` : "Walk · First Bucket Studio";
    const line = decoded.kind === "goat" ? names : `${decoded.team} · ${names}`;
    return {
      meta: [
        { title },
        { name: "description", content: `${line}. Send the card. The URL is the walk.` },
      ],
    };
  },
  component: WalkPage,
});

function modesOf(kind: string): SavedRun["mode"][] {
  if (kind === "goat") return ["goat"];
  if (kind === "playoff") return ["16-0"];
  if (kind === "wnba") return ["wnba"];
  return ["82-0", "daily", "corners"];
}

function WalkPage() {
  const { id } = Route.useParams();
  const mounted = useMounted();
  const decoded = decodeWalk(id);
  const view = useMemo(() => {
    if (!decoded) return null;
    const roster = playersOf(decoded.ids);
    if (roster.length !== 5) return null;
    if (decoded.kind === "goat") {
      const score = goatScore(roster);
      return { roster, wins: score, nights: [] as { win: boolean }[], projected: score, recap: null, kind: "goat" as const };
    }
    if (decoded.kind === "playoff") {
      const walk = playoffWalk(decoded.team, decoded.era, roster, decoded.luck);
      return {
        roster,
        wins: walk.wins,
        nights: walk.nights,
        projected: walk.projected,
        recap: recapOf(walk.nights, walk.projected),
        kind: "playoff" as const,
      };
    }
    if (decoded.kind === "wnba") {
      const walk = wnbaWalk(decoded.team, decoded.era, roster, decoded.luck);
      return {
        roster,
        wins: walk.wins,
        nights: walk.nights,
        projected: walk.projected,
        recap: recapOf(walk.nights, walk.projected),
        kind: "wnba" as const,
      };
    }
    const walk = seasonWalk(decoded.team, decoded.era, roster, decoded.luck);
    return {
      roster,
      wins: walk.wins,
      nights: walk.nights,
      projected: walk.projected,
      recap: recapOf(walk.nights, walk.projected),
      kind: "season" as const,
    };
  }, [decoded]);

  const tries = mounted && decoded ? attemptsFor(decoded.ids, modesOf(decoded.kind)).slice(0, 6) : [];

  useEffect(() => {
    if (decoded) rememberWalk(id);
  }, [decoded, id]);

  if (!decoded || !view) {
    return (
      <div>
        <PageIntro kicker="Walk room" title="This card didn’t land." lead="The URL is the card. This one isn’t in the book." mark="walk" />
        <Link
          to="/games/82-0"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Rip the pack
        </Link>
      </div>
    );
  }

  const of = decoded.kind === "wnba" ? 40 : decoded.kind === "playoff" ? 16 : decoded.kind === "goat" ? 0 : 82;
  const title =
    decoded.kind === "goat"
      ? `GOAT Five · ${view.wins}`
      : decoded.kind === "playoff"
        ? `${decoded.team} · ${playoffLine(view.wins)}`
        : `${decoded.team} · ${recordLine(view.wins, of || 82)}`;
  const lead =
    decoded.kind === "goat"
      ? `${goatLabel(view.wins)}. Five names. Same circle.`
      : decoded.kind === "playoff"
        ? `${decoded.era} · ${decoded.luck}. ${playoffLabel(view.wins)}. Lose a series, the run is over.`
        : `${decoded.era} · ${decoded.luck}. Same five. Same nights. Send the card.`;

  return (
    <div>
      <PageIntro kicker="Walk room" title={title} lead={lead} mark="walk" />
      <div className="grid gap-8 lg:grid-cols-2">
        <ResultPoster
          team={decoded.team}
          era={decoded.kind === "goat" ? decoded.era : decoded.era}
          wins={view.wins}
          roster={view.roster}
          kind={view.kind}
          nights={view.nights}
        />
        <div>
          <p className="text-sm text-muted">
            {decoded.kind === "goat"
              ? `${view.wins} on the circle. This URL is the certificate.`
              : `Projected ${view.projected}. Same five. Same nights. This URL is the certificate.`}
          </p>
          <JobTicket kicker="House print">
            <ul className="mt-4 space-y-2">
              {view.roster.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="plate-stamp shrink-0 text-subtle">{cardSerial(p.id)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 break-all font-mono text-micro text-subtle">{id}</p>
          </JobTicket>
          {view.recap && <SeasonRecap recap={view.recap} />}
          <div className="mt-6 flex flex-wrap gap-2">
            <ShareCardButton
              team={decoded.team}
              era={decoded.era}
              wins={view.wins}
              roster={view.roster}
              luck={decoded.kind === "goat" ? undefined : decoded.luck}
              nights={view.nights}
              kind={view.kind}
            />
            <Link
              to="/games/82-0"
              className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium shadow-border"
              onClick={() => rememberWalk(id)}
            >
              Rip the pack
            </Link>
            <Link to="/wall" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
              The wall
            </Link>
          </div>
          {tries.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">This device · same five</p>
              <ul className="space-y-1">
                {tries.map((run) => (
                  <li key={run.id}>
                    {run.walk ? (
                      <Link
                        to="/walk/$id"
                        params={{ id: run.walk }}
                        className="inline-flex min-h-11 items-center text-sm text-fg"
                      >
                        {run.wins} ·{" "}
                        {new Date(run.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · Open
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center text-sm text-muted">
                        {run.wins} · {new Date(run.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}