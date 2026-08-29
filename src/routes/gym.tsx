import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { downloadBlob, renderGymCard } from "@/lib/share-card";

export const Route = createFileRoute("/gym")({ component: GymPage });

function GymPage() {
  const [home, setHome] = useState("LAL");
  const [away, setAway] = useState("BOS");
  const [homeScore, setHomeScore] = useState("102");
  const [awayScore, setAwayScore] = useState("99");
  const [quarter, setQuarter] = useState("Q4");
  const [clock, setClock] = useState("2:14");
  const [name, setName] = useState("Sabrina Ionescu");
  const [role, setRole] = useState("Guard · First Bucket");
  const [saved, setSaved] = useState(false);

  async function exportPng() {
    const blob = await renderGymCard({ home, away, homeScore, awayScore, quarter, clock, name, role });
    downloadBlob(blob, "first-bucket-gym.png");
    setSaved(true);
  }

  return (
    <div>
      <PageIntro
        kicker="The Gym"
        title="Overlays you can actually use."
        lead="Scorebug and lower-third templates. They are not broadcasts, not highlight tapes, and they do not attach to live games."
      />

      <div className="mb-8">
        <Button onClick={exportPng}>{saved ? "Saved PNG" : "Export PNG"}</Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Scorebug</p>
          <div className="overflow-hidden rounded-xl bg-fg p-4 text-paper">
            <div className="flex items-center justify-between gap-4 font-display text-2xl font-semibold tabular-nums">
              <span>
                {home} <span className="ml-2">{homeScore}</span>
              </span>
              <span className="font-sans text-xs font-medium uppercase tracking-label text-paper/60">
                {quarter} · {clock}
              </span>
              <span>
                {awayScore} <span className="ml-2">{away}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Home" value={home} onChange={setHome} />
            <Field label="Home score" value={homeScore} onChange={setHomeScore} />
            <Field label="Quarter" value={quarter} onChange={setQuarter} />
            <Field label="Away" value={away} onChange={setAway} />
            <Field label="Away score" value={awayScore} onChange={setAwayScore} />
            <Field label="Clock" value={clock} onChange={setClock} />
          </div>
        </section>

        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Lower third</p>
          <div className="overflow-hidden rounded-xl bg-paper shadow-border">
            <div className="h-24 bg-fg/5" />
            <div className="border-t-2 border-fg px-5 py-4">
              <p className="font-display text-2xl font-semibold">{name || "Name"}</p>
              <p className="mt-1 text-sm text-muted">{role || "Role"}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Role" value={role} onChange={setRole} />
          </div>
        </section>
      </div>

      <section className="mt-12">
        <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">End of possession</p>
        <div className="flex flex-wrap gap-2 rounded-xl bg-fg px-4 py-3 text-paper">
          <Stat k="PTS" v="27" />
          <Stat k="REB" v="8" />
          <Stat k="AST" v="6" />
          <Stat k="3s" v="4" />
        </div>
        <p className="mt-4 max-w-xl text-sm text-subtle">
          Templates only. Do not present these as live league graphics or as an official box score.
        </p>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-11 w-full rounded-lg bg-paper px-3 text-sm text-fg shadow-border outline-none"
      />
    </label>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 px-2">
      <span className="text-micro uppercase tracking-label text-paper/50">{k}</span>
      <span className="font-display text-xl font-semibold tabular-nums">{v}</span>
    </span>
  );
}
