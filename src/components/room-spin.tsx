import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamReel } from "@/components/team-reel";
import { ERAS, FRANCHISES, hashSeed, mulberry32, pickIndex, type Era, type Franchise } from "@/lib/nba";

type Phase = "team" | "era" | "ready";

export function RoomSpin({
  locked,
  auto = false,
  onReady,
}: {
  locked?: { team: Franchise; era: Era };
  auto?: boolean;
  onReady: (team: Franchise, era: Era) => void;
}) {
  const [phase, setPhase] = useState<Phase>("team");
  const [team, setTeam] = useState<Franchise | "">(locked?.team ?? "");
  const [era, setEra] = useState<Era | "">(locked?.era ?? "");
  const [spinning, setSpinning] = useState(false);
  const booted = useRef(false);
  const handed = useRef(false);

  function spinTeam() {
    if (spinning) return;
    const next = locked?.team ?? pickIndex(mulberry32(hashSeed(`team:${Date.now()}`)), FRANCHISES);
    setTeam(next);
    setEra("");
    setPhase("team");
    setSpinning(true);
  }

  function spinEra() {
    if (spinning || !team) return;
    const next = locked?.era ?? pickIndex(mulberry32(hashSeed(`era:${team}:${Date.now()}`)), ERAS);
    setEra(next);
    setPhase("era");
    setSpinning(true);
  }

  function rest() {
    setSpinning(false);
    setPhase((cur) => (cur === "team" ? "era" : cur === "era" ? "ready" : cur));
  }

  useEffect(() => {
    if (!auto || booted.current) return;
    booted.current = true;
    const next = locked?.team ?? pickIndex(mulberry32(hashSeed(`team:${Date.now()}`)), FRANCHISES);
    setTeam(next);
    setPhase("team");
    setSpinning(true);
  }, [auto, locked]);

  useEffect(() => {
    if (!auto || spinning || phase !== "era" || era) return;
    const id = window.setTimeout(() => {
      const next = locked?.era ?? pickIndex(mulberry32(hashSeed(`era:${team}:${Date.now()}`)), ERAS);
      setEra(next);
      setSpinning(true);
    }, 280);
    return () => window.clearTimeout(id);
  }, [auto, spinning, phase, era, locked, team]);

  useEffect(() => {
    if (!auto || phase !== "ready" || !team || !era || handed.current) return;
    handed.current = true;
    const id = window.setTimeout(() => onReady(team, era), 400);
    return () => window.clearTimeout(id);
  }, [auto, phase, team, era, onReady]);

  const showEra = Boolean(era) && (phase === "era" || phase === "ready");
  const items = showEra ? ERAS : FRANCHISES;
  const target = showEra ? era : team;
  const kicker = spinning
    ? showEra
      ? "Spinning the era…"
      : "Spinning the room…"
    : phase === "ready"
      ? `${team} · ${era}`
      : phase === "era"
        ? `${team} landed. Spin the era.`
        : "The room moves. You draft who lands.";

  return (
    <section>
      <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">01 · Spin</p>
      <p className="mb-4 text-sm text-muted">{kicker}</p>
      <TeamReel items={items} target={target} spinning={spinning} onRest={rest} />
      {!auto && (
        <div className="mt-6 flex flex-wrap gap-2">
          {phase === "team" && !spinning && (
            <Button onClick={spinTeam}>{team ? "Respin the room" : "Spin the room"}</Button>
          )}
          {phase === "era" && !spinning && (
            <>
              <Button onClick={spinEra}>Spin the era</Button>
              {!locked && (
                <Button variant="ghost" onClick={spinTeam}>
                  Respin the room
                </Button>
              )}
            </>
          )}
          {phase === "ready" && team && era && (
            <>
              <Button onClick={() => onReady(team, era)}>Draft five</Button>
              {!locked && (
                <Button variant="ghost" onClick={spinTeam}>
                  Spin again
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
