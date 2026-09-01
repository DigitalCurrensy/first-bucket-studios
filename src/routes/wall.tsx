import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";
import { LithographLoader } from "@/components/lithograph-loader";
import { WalkCard } from "@/components/walk-card";
import { useMounted } from "@/lib/hooks";
import { HOUSE_WALK_ID } from "@/lib/house-pack";
import { loadSave } from "@/lib/studio-save";

export const Route = createFileRoute("/wall")({ component: WallPage });

function WallPage() {
  const mounted = useMounted();
  const save = mounted ? loadSave() : null;
  const local = Array.from(
    new Set([
      HOUSE_WALK_ID,
      ...(save?.walks ?? []),
      ...((save?.runs.map((r) => r.walk).filter(Boolean) as string[]) ?? []),
    ]),
  );

  return (
    <div>
      <PageIntro
        kicker="The Wall"
        title="The house card hangs here."
        lead="Thunder. 51–31. Walks you send sit under it."
        mark="wall"
      />

      {!mounted ? (
        <LithographLoader label="The wall is on press." />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {local.slice(0, 48).map((id) => (
            <li key={id}>
              <WalkCard id={id} />
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/games/82-0"
        className="mt-10 inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper transition-transform duration-150 ease-studio active:scale-press"
      >
        Rip the pack
      </Link>
    </div>
  );
}