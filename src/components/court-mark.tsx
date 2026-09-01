import { cn } from "@/lib/utils";

/** Geometric court. Not a photo. */
export function CourtMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 112" className={cn("pointer-events-none size-full", className)} aria-hidden="true">
      <rect x="6" y="6" width="68" height="100" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M6 56 H74" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="40" cy="56" r="11" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M24 6 V24 H56 V6" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M24 106 V88 H56 V106" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="40" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

/** Reverse of the plate. Gold court on carbon. */
export function CourtBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 112" className={cn("pointer-events-none size-full", className)} aria-hidden="true">
      <rect x="4" y="4" width="72" height="104" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 56 H76" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="40" cy="56" r="13" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M22 4 V28 H58 V4" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M22 108 V84 H58 V108" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="40" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="40" cy="84" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M40 4 V108 M4 28 H22 M58 28 H76 M4 84 H22 M58 84 H76" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

export function HoopMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("shrink-0", className)} aria-hidden="true">
      <circle cx="24" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 24 Q24 38 33 24" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M18 28 V40 M24 30 V42 M30 28 V40" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Currency-plate rosette. One ink. */
export function PlateRosette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("pointer-events-none", className)} aria-hidden="true">
      <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="40" cy="40" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <path
        d="M40 3 V12 M40 68 V77 M3 40 H12 M68 40 H77 M12 12 L18 18 M62 62 L68 68 M68 12 L62 18 M12 68 L18 62"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}
