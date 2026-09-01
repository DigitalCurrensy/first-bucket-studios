import type { PointerEvent, ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { RipPack } from "@/components/rip-pack";
import { useSpecular } from "@/lib/hooks";
import { markDemo } from "@/lib/demo-funnel";
import { cn } from "@/lib/utils";

export function PressStage({
  children,
  slug,
  className,
  pad = "pad",
}: {
  children: ReactNode;
  slug?: string;
  className?: string;
  pad?: "pad" | "hero" | "none";
}) {
  return (
    <figure className={cn("press-stage", className)}>
      <div
        className={cn(
          "press-trim",
          pad === "pad" && "press-stage-pad",
          pad === "hero" && "press-stage-hero",
        )}
      >
        <span className="press-crop press-crop-tl" aria-hidden="true" />
        <span className="press-crop press-crop-tr" aria-hidden="true" />
        <span className="press-crop press-crop-bl" aria-hidden="true" />
        <span className="press-crop press-crop-br" aria-hidden="true" />
        <span className="press-reg" aria-hidden="true" />
        <span className="press-ink" aria-hidden="true" />
        {children}
      </div>
      {slug ? <figcaption className="press-slug">{slug}</figcaption> : null}
    </figure>
  );
}

export function JobTicket({
  kicker,
  children,
  className,
}: {
  kicker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("job-ticket", className)}>
      {kicker ? (
        <p className="v-tertiary text-micro font-medium uppercase tracking-label">{kicker}</p>
      ) : null}
      {children}
    </div>
  );
}

const HOUSE_STEPS = [
  { n: "01", title: "Rip", body: "Tear the foil." },
  { n: "02", title: "Tear", body: "Five is marked." },
  { n: "03", title: "Walk", body: "Eighty-two nights." },
  { n: "04", title: "Send", body: "The card. The walk." },
] as const;

export function StepRail({
  current = 0,
  className,
}: {
  current?: 0 | 1 | 2 | 3 | 4;
  className?: string;
}) {
  return (
    <ol className={cn("step-rail", className)}>
      {HOUSE_STEPS.map((step, i) => {
        const n = i + 1;
        const isCurrent = current === n;
        const isDone = current > n;
        return (
          <li key={step.n} className={cn(isCurrent && "is-current", isDone && "is-done")}>
            <p className="step-rail-n plate-stamp v-label">{step.n}</p>
            <p className="mt-2 font-display text-lg font-semibold leading-none">{step.title}</p>
            <p className="step-rail-body v-secondary mt-1 text-micro">{step.body}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function PackHero() {
  const navigate = useNavigate();
  const [ripping, setRipping] = useState(false);
  const well = useRef<HTMLDivElement>(null);
  useSpecular(well);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    const el = well.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 7).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 9).toFixed(2)}deg`);
  }

  function untilt() {
    const el = well.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  function go() {
    if (ripping) return;
    setRipping(true);
    markDemo("rip");
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        void navigate({ to: "/games/82-0" });
      },
      reduce ? 0 : 380,
    );
  }

  return (
    <PressStage slug="Prospect pack · Season 82 · Night stock" pad="none">
      <div
        ref={well}
        className="pack-pedestal"
        onPointerMove={tilt}
        onPointerLeave={untilt}
      >
        <div className="pack-tilt">
          <RipPack lot="live:home" ripping={ripping} onRip={go} />
        </div>
      </div>
    </PressStage>
  );
}

export function LastWalkSlip({
  team,
  line,
  names,
  walk,
}: {
  team: string;
  line: string;
  names: string[];
  walk?: string;
}) {
  return (
    <JobTicket kicker="On the press" className="mt-10 max-w-lg">
      <p className="mt-2 font-display text-xl font-semibold">
        {team} · {line}
      </p>
      {names.length ? <p className="mt-1 text-sm text-muted">{names.slice(0, 5).join(" · ")}</p> : null}
      {walk ? (
        <Link to="/walk/$id" params={{ id: walk }} className="mt-4 inline-flex min-h-11 items-center text-sm text-fg">
          Open the walk
        </Link>
      ) : null}
    </JobTicket>
  );
}
