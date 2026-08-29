import { Link } from "@tanstack/react-router";
import { initials, plateFor } from "@/components/crest";
import { shortDate } from "@/lib/season";
import { buildTape } from "@/lib/tape";
import { cn } from "@/lib/utils";

export function StudioFeed({ dateKey }: { dateKey: string }) {
  const rows = buildTape(dateKey);
  const feed = rows.slice(0, 6);
  const movers = rows.filter((row) => row.mark !== "FLAT").slice(0, 4);
  const stamp = shortDate();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-paper p-4 shadow-border">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-micro font-medium uppercase tracking-label text-good">Live</span>
            <p className="text-sm font-medium">Studio Feed</p>
          </div>
          <Link to="/tape" className="text-sm text-muted hover:text-fg">
            View
          </Link>
        </div>
        <ul className="flex flex-col gap-4">
          {feed.map((row) => (
            <li key={row.player.id}>
              <Link to="/tape" className="flex gap-3">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-fg">
                  <img
                    src={plateFor(row.player.pos, row.player.era)}
                    alt=""
                    crossOrigin="anonymous"
                    className="size-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-fg/50 text-micro font-medium text-paper">
                    {initials(row.player.name)}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{row.player.name}</span>
                    <span
                      className={cn(
                        "shrink-0 text-micro font-medium uppercase tracking-label",
                        row.mark === "UP" && "text-good",
                        row.mark === "DOWN" && "text-warn",
                        row.mark === "FLAT" && "text-subtle",
                      )}
                    >
                      {row.mark}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-micro uppercase tracking-label text-subtle">
                    {row.player.pos} · {row.player.era}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{row.note}</span>
                  <span className="mt-1 block text-micro text-subtle">
                    The Tape · {stamp}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-paper p-4 shadow-border">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">On the move</p>
          <Link to="/tape" className="text-sm text-muted hover:text-fg">
            The Tape
          </Link>
        </div>
        <ul className="flex flex-col gap-3">
          {movers.map((row) => (
            <li key={row.player.id} className="flex items-center gap-3">
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-fg">
                <img
                  src={plateFor(row.player.pos, row.player.era)}
                  alt=""
                  crossOrigin="anonymous"
                  className="size-full object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-fg/50 text-micro font-medium text-paper">
                  {initials(row.player.name)}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{row.player.name}</span>
                <span className="text-micro uppercase tracking-label text-subtle">{row.player.pos}</span>
              </span>
              <span className={cn("text-sm font-medium", row.mark === "UP" ? "text-good" : "text-warn")}>{row.mark}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-micro text-subtle">Marks. Not a book. Not a player stock.</p>
      </section>
    </div>
  );
}
