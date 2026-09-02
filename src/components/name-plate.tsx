import { initials } from "@/lib/plates";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
} as const;

export function NamePlate({
  name,
  pos,
  era,
  id,
  size = "md",
  empty = false,
}: {
  name?: string;
  pos?: string;
  era?: string;
  id?: string;
  size?: keyof typeof SIZES;
  empty?: boolean;
}) {
  void era;
  void pos;
  void id;

  if (empty || !name) {
    return (
      <span
        className={cn(SIZES[size], "card-edge block shrink-0 rounded-sm bg-surface")}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={cn(
        "plate-letter card-edge relative grid shrink-0 place-items-center overflow-hidden rounded-sm bg-fg text-paper",
        SIZES[size],
      )}
      title={name}
    >
      <span className="relative">{initials(name)}</span>
    </span>
  );
}
