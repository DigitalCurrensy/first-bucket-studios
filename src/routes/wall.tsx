import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";
import { LithographLoader } from "@/components/lithograph-loader";
import { WalkCard } from "@/components/walk-card";
import { useMounted } from "@/lib/hooks";
import { loadSave } from "@/lib/studio-save";

export const Route = createFileRoute("/wall")({ component: WallPage });

function WallPage() {
  const mounted = useMounted();
  const save = mounted ? loadSave() : null;
  const local = Array.from(
    new Set([
      ...(save?.pins ?? []),
      ...(save?.walks ?? []),
      ...((save?.runs.map((r) => r.walk).filter(Boolean) as string[]) ?? []),
    ]),
  );

  return (
    <div>
      <PageIntro
        kicker="The Wall"
        title="Walks you send hang here."
        lead="Pin one to keep it on the rail. Nothing is pinned until you pin it."
        mark="wall"
      />

      {!mounted ? (
        <LithographLoader label="The wall is on press." />
      ) : local.length === 0 ? (
        <p className="max-w-md text-muted">Rip a pack. Send a card. It lands here.</p>
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
