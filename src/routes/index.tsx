import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { StudioFeed } from "@/components/studio-feed";
import { PRODUCTS, TABS, type Tab } from "@/lib/catalog";
import { useMounted } from "@/lib/hooks";
import { PLAYERS_BY_ID } from "@/lib/nba";
import { seasonLine } from "@/lib/season";
import { formatRun, loadSave, weekKey } from "@/lib/studio-save";
import { decodeWalk } from "@/lib/walk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mounted = useMounted();
  const [tab, setTab] = useState<Tab>("Play");
  const save = mounted ? loadSave() : null;
  const latest = save?.runs[0];
  const latestNames = latest?.roster.map((id) => PLAYERS_BY_ID[id]?.name).filter(Boolean) ?? [];
  const shown = PRODUCTS.filter((p) => p.tab === tab);
  const clock = seasonLine();
  const week = weekKey();
  const wall = (save?.walks ?? []).slice(0, 4).map((id) => ({ id, payload: decodeWalk(id) }));

  return (
    <div>
      <p className="text-micro font-medium uppercase tracking-label text-subtle">First Bucket Studio</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">Play 82-0. Rip the pack. Send the card.</h1>
      <p className="mt-3 max-w-xl text-muted">A basketball house with a machine at the center. Editorial desks. Not a sportsbook.</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Check className="size-4 text-good" aria-hidden="true" />
        The walk is a URL. Tuesday is Tape + Brief + Daily.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/games/82-0"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Build an 82-0
        </Link>
        <Link
          to="/tape"
          className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium shadow-border"
        >
          The Tape
        </Link>
      </div>

      {latest && (
        <p className="mt-8 text-sm text-muted">
          Last run: {latest.team} · {formatRun(latest)}
          {latestNames.length ? ` · ${latestNames.slice(0, 3).join(", ")}` : ""}
          {save && save.bestWins > 0 && <span className="ml-2 text-fg">Best {save.bestWins}</span>}
          {latest.walk && (
            <Link to="/walk/$id" params={{ id: latest.walk }} className="ml-2 text-fg">
              Open the walk
            </Link>
          )}
        </p>
      )}

      {wall.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">The wall</p>
          <ul className="flex flex-wrap gap-2">
            {wall.map((item) => (
              <li key={item.id}>
                <Link
                  to="/walk/$id"
                  params={{ id: item.id }}
                  className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm shadow-border"
                >
                  {item.payload ? `${item.payload.team} ${item.payload.wins}` : "Walk"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 border-b border-line sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "min-h-11 shrink-0 px-3 text-sm font-medium transition-colors duration-150",
                tab === key ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg",
              )}
            >
              {key}
            </button>
          ))}
        </div>
        <p className="pb-3 text-micro font-medium uppercase tracking-label text-accent sm:text-right">{clock}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-dashboard">
        <section>
          <p className="mb-4 font-display text-2xl font-semibold">{tab}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((product) => (
              <ProductCard key={`${product.tab}-${product.href}-${product.title}`} product={product} />
            ))}
          </div>
        </section>
        <div className="lg:sticky lg:top-8 lg:self-start">
          <StudioFeed dateKey={week} />
        </div>
      </div>
    </div>
  );
}
