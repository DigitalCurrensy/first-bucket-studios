import { createFileRoute, Link } from "@tanstack/react-router";
import { HowItWorks } from "@/components/how-it-works";
import { PageIntro } from "@/components/page-intro";
import { JobTicket } from "@/components/press-furniture";
import { ExportStudioButton, ImportStudioButton } from "@/components/studio-file";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · First Bucket Studio" },
      {
        name: "description",
        content: "Rip a basketball pack. Ten cards. Five names. Eighty-two nights. Save the plate. Share the walk.",
      },
      {
        name: "keywords",
        content:
          "basketball pack, NBA cards, WNBA cards, sports cards, holographic foil, pack opener, 82-0, first bucket studio, trading cards, basketball simulation",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="max-w-3xl">
      <PageIntro
        kicker="About"
        title="Rip. Send. The walk is a URL."
        lead="Ten cards. Five names. Eighty-two nights. Anyone with the walk sees the same five and the same nights."
        mark="about"
      />
      <HowItWorks kind="machine" />
      <JobTicket kicker="On this device" className="max-w-2xl">
        <div className="mt-3 space-y-5 text-muted">
          <p>Walks live here until you pin or send them. Export the desk to move it. Load a desk file to bring it back. No account.</p>
          <p>Public names. Plates and initials, not likenesses. House crests, not league marks. Games only.</p>
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
