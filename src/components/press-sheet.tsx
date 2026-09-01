import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PressSheet({
  children,
  job,
  compact = false,
  className,
}: {
  children: ReactNode;
  job?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("press-sheet", compact && "press-sheet-compact", className)}>
      <div className="press-trim">
        <span className="press-crop press-crop-tl" aria-hidden="true" />
        <span className="press-crop press-crop-tr" aria-hidden="true" />
        <span className="press-crop press-crop-bl" aria-hidden="true" />
        <span className="press-crop press-crop-br" aria-hidden="true" />
        <span className="press-reg" aria-hidden="true" />
        <span className="press-ink" aria-hidden="true" />
        {children}
      </div>
      <figcaption className="press-slug">
        <span className="stock-name" />
        <span> · 5×7</span>
        {job ? <span> · {job}</span> : null}
      </figcaption>
    </figure>
  );
}
