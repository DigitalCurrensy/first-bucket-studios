import type { ReactNode } from "react";
import { marksFor, type CrestOp } from "@/lib/crest-marks";
import { clubAbbr as clubCode, type Era } from "@/lib/nba";
import {
  initials,
  plateFor,
  plateForPlayer,
  plateCrop,
  cardSerial,
  nameParts,
  PLATES,
} from "@/lib/plates";
import { cn } from "@/lib/utils";

export {
  initials,
  plateFor,
  plateForPlayer,
  plateCrop,
  cardSerial,
  nameParts,
  PLATES,
};

function Mark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10 shrink-0", className)} aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const };

function opNode(op: CrestOp, i: number) {
  if (op.t === "rect") return <rect key={i} x={op.x} y={op.y} width={op.w} height={op.h} rx={op.rx} {...stroke} />;
  if (op.t === "circle") return <circle key={i} cx={op.cx} cy={op.cy} r={op.r} {...stroke} />;
  return <path key={i} d={op.d} {...stroke} />;
}

export function Crest({ name, className }: { name: string; className?: string }) {
  return <Mark className={className}>{marksFor(name).map(opNode)}</Mark>;
}

export function EraMark({ name, className }: { name: string; className?: string }) {
  switch (name as Era) {
    case "60s Celtic":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
          <path d="M14 20 H26 M20 14 V26" {...stroke} />
        </Mark>
      );
    case "Showtime":
      return (
        <Mark className={className}>
          <path d="M8 26 L20 8 L32 26" {...stroke} />
          <path d="M12 26 H28" {...stroke} />
        </Mark>
      );
    case "90s East":
      return (
        <Mark className={className}>
          <rect x="10" y="10" width="20" height="20" rx="2" {...stroke} />
        </Mark>
      );
    case "Twin Towers":
      return (
        <Mark className={className}>
          <rect x="8" y="10" width="8" height="20" {...stroke} />
          <rect x="24" y="10" width="8" height="20" {...stroke} />
        </Mark>
      );
    case "2000s":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
          <path d="M20 14 V26" {...stroke} />
        </Mark>
      );
    default:
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
          <path d="M14 20 H26" {...stroke} />
        </Mark>
      );
  }
}

export function LuckMark({ name, className }: { name: string; className?: string }) {
  return (
    <Mark className={className}>
      <circle cx="20" cy="20" r="10" {...stroke} />
      <path d={name === "Hot" ? "M14 20 H26" : name === "Thin" ? "M20 14 V26" : "M16 16 L24 24 M24 16 L16 24"} {...stroke} />
    </Mark>
  );
}

export function clubAbbr(name: string) {
  return clubCode(name);
}
