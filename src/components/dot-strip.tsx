import { cn } from "@/lib/utils";

export function DotStrip({
  nights,
  className,
  tone = "paper",
}: {
  nights: { win: boolean }[];
  className?: string;
  tone?: "paper" | "ink";
}) {
  if (nights.length === 0) return null;
  return (
    <ol className={cn("grid grid-cols-dots gap-1", className)} aria-label="Season line">
      {nights.map((night, i) => (
        <li
          key={i}
          className={cn(
            "aspect-square rounded-full",
            night.win
              ? tone === "ink"
                ? "bg-good"
                : "bg-paper"
              : tone === "ink"
                ? "bg-line"
                : "bg-paper/25",
          )}
        />
      ))}
    </ol>
  );
}
