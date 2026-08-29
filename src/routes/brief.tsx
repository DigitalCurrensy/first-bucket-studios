import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { ISSUES } from "@/lib/issues";
import { briefText, buildBrief } from "@/lib/brief";
import { todayKey, weekKey } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brief")({ component: BriefPage });

function BriefPage() {
  const [copied, setCopied] = useState(false);
  const week = weekKey();
  const date = todayKey();
  const brief = buildBrief(week, date);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(briefText(week, date));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <PageIntro kicker={brief.kicker} title={brief.title} lead={brief.dek} />

      <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          {brief.date} · {week} · No signup. The desk lives here.
        </p>
        <Button onClick={copyBrief}>{copied ? "Copied" : "Copy brief"}</Button>
      </div>

      <article className="mb-10 rounded-xl bg-fg p-6 text-paper">
        <p className="text-micro font-medium uppercase tracking-label text-accent">House walk · {date}</p>
        <p className="mt-3 font-display text-3xl font-semibold">{brief.house.line}</p>
        <p className="mt-2 text-sm text-paper/70">{brief.house.names.join(", ")}</p>
        <Link
          to="/walk/$id"
          params={{ id: brief.house.id }}
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-fg"
        >
          Open the house walk
        </Link>
      </article>

      <article className="max-w-2xl space-y-5 text-base text-muted">
        {brief.grafs.map((graf) => (
          <p key={graf.slice(0, 24)}>{graf}</p>
        ))}
      </article>

      <section className="mt-12 grid gap-8 sm:grid-cols-3">
        <CallList kicker="Start" rows={brief.start} tone="good" />
        <CallList kicker="Sit" rows={brief.sit} tone="warn" />
        <CallList kicker="Stream" rows={brief.stream} tone="muted" />
      </section>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Love</p>
          <ul className="space-y-3">
            {brief.love.map((item) => (
              <li key={item.name}>
                <p className="font-display text-xl font-semibold">{item.name}</p>
                <p className="text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Hate</p>
          <ul className="space-y-3">
            {brief.hate.map((item) => (
              <li key={item.name}>
                <p className="font-display text-xl font-semibold">{item.name}</p>
                <p className="text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-12 max-w-xl text-sm text-subtle">{brief.close}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {ISSUES.map((issue) => (
          <span key={issue.id} className={cn("text-sm", issue.id === brief.id ? "text-fg" : "text-subtle")}>
            Issue {issue.id}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/tape"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          The Tape
        </Link>
        <Link to="/games/daily" className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium shadow-border">
          Daily Bucket
        </Link>
        <Link to="/fantasy" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
          Market Board
        </Link>
      </div>
    </div>
  );
}

function CallList({
  kicker,
  rows,
  tone,
}: {
  kicker: string;
  rows: Array<{ name: string; team: string; why: string }>;
  tone: "good" | "warn" | "muted";
}) {
  return (
    <section>
      <p
        className={cn(
          "mb-3 text-micro font-medium uppercase tracking-label",
          tone === "good" && "text-good",
          tone === "warn" && "text-warn",
          tone === "muted" && "text-subtle",
        )}
      >
        {kicker}
      </p>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.name}>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-subtle">{row.team}</p>
            <p className="mt-1 text-sm text-muted">{row.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
