import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  copyText,
  discordCopy,
  discordOpen,
  facebookIntent,
  instagramOpen,
  linkedinIntent,
  nativeShare,
  objectUrl,
  openTab,
  redditIntent,
  registerProofOpener,
  saveCardFile,
  shareSheetOk,
  snapchatOpen,
  telegramIntent,
  threadsIntent,
  tiktokOpen,
  tweetIntent,
  whatsappIntent,
  type Proof,
} from "@/lib/deliver";
import { ASPECTS, lastShareOpts, renderShareCard, type CardAspect } from "@/lib/share-card";
import { rememberWalk } from "@/lib/studio-save";
import { PinWalkButton } from "@/components/pin-walk-button";
import { markDemo } from "@/lib/demo-funnel";
import { publicWalkUrl, walkHref, walkIdFromHref } from "@/lib/walk";
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
  const [url, setUrl] = useState(() => objectUrl(proof.blob));
  const [saveHref, setSaveHref] = useState("");
  const [preview, setPreview] = useState("");
  const [aspect, setAspect] = useState<CardAspect>("plate");
  const [sheet, setSheet] = useState(proof.blob);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const canShare = shareSheetOk();
  const walkId = proof.href ? walkIdFromHref(proof.href) : "";
  const walkPath = walkId ? walkHref(walkId) : proof.href || "";
  const shareHref = walkId ? publicWalkUrl(walkId) : "";
  const postText = (proof.caption || "First Bucket Studio")
    .replace(/\shttps?:\/\/\S+$/, "")
    .replace(/\s\/walk\/\S+$/, "")
    .slice(0, 180);

  useEffect(() => {
    const next = objectUrl(proof.blob);
    setUrl((prev) => {
      if (prev && prev !== next) URL.revokeObjectURL(prev);
      return next;
    });
    setSheet(proof.blob);
    if (proof.kind === "json" || proof.kind === "file") {
      void proof.blob.text().then((text) => setPreview(text.slice(0, 2400)));
    }
    if (walkId) rememberWalk(walkId);
    markDemo("tray", proof.name);
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
    const copied = shareHref || walkPath;
    markDemo("copy", copied);
    const ok = await copyText(copied);
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
    const result = await nativeShare(sheet, proof.name, proof.caption, shareHref || undefined);
    if (result === "shared") {
      setNote("Shared.");
      markDemo("save", "share");
      return;
    }
    if (result === "abort") return;
    await onCopyWalk();
  }

  async function shareStory(app: "tiktok" | "snap" | "instagram") {
    markDemo("save", app);
    if (canShare) {
      const result = await nativeShare(sheet, proof.name, proof.caption, shareHref || undefined);
      if (result === "shared" || result === "abort") return;
    }
    if (proof.kind === "image" && aspect !== "story") await onAspect("story");
    try {
      await saveCardFile(sheet, proof.name.replace(/\.png$/i, "") + "-story.png");
      await copyText([postText, shareHref].filter(Boolean).join("\n"));
      const dest = app === "tiktok" ? tiktokOpen() : app === "snap" ? snapchatOpen() : instagramOpen();
      openTab(dest);
      setNote("Plate saved. Caption copied. Finish the post in the app.");
    } catch {
      setNote("Save the plate, then open the app.");
    }
  }

  async function onDiscord() {
    markDemo("save", "discord");
    if (canShare) {
      const result = await nativeShare(sheet, proof.name, proof.caption, shareHref || undefined);
      if (result === "shared" || result === "abort") return;
    }
    const ok = await copyText(discordCopy(postText, shareHref));
    openTab(discordOpen());
    setNote(ok ? "Copied. Paste it in Discord." : "Copy the walk, then paste in Discord.");
  }

  async function onCopyFile() {
    const text = await proof.blob.text();
    const ok = await copyText(text);
    setNote(ok ? "Desk JSON copied." : "Couldn’t copy.");
  }

  function onOpenWalk() {
    if (!walkId) return;
    markDemo("open", walkId);
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
            <p className="v-tertiary text-micro font-medium uppercase tracking-label">
              {proof.kind === "image" ? "The card" : "Desk file"}
            </p>
            <h2 id={titleId} className="opsz-hero mt-1 font-display text-2xl font-semibold">
              {proof.kind === "image" ? "Ready to send." : "Ready to move."}
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
              value={shareHref || walkPath}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-1 w-full min-h-11 rounded-md glass-control px-3 font-mono text-xs text-fg"
            />
          </label>
        ) : proof.caption ? (
          <p className="mt-4 text-sm text-fg">{proof.caption}</p>
        ) : null}

        {note ? <p className="mt-3 text-sm text-fg">{note}</p> : null}

        {proof.kind === "image" ? (
          <>
            <div className="tray-actions mt-5">
              {fileHref ? (
                <a
                  className="tray-btn tray-btn-primary"
                  href={fileHref}
                  download={proof.name}
                  onClick={() => markDemo("save", proof.name)}
                >
                  Save the card
                </a>
              ) : (
                <span className="tray-btn tray-btn-primary opacity-40">Save the card</span>
              )}
              <button type="button" className="tray-btn tray-btn-primary" onClick={() => void onShare()}>
                Share
              </button>
            </div>
            <p className="v-tertiary mt-5 text-micro font-medium uppercase tracking-label">Post</p>
            <div className="share-grid mt-2">
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={tweetIntent(postText, shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "x")}
                >
                  X
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={threadsIntent(postText, shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "threads")}
                >
                  Threads
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={redditIntent(shareHref, postText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "reddit")}
                >
                  Reddit
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={facebookIntent(shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "facebook")}
                >
                  Facebook
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={whatsappIntent(postText, shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "whatsapp")}
                >
                  WhatsApp
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={telegramIntent(postText, shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "telegram")}
                >
                  Telegram
                </a>
              ) : null}
              {shareHref ? (
                <a
                  className="tray-btn"
                  href={linkedinIntent(shareHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markDemo("save", "linkedin")}
                >
                  LinkedIn
                </a>
              ) : null}
              <button type="button" className="tray-btn" onClick={() => void onDiscord()}>
                Discord
              </button>
              <button type="button" className="tray-btn" onClick={() => void shareStory("tiktok")}>
                TikTok
              </button>
              <button type="button" className="tray-btn" onClick={() => void shareStory("snap")}>
                Snapchat
              </button>
              <button type="button" className="tray-btn" onClick={() => void shareStory("instagram")}>
                Instagram
              </button>
              {walkPath ? (
                <button type="button" className="tray-btn" onClick={() => void onCopyWalk()}>
                  Copy walk
                </button>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {walkId ? <PinWalkButton id={walkId} /> : null}
              {walkId ? (
                <button type="button" className="tray-btn" onClick={onOpenWalk}>
                  Open the walk
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="tray-actions mt-5">
            {fileHref ? (
              <a
                className="tray-btn tray-btn-primary"
                href={fileHref}
                download={proof.name}
                onClick={() => markDemo("save", proof.name)}
              >
                Save the file
              </a>
            ) : (
              <span className="tray-btn tray-btn-primary opacity-40">Save the file</span>
            )}
            <button type="button" className="tray-btn" onClick={() => void onCopyFile()}>
              Copy JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
