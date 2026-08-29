import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <div className="max-w-2xl">
      <PageIntro
        kicker="About"
        title="A studio, not a platform."
        lead="First Bucket Studio builds games and basketball tools with the same OS as a well-run design house: play something, share the card, read the brief, come back next week."
      />
      <div className="space-y-6 text-muted">
        <p>
          Basketball, not just the men’s league. Public figures in the games. Fictional cards on The Board until a
          consent row exists. Minors stay off the product until a parent or guardian signs.
        </p>
        <p>
          We are not a sportsbook. The pace board is editorial. We are not an NCAA determination. We are not a live
          recruiting service. We do not ship fake highlight tapes.
        </p>
        <p>
          First Bucket is a Digital Currensy house. Sister houses — THE HUB, Proseasons, Sideline, Brandular, NIL
          MIXTAPE, THE U as lighthouse — stay separate. They do not merge into this studio.
        </p>
        <p>
          The Tape is marks, not a book — not Top Shot, not Sorare, not a player-stock exchange. The Brief Desk is the
          weekly habit. The Slate is tonight. Trade Desk grades a deal. Keeper Desk is dynasty marks, not a league.
          16-0 is four playoff series, not a clamp. The formula is the center. The nights wander. Share the card. This
          is not 2K and not a sportsbook. Copy the issue or come back. Saves live on this device. No account. If you
          clear the browser, the streak goes with it.
        </p>
      </div>
    </div>
  );
}
