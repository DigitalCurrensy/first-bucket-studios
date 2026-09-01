import { cn } from "@/lib/utils";

export function HouseMark({ className, label = "First Bucket Studio" }: { className?: string; label?: string }) {
  return (
    <img
      src="/mark.jpg"
      alt={label}
      className={cn("block rounded-lg bg-night object-cover outline outline-1 -outline-offset-1 outline-fg/10", className)}
    />
  );
}
