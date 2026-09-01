import { Link } from "@tanstack/react-router";
import { NamePlate } from "@/components/name-plate";
import { WalkCard } from "@/components/walk-card";
import { useMounted } from "@/lib/hooks";
import { PLAYERS_BY_ID } from "@/lib/nba";
import { loadSave } from "@/lib/studio-save";
import { houseWalk } from "@/lib/walk";

export function StudioFeed({ dateKey }: { dateKey: string }) {
  void dateKey;
  const mounted = useMounted();
  const save = mounted ? loadSave() : null;
  const last = save?.runs[0];
  const house = houseWalk();
  const lastNames = last?.roster.map((id) => PLAYERS_BY_ID[id]?.name).filter(Boolean) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-paper p-4 shadow-border">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">This device</p>
          {last?.walk ? (
            <Link to="/walk/$id" params={{ id: last.walk }} className="text-sm text-muted hover:text-fg">
              Open
            </Link>
          ) : (
            <Link to="/games/82-0" className="text-sm text-muted hover:text-fg">
              Rip
            </Link>
          )}
        </div>
        <ul className="flex flex-col gap-4">
          {last && (
            <li>
              <Link to={last.walk ? "/walk/$id" : "/shop"} params={last.walk ? { id: last.walk } : undefined} className="flex gap-3">
                <NamePlate name={lastNames[0] ?? last.team} id={last.roster[0]} size="sm" />
                <span className="min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">Last run · {last.team}</span>
                    <span className="shrink-0 text-micro font-medium uppercase tracking-label text-fg">{last.wins}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{lastNames.slice(0, 3).join(", ") || last.era}</span>
                </span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/walk/$id" params={{ id: house.id }} className="flex gap-3">
              <NamePlate name={house.five[0]?.name ?? "House"} id={house.five[0]?.id} size="sm" />
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">House walk · {house.room.team}</span>
                  <span className="shrink-0 text-micro font-medium uppercase tracking-label text-good">{house.walk.wins}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{house.five.map((p) => p.name).join(", ")}</span>
                <span className="mt-1 block text-micro text-subtle">Today’s room</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-xl bg-paper p-4 shadow-border">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">House walk</p>
          <Link to="/wall" className="text-sm text-muted hover:text-fg">
            The wall
          </Link>
        </div>
        <WalkCard id={house.id} />
        <p className="mt-4 text-micro text-subtle">The file is the card. The URL is the walk.</p>
      </section>
    </div>
  );
}