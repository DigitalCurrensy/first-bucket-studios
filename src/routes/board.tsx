import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageIntro } from "@/components/page-intro";
import { useMounted } from "@/lib/hooks";
import { PROSPECTS, type Prospect } from "@/lib/prospects";
import { loadSave, writeSave } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board")({ component: BoardPage });

const TIERS = [
  { id: 1 as const, label: "Watch" },
  { id: 2 as const, label: "Board" },
  { id: 3 as const, label: "Can't miss" },
];

function cycle(n: 1 | 2 | 3): 1 | 2 | 3 {
  return n === 1 ? 2 : n === 2 ? 3 : 1;
}

function BoardPage() {
  const mounted = useMounted();
  const [tiers, setTiers] = useState<Record<string, 1 | 2 | 3>>({});

  useEffect(() => {
    setTiers(loadSave().boardTiers);
  }, []);

  function bump(card: Prospect) {
    const nextTier = cycle(tiers[card.id] ?? 1);
    const next = { ...tiers, [card.id]: nextTier };
    setTiers(next);
    const save = loadSave();
    writeSave({ ...save, boardTiers: next });
  }

  return (
    <div>
      <PageIntro
        kicker="The Board"
        title="Cards before clips."
        lead="Fictional demo prospects only. Real athletes — especially minors — never appear without a consent row, a gym, and a date. This is not a recruiting service and not an NCAA determination."
      />

      <div className="mb-8 rounded-xl bg-paper px-5 py-4 text-sm text-muted shadow-border">
        Clip fields stay empty on purpose. A source is required before a video ever attaches. Houses do not merge:
        this board is First Bucket, not THE HUB, not NIL MIXTAPE.
      </div>

      {!mounted ? (
        <p className="text-sm text-muted">Loading the demo board…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const cards = PROSPECTS.filter((p) => (tiers[p.id] ?? 1) === tier.id);
            return (
              <section key={tier.id}>
                <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">
                  {tier.label}
                  <span className="ml-2 tabular-nums">{cards.length}</span>
                </p>
                <div className="flex flex-col gap-3">
                  {cards.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line px-4 py-8 text-sm text-subtle">
                      Empty column. Click a card to move it.
                    </p>
                  )}
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => bump(card)}
                      className={cn(
                        "rounded-xl bg-paper p-5 text-left shadow-border transition-shadow duration-150 hover:shadow-border-hover",
                      )}
                    >
                      <p className="font-display text-xl font-semibold">{card.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {card.role} · {card.classYear}
                      </p>
                      <p className="mt-3 text-sm text-muted">{card.note}</p>
                      <p className="mt-4 text-micro uppercase tracking-label text-subtle">Click to retier · no clip</p>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
