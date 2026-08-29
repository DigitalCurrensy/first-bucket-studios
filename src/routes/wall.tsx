import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";
import { useMounted } from "@/lib/hooks";
import { recordLine } from "@/lib/nba";
import { loadSave } from "@/lib/studio-save";
import { decodeWalk, houseWalk } from "@/lib/walk";
import { todayKey } from "@/lib/studio-save";

export const Route = createFileRoute("/wall")({ component: WallPage });

function WallPage() {
  const mounted = useMounted();
  const house = houseWalk(todayKey());
  const save = mounted ? loadSave() : null;
  const ids = Array.from(new Set([house.id, ...(save?.walks ?? []), ...(save?.runs.map((r) => r.walk).filter(Boolean) as string[])]));

  return (
    <div>
      <PageIntro
        kicker="The Wall"
        title="Walks that live on this device."
        lead="No graffiti. No accounts. The URL is the card. The house walk is today’s room."
      />

      <article className="mb-10 rounded-xl bg-fg p-6 text-paper">
        <p className="text-micro font-medium uppercase tracking-label text-accent">House walk · {todayKey()}</p>
        <p className="mt-3 font-display text-3xl font-semibold">
          {house.room.team} · {recordLine(house.walk.wins)}
        </p>
        <p className="mt-2 text-sm text-paper/70">
          {house.room.era} · {house.room.luck} · {house.five.map((p) => p.name).join(", ")}
        </p>
        <Link
          to="/walk/$id"
          params={{ id: house.id }}
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-fg"
        >
          Open the house walk
        </Link>
      </article>

      {!mounted ? (
        <p className="text-sm text-muted">Opening the wall…</p>
      ) : ids.length === 0 ? (
        <p className="text-muted">No walks yet. Lock a five.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {ids.map((id) => {
            const payload = decodeWalk(id);
            return (
              <li key={id}>
                <Link
                  to="/walk/$id"
                  params={{ id }}
                  className="block min-h-14 rounded-xl bg-paper px-4 py-4 shadow-border"
                >
                  <p className="font-medium">
                    {payload ? `${payload.team} · ${recordLine(payload.wins)}` : "Walk"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {payload ? `${payload.era} · ${payload.luck}` : id.slice(0, 28)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
