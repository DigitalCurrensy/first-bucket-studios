import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepKicker } from "@/components/game-bar";
import { TeamReel } from "@/components/team-reel";
import { LUCKS, luckLine, type Luck } from "@/lib/luck";
import { ERAS, FRANCHISES, hashSeed, mulberry32, pickIndex, type Era, type Franchise } from "@/lib/nba";

export function RoomSpin({
  locked,
  auto = false,
  onReady,
}: {
  locked?: { team: Franchise; era: Era; luck?: Luck };
  auto?: boolean;
  onReady: (team: Franchise, era: Era, luck: Luck) => void;
}) {
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [luck, setLuck] = useState<Luck | "">("");
  const [spinTeam, setSpinTeam] = useState(false);
  const [spinEra, setSpinEra] = useState(false);
  const [spinLuck, setSpinLuck] = useState(false);
  const [ready, setReady] = useState(false);
  const booted = useRef(false);
  const handed = useRef(false);
  const spinning = spinTeam || spinEra || spinLuck;

  const restTeam = useCallback(() => setSpinTeam(false), []);
  const restEra = useCallback(() => setSpinEra(false), []);
  const restLuck = useCallback(() => setSpinLuck(false), []);

  function pull() {
    if (spinning) return;
    const rng = mulberry32(hashSeed(`pull:${Date.now()}`));
    setReady(false);
    setTeam(locked?.team ?? pickIndex(rng, FRANCHISES));
    setEra(locked?.era ?? pickIndex(rng, ERAS));
    setLuck(locked?.luck ?? pickIndex(rng, LUCKS));
    setSpinTeam(true);
    window.setTimeout(() => setSpinEra(true), 90);
    window.setTimeout(() => setSpinLuck(true), 180);
  }

  useEffect(() => {
    if (!auto || booted.current) return;
    booted.current = true;
    const rng = mulberry32(hashSeed(`pull:${Date.now()}`));
    setTeam(locked?.team ?? pickIndex(rng, FRANCHISES));
    setEra(locked?.era ?? pickIndex(rng, ERAS));
    setLuck(locked?.luck ?? pickIndex(rng, LUCKS));
    setSpinTeam(true);
    const a = window.setTimeout(() => setSpinEra(true), 90);
    const b = window.setTimeout(() => setSpinLuck(true), 180);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [auto, locked]);

  useEffect(() => {
    if (spinning || !team || !era || !luck) return;
    setReady(true);
  }, [spinning, team, era, luck]);

  useEffect(() => {
    if (!auto || !ready || !team || !era || !luck || handed.current) return;
    handed.current = true;
    const id = window.setTimeout(() => onReady(team, era, luck), 400);
    return () => window.clearTimeout(id);
  }, [auto, ready, team, era, luck, onReady]);

  const kicker = spinning
    ? "The machine is live."
    : ready && team && era && luck
      ? `${team} · ${era} · ${luck}. ${luckLine(luck)}`
      : "One pull. Three strips. Who lands is the room.";

  return (
    <section>
      <StepKicker n={1} label="Pull" hint={kicker} className="mb-4" />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">Franchise</p>
          <TeamReel items={FRANCHISES} target={team} spinning={spinTeam} compact onRest={restTeam} />
        </div>
        <div>
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">Era</p>
          <TeamReel
            items={ERAS}
            target={era}
            spinning={spinEra}
            compact
            durationClass="duration-spin-era"
            onRest={restEra}
          />
        </div>
        <div>
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">Luck</p>
          <TeamReel
            items={LUCKS}
            target={luck}
            spinning={spinLuck}
            compact
            durationClass="duration-spin-luck"
            onRest={restLuck}
          />
        </div>
      </div>
      {!auto && (
        <div className="mt-6 flex flex-wrap gap-2">
          {!ready && (
            <Button onClick={pull} disabled={spinning}>
              {spinning ? "Pulling…" : team ? "Pull again" : "Pull"}
            </Button>
          )}
          {ready && team && era && luck && (
            <>
              <Button onClick={() => onReady(team, era, luck)}>Rip the pack</Button>
              {!locked && (
                <Button variant="ghost" onClick={pull}>
                  Pull again
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
