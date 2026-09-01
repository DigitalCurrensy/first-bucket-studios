import { createFileRoute, Link } from "@tanstack/react-router";
import { HowItWorks } from "@/components/how-it-works";
import { PageIntro } from "@/components/page-intro";
import { JobTicket } from "@/components/press-furniture";
import { ExportStudioButton, ImportStudioButton } from "@/components/studio-file";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <div className="max-w-3xl">
      <PageIntro
        kicker="About"
        title="A studio, not a book."
        lead="Rip the pack. Send the card. The walk is a URL."
        mark="about"
      />
      <HowItWorks kind="machine" />
      <JobTicket kicker="The desk" className="max-w-2xl">
        <div className="mt-3 space-y-5 text-muted">
          <p>
            One pack. Ten cards. Five names. Eighty-two nights. The plate is a PNG. The walk is a URL — anyone with it
            sees the same five and the same nights.
          </p>
          <p>Public names. Plates and initials, not likenesses. House crests, not league marks. Games and tools only.</p>
          <p>
            Walks live on this device. Pin the ones you want on the rail. Export the desk file if you want to move
            desks. No account.
          </p>
        </div>
      </JobTicket>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/games/82-0"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper transition-transform duration-150 ease-studio active:scale-press"
        >
          Rip the pack
        </Link>
        <ExportStudioButton />
        <ImportStudioButton />
      </div>
    </div>
  );
}
