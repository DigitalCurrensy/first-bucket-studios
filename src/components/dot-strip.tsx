import { cn } from "@/lib/utils";

export function DotStrip({
  nights,
  className,
  tone = "paper",
  marks = "dots",
  active,
  onPick,
}: {
  nights: { win: boolean }[];
  className?: string;
  tone?: "paper" | "ink" | "card";
  marks?: "dots" | "ticks";
  active?: number;
  onPick?: (i: number) => void;
}) {
  if (nights.length === 0) return null;
  const tick = marks === "ticks";
  return (
    <ol className={cn("grid grid-cols-dots gap-1", tick && "gap-[3px]", className)} aria-label="Season line">
      {nights.map((night, i) => {
        const fill = night.win
          ? tone === "ink"
            ? "bg-good"
            : tone === "card"
              ? "bg-ink"
              : "bg-paper"
          : tone === "ink"
            ? "bg-line"
            : tone === "card"
              ? "bg-ink/25"
              : "bg-paper/25";
        const shape = tick ? "block aspect-square rounded-[1px]" : "block aspect-square rounded-full";
        return (
          <li key={i}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-label={`Game ${i + 1}`}
                aria-current={active === i}
                className={cn(
                  "aspect-square w-full",
                  tick ? "rounded-[1px]" : "rounded-full",
                  fill,
                  active === i && "ring-2 ring-accent ring-offset-1 ring-offset-fg",
                )}
              />
            ) : (
              <span className={cn(shape, fill)} />
            )}
          </li>
        );
      })}
    </ol>
  );
}