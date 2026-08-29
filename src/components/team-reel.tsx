import { useEffect, useMemo, useRef, useState } from "react";
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
  const [rowH, setRowH] = useState(72);
  const [offset, setOffset] = useState(0);
  const [armed, setArmed] = useState(false);
  const strip = useMemo(() => Array.from({ length: loops }, () => items).flat(), [items, loops]);
  const land = target ? items.indexOf(target as T) : 0;
  const endIndex = (loops - 1) * items.length + Math.max(0, land);

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    const h = node.offsetHeight;
    if (h > 0) setRowH(h);
  }, [items]);

  useEffect(() => {
    setArmed(false);
    setOffset(0);
  }, [items]);

  useEffect(() => {
    rested.current = false;
    if (!spinning || !target) return;
    setArmed(false);
    setOffset(0);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setArmed(true);
        setOffset(endIndex * Math.max(rowH, 1));
      });
    });
    const failsafe = window.setTimeout(() => {
      if (rested.current) return;
      rested.current = true;
      onRestRef.current?.();
    }, 2000);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(failsafe);
    };
  }, [spinning, target, endIndex, rowH]);

  return (
    <div
      className="relative h-reel-item overflow-hidden rounded-xl bg-paper shadow-border"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn("will-change-transform", armed && "transition-transform duration-spin ease-studio")}
        style={{ transform: `translateY(-${offset}px)` }}
        onTransitionEnd={(e) => {
          if (e.propertyName !== "transform") return;
          if (!spinning || rested.current) return;
          rested.current = true;
          onRestRef.current?.();
        }}
      >
        {strip.map((name, i) => (
          <div
            key={`${name}-${i}`}
            ref={i === 0 ? rowRef : undefined}
            className="flex h-reel-item items-center justify-center px-4 text-center font-display text-3xl font-semibold sm:text-4xl"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
