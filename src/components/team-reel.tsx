import { useEffect, useMemo, useRef, useState } from "react";
import { Crest, EraMark, clubAbbr } from "@/components/crest";
import { ERAS, FRANCHISES } from "@/lib/nba";
import { cn } from "@/lib/utils";

export function TeamReel<T extends string>({
  items,
  target,
  spinning,
  loops = 8,
  onRest,
}: {
  items: readonly T[];
  target: T | "";
  spinning: boolean;
  loops?: number;
  onRest?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const rested = useRef(false);
  const onRestRef = useRef(onRest);
  onRestRef.current = onRest;
  const [rowH, setRowH] = useState(92);
  const [offset, setOffset] = useState(0);
  const [armed, setArmed] = useState(false);
  const [landed, setLanded] = useState(false);
  const strip = useMemo(() => Array.from({ length: loops }, () => items).flat(), [items, loops]);
  const land = target ? items.indexOf(target as T) : 0;
  const endIndex = (loops - 1) * items.length + Math.max(0, land);
  const clubs = items[0] ? (FRANCHISES as readonly string[]).includes(items[0]) : false;
  const eras = items[0] ? (ERAS as readonly string[]).includes(items[0]) : false;

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    const h = node.offsetHeight;
    if (h > 0) setRowH(h);
  }, [items]);

  useEffect(() => {
    setArmed(false);
    setOffset(0);
    setLanded(false);
  }, [items]);

  useEffect(() => {
    rested.current = false;
    setLanded(false);
    if (!spinning || !target) return;
    setArmed(false);
    setOffset(0);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setArmed(true);
        setOffset(Math.max(0, endIndex - 1) * Math.max(rowH, 1));
      });
    });
    const failsafe = window.setTimeout(() => {
      if (rested.current) return;
      rested.current = true;
      setLanded(true);
      onRestRef.current?.();
    }, 2000);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(failsafe);
    };
  }, [spinning, target, endIndex, rowH]);

  return (
    <div
      className={cn("reel-window relative overflow-hidden rounded-xl bg-paper shadow-border", landed && "reel-land")}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-none absolute inset-x-0 z-10 reel-payline shadow-border" />
      <div
        className={cn("reel-strip", spinning && armed && "is-spinning", armed && "transition-transform duration-spin ease-studio")}
        style={{ transform: `translateY(-${offset}px)` }}
        onTransitionEnd={(e) => {
          if (e.propertyName !== "transform") return;
          if (!spinning || rested.current) return;
          rested.current = true;
          setLanded(true);
          onRestRef.current?.();
        }}
      >
        {strip.map((name, i) => (
          <div
            key={`${name}-${i}`}
            ref={i === 0 ? rowRef : undefined}
            className="flex h-reel-item items-center justify-center gap-3 px-4"
          >
            {clubs && <Crest name={name} className="size-11 text-fg" />}
            {eras && <EraMark name={name} className="size-11 text-fg" />}
            <div className="min-w-0 text-center">
              <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{name}</p>
              {clubs && (
                <p className="mt-1 text-micro font-medium uppercase tracking-label text-subtle">{clubAbbr(name)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
