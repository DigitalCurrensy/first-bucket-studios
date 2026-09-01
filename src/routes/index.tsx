import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LastWalkSlip, PackHero, PressStage, StepRail } from "@/components/press-furniture";
import { markDemo } from "@/lib/demo-funnel";
import { useMounted } from "@/lib/hooks";
import { PLAYERS_BY_ID } from "@/lib/nba";
import { formatRun, loadSave } from "@/lib/studio-save";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rip the pack. Send the card. · First Bucket Studio" },
      { name: "description", content: "Tear the foil. A franchise lands. Five names. The card is yours." },
      {
        name: "keywords",
        content:
          "basketball pack, NBA cards, WNBA, sports cards, holographic foil, pack opener, 82-0, first bucket, trading cards, basketball game",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const mounted = useMounted();
  const save = mounted ? loadSave() : null;
  const latest = save?.runs[0];
  const latestNames = latest?.roster.map((id) => PLAYERS_BY_ID[id]?.name).filter(Boolean) ?? [];

  useEffect(() => {
    markDemo("home");
  }, []);

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <PressStage pad="hero" slug="First Bucket Studio · Prospect pack">
          <p className="v-tertiary text-micro font-medium uppercase tracking-label">Prospect pack</p>
          <h1 className="opsz-hero mt-3 max-w-xl text-4xl font-semibold sm:text-5xl">Rip the pack. Send the card.</h1>
          <div className="hero-rule" />
          <p className="max-w-md text-muted">
            Tear the foil. A franchise lands. Ten cards. Five names. Eighty-two nights. No two walks match.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/games/82-0"
              onClick={() => markDemo("rip")}
              className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper transition-transform duration-150 ease-studio active:scale-press"
            >
              Rip the pack
            </Link>
            <Link to="/wall" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
              The Wall
            </Link>
          </div>
        </PressStage>
        <PackHero />
      </div>

      <StepRail current={1} />

      {latest ? (
        <LastWalkSlip
          team={latest.team}
          line={formatRun(latest)}
          names={latestNames}
          walk={latest.walk}
        />
      ) : null}
    </div>
  );
}
