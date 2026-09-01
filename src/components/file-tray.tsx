import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  copyText,
  nativeShare,
  objectUrl,
  registerProofOpener,
  shareSheetOk,
  type Proof,
} from "@/lib/deliver";
import { ASPECTS, lastShareOpts, renderShareCard, type CardAspect } from "@/lib/share-card";
import { rememberWalk } from "@/lib/studio-save";
import { walkHref, walkIdFromHref } from "@/lib/walk";
import { useSpecular } from "@/lib/hooks";
import { toast } from "@/components/toast-host";
import { cn } from "@/lib/utils";

export function FileTrayHost() {
  const [proof, setProof] = useState<Proof | null>(null);

  useEffect(() => registerProofOpener(setProof), []);

  if (!proof) return null;
  return <FileTray proof={proof} onClose={() => setProof(null)} />;
}

function FileTray({ proof, onClose }: { proof: Proof; onClose: () => void }) {
  const titleId = useId();
  const field = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useSpecular(sheetRef);
  const [url, setUrl] = useState("");
  const [saveHref, setSaveHref] = useState("");
  const [preview, setPreview] = useState("");
  const [aspect, setAspect] = useState<CardAspect>("plate");
  const [sheet, setSheet] = useState(proof.blob);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const canShare = shareSheetOk();
  const walkId = proof.href ? walkIdFromHref(proof.href) : "";
  const walkPath = walkId ? walkHref(walkId) : proof.href || "";

  useEffect(() => {
    const next = objectUrl(proof.blob);
    setUrl(next);
    setSheet(proof.blob);
    if (proof.kind === "json" || proof.kind === "file") {
      void proof.blob.text().then((text) => setPreview(text.slice(0, 2400)));
    }
    if (walkId) rememberWalk(walkId);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => field.current?.select(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.setTimeout(() => URL.revokeObjectURL(next), 60_000);
    };
  }, [proof, onClose, walkId]);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setSaveHref(String(reader.result || ""));
    reader.readAsDataURL(sheet);
  }, [sheet]);

  const kb = Math.max(1, Math.round(sheet.size / 1024));
  const fileHref = saveHref || url;

  async function onCopyWalk() {
    if (!walkPath) return;
    const ok = await copyText(walkPath);
    setNote(ok ? "Walk copied." : "Select the walk and copy it.");
    if (ok) toast("Walk copied.");
    field.current?.select();
  }

  async function onAspect(next: CardAspect) {
    const last = lastShareOpts();
    if (!last || next === aspect || busy) return;
    setBusy(true);
    setAspect(next);
    try {
      const blob = await renderShareCard({ ...last, aspect: next });
      const fresh = objectUrl(blob);
      URL.revokeObjectURL(url);
      setUrl(fresh);
      setSheet(blob);
    } catch {
      toast("Couldn’t reframe the sheet.");
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    const result = await nativeShare(sheet, proof.name, proof.caption, walkPath);
    if (result === "shared") {
      setNote("Sent.");
      toast("Sent.");
      return;
    }
    if (result === "abort") return;
    await onCopyWalk();
  }

  function onOpenWalk() {
    if (!walkId) return;
    onClose();
    void navigate({ to: "/walk/$id", params: { id: walkId } });
  }

  return (
    <div
      className="glass-scrim fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-sheet relative max-h-[92dvh] w-full max-w-lg overflow-auto rounded-3xl p-4 text-fg sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grabber sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="v-tertiary text-micro font-medium uppercase tracking-label">The card</p>
            <h2 id={titleId} className="opsz-hero mt-1 font-display text-2xl font-semibold">
              Ready to send.
            </h2>
            <p className="v-secondary mt-1 text-sm">
              {proof.name} · {kb} KB
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center text-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        {proof.kind === "image" ? (
          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {ASPECTS.map((row) => (
              <button
                key={row.id}
                type="button"
                className={cn(
                  "rounded-full px-3 py-2 text-micro glass-control",
                  aspect === row.id && "bg-fg text-paper shadow-none",
                )}
                onClick={() => void onAspect(row.id)}
                disabled={busy}
              >
                {row.label}
              </button>
            ))}
          </div>
        ) : null}

        {proof.kind === "image" && url ? (
          <figure className="press-stage mt-4">
            <div className="press-trim">
              <span className="press-crop press-crop-tl" aria-hidden="true" />
              <span className="press-crop press-crop-tr" aria-hidden="true" />
              <span className="press-crop press-crop-bl" aria-hidden="true" />
              <span className="press-crop press-crop-br" aria-hidden="true" />
              <a href={fileHref} download={proof.name}>
                <img src={url} alt="The card" className="w-full max-h-[42dvh] rounded-md bg-night object-contain sm:max-h-none" />
              </a>
            </div>
          </figure>
        ) : null}

        {(proof.kind === "json" || proof.kind === "file") && preview ? (
          <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-paper p-3 font-mono text-micro text-fg/80">{preview}</pre>
        ) : null}

        {walkPath ? (
          <label className="mt-4 block">
            <span className="v-tertiary text-micro font-medium uppercase tracking-label">The walk</span>
            <input
              ref={field}
              readOnly
              value={walkPath}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-1 w-full min-h-11 rounded-md glass-control px-3 font-mono text-xs text-fg"
            />
          </label>
        ) : proof.caption ? (
          <p className="mt-4 text-sm text-fg">{proof.caption}</p>
        ) : null}

        {note ? <p className="mt-3 text-sm text-fg">{note}</p> : null}

        <div className="tray-actions mt-5">
          {fileHref ? (
            <a className="tray-btn tray-btn-primary" href={fileHref} download={proof.name}>
              Save the card
            </a>
          ) : (
            <span className="tray-btn tray-btn-primary opacity-40">Save the card</span>
          )}
          {walkPath ? (
            <button type="button" className="tray-btn tray-btn-primary" onClick={() => void onCopyWalk()}>
              Copy the walk
            </button>
          ) : null}
          {canShare ? (
            <button type="button" className="tray-btn" onClick={() => void onShare()}>
              Send
            </button>
          ) : null}
          {walkId ? (
            <button type="button" className="tray-btn" onClick={onOpenWalk}>
              Open the walk
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
