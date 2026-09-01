import { useEffect, useRef, useState } from "react";
import { Crest, EraMark, LuckMark, clubAbbr } from "@/components/crest";
import { ERAS, FRANCHISES, WNBA_FRANCHISES } from "@/lib/nba";
import { LUCKS } from "@/lib/luck";
import { tick } from "@/lib/tick";
import { cn } from "@/lib/utils";

export function TeamReel<T extends string>({
  items,
  target,
  spinning,
  durationClass = "duration-spin",
  compact = false,
  onRest,
}: {
  items: readonly T[];
  target: T | "";
  spinning: boolean;
  durationClass?: string;
  compact?: boolean;
  onRest?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const rested = useRef(false);
  const rotRef = useRef(0);
  const onRestRef = useRef(onRest);
  onRestRef.current = onRest;
  const [rowH, setRowH] = useState(compact ? 72 : 92);
  const [rot, setRot] = useState(0);
  const [armed, setArmed] = useState(false);
  const [landed, setLanded] = useState(false);
  const n = Math.max(items.length, 1);
  const angle = 360 / n;
  const radius = rowH / (2 * Math.tan(Math.PI / n));
  const land = target ? Math.max(0, items.indexOf(target as T)) : 0;
  const clubs = items[0]
    ? (FRANCHISES as readonly string[]).includes(items[0]) || (WNBA_FRANCHISES as readonly string[]).includes(items[0])
    : false;
  const eras = items[0] ? (ERAS as readonly string[]).includes(items[0]) : false;
  const lucks = items[0] ? (LUCKS as readonly string[]).includes(items[0]) : false;
  const idle = !target;
  const markSize = compact ? "size-6" : "size-11";

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    const h = node.offsetHeight;
    if (h > 0) setRowH(h);
  }, [items, compact]);

  useEffect(() => {
    rested.current = false;
    setLanded(false);
    if (!spinning || !target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = reduced
      ? land * angle
      : Math.ceil(rotRef.current / 360) * 360 + 5 * 360 + land * angle;

    if (reduced) {
      rotRef.current = next;
      setArmed(false);
      setRot(next);
      setLanded(true);
      rested.current = true;
      tick();
      onRestRef.current?.();
      return;
    }

    setArmed(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rotRef.current = next;
        setArmed(true);
        setRot(next);
      });
    });
    const failsafe = window.setTimeout(() => {
      if (rested.current) return;
      rested.current = true;
      setLanded(true);
      tick();
      onRestRef.current?.();
    }, 1900);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(failsafe);
    };
  }, [spinning, target, land, angle]);

  function rest() {
    if (!spinning || rested.current) return;
    rested.current = true;
    setLanded(true);
    tick();
    onRestRef.current?.();
  }

  return (
    <div
      className={cn(
        "reel-window relative overflow-hidden rounded-xl bg-paper shadow-border card-edge",
        compact && "reel-compact",
        spinning && armed && "is-whirring",
        landed && "reel-land",
        idle && "reel-idle",
      )}
      aria-live="polite"
      aria-atomic="true"
      aria-label={target ? String(target) : "Ready to pull"}
    >
      <div className="reel-scene absolute inset-0">
        <div
          className={cn("reel-drum", armed && `transition-transform ${durationClass} ease-studio`)}
          style={{ transform: `rotateX(${-rot}deg)` }}
          onTransitionEnd={(e) => {
            if (e.propertyName !== "transform") return;
            rest();
          }}
        >
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              ref={i === 0 ? rowRef : undefined}
              className="reel-face ink-grain absolute inset-x-0 top-0 flex items-center justify-center gap-2 px-2"
              style={{ transform: `rotateX(${i * angle}deg) translateZ(${radius}px)` }}
            >
              {clubs && <Crest name={name} className={cn("shrink-0 text-fg", markSize)} />}
              {eras && <EraMark name={name} className={cn("shrink-0 text-fg", markSize)} />}
              {lucks && <LuckMark name={name} className={cn("shrink-0 text-fg", markSize)} />}
              <div className="min-w-0 text-center">
                <p
                  className={cn(
                    "opsz-deck font-display font-semibold leading-none",
                    compact ? "text-sm sm:text-lg" : "text-2xl sm:text-3xl",
                  )}
                >
                  {name}
                </p>
                {clubs && !compact && (
                  <p className="mt-1 text-micro font-medium uppercase tracking-label text-subtle">{clubAbbr(name)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 z-10 reel-payline shadow-border" />
      <div className="reel-shade pointer-events-none absolute inset-0 z-10" />
    </div>
  );
}
