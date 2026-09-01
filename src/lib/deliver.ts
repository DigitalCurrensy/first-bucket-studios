/** Hand a file to the user. The tray is the path that always works. */

export type ProofKind = "image" | "json" | "file";

export type Proof = {
  blob: Blob;
  name: string;
  caption?: string;
  href?: string;
  kind: ProofKind;
};

type Opener = (proof: Proof) => void;

let opener: Opener | null = null;

export function registerProofOpener(fn: Opener) {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

export function kindOf(blob: Blob, name: string): ProofKind {
  if (blob.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name)) return "image";
  if (blob.type.includes("json") || name.endsWith(".json")) return "json";
  return "file";
}

export function presentFile(blob: Blob, name: string, caption?: string, href?: string) {
  const proof: Proof = { blob, name, caption, href, kind: kindOf(blob, name) };
  if (opener) opener(proof);
  else tryDownload(blob, name);
  return proof;
}

export function objectUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

function typedBlob(blob: Blob, name: string) {
  if (blob.type && blob.type !== "application/octet-stream") return blob;
  const type = /\.png$/i.test(name)
    ? "image/png"
    : /\.jpe?g$/i.test(name)
      ? "image/jpeg"
      : blob.type || "application/octet-stream";
  return new Blob([blob], { type });
}

/** True only top-level. Cross-origin iframes block the picker. */
export function canUseSavePicker() {
  if (typeof window === "undefined") return false;
  const w = window as Window & { showSaveFilePicker?: unknown };
  if (typeof w.showSaveFilePicker !== "function") return false;
  try {
    if (window.self !== window.top) return false;
  } catch {
    return false;
  }
  return true;
}

export async function saveWithPicker(blob: Blob, name: string) {
  const w = window as unknown as Window & {
    showSaveFilePicker: (opts: {
      suggestedName?: string;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<{
      createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>;
    }>;
  };
  const typed = typedBlob(blob, name);
  const handle = await w.showSaveFilePicker({
    suggestedName: name,
    types: [{ description: "Card", accept: { "image/png": [".png"] } }],
  });
  const writable = await handle.createWritable();
  await writable.write(typed);
  await writable.close();
}

/**
 * Native download link. target=_blank so a blocked download opens the image
 * instead of navigating this frame (that was the broken-image page).
 */
export function tryDownload(blob: Blob, name: string) {
  const typed = typedBlob(blob, name);
  const url = objectUrl(typed);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.target = "_blank";
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

export async function saveBlob(blob: Blob, name: string) {
  if (canUseSavePicker()) {
    await saveWithPicker(blob, name);
    return "picked" as const;
  }
  tryDownload(blob, name);
  return "linked" as const;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

export async function copyImage(blob: Blob) {
  if (typeof ClipboardItem !== "function" || typeof navigator.clipboard?.write !== "function") return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
    return true;
  } catch {
    return false;
  }
}

/** File the sheet expects. Safari canShare({files}) rejects a Blob without a PNG type. */
export function asShareFile(blob: Blob, name: string) {
  const typed = blob.type && blob.type !== "application/octet-stream";
  const type = typed
    ? blob.type
    : /\.png$/i.test(name)
      ? "image/png"
      : /\.jpe?g$/i.test(name)
        ? "image/jpeg"
        : blob.type || "application/octet-stream";
  return new File([blob], name, { type });
}

/**
 * Native share is a top-level HTTPS sheet with a live user gesture.
 * Framed preview: skip it. Safari also rejects files+url.
 */
export function shareSheetOk() {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof window === "undefined") return false;
  if (window.isSecureContext === false) return false;
  try {
    if (window.self !== window.top) return false;
  } catch {
    return false;
  }
  return true;
}

function payloadCanShare(nav: Navigator & { canShare?: (data: ShareData) => boolean }, payload: ShareData) {
  if (typeof nav.canShare !== "function") return true;
  try {
    return nav.canShare(payload);
  } catch {
    return false;
  }
}

export async function nativeShare(blob: Blob, name: string, text?: string, url?: string) {
  if (!shareSheetOk()) return "none" as const;
  const file = asShareFile(blob, name);
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  for (const payload of shareAttempts(file, text, url)) {
    if (!payloadCanShare(nav, payload)) continue;
    try {
      await nav.share(payload);
      return "shared" as const;
    } catch (err) {
      const errName = err instanceof Error ? err.name : "";
      if (errName === "AbortError") return "abort" as const;
    }
  }
  return "none" as const;
}

/**
 * The card is the file. Files + caption, then files only.
 * Then text + url for apps (Discord, iMessage) that will not take a PNG.
 * Never files+url — Safari drops the sheet.
 */
export function shareAttempts(file: File, text?: string, url?: string): ShareData[] {
  const title = (text?.split(" at ")[0] || "First Bucket Studio").slice(0, 80);
  const files = [file];
  const attempts: ShareData[] = [{ title, text, files }];
  attempts.push({ title, files });
  const absolute = url && /^https?:\/\//i.test(url) ? url : "";
  if (absolute) {
    attempts.push({ title, text: text ? `${text}\n${absolute}` : absolute, url: absolute });
  }
  return attempts;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error ?? new Error("Couldn’t read the card"));
    reader.readAsDataURL(blob);
  });
}

/** Direct download. Data URL so iframe hosts that block blob: still get a file. */
export async function saveCardFile(blob: Blob, name: string) {
  const typed = typedBlob(blob, name);
  const href = await blobToDataUrl(typed);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return href;
}

function absoluteHttp(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : "";
}

/** X web intent. Image posts still need the PNG (Save), then attach. */
export function tweetIntent(text: string, url?: string) {
  const href = new URL("https://x.com/intent/tweet");
  const absolute = absoluteHttp(url);
  href.searchParams.set("text", text);
  if (absolute) href.searchParams.set("url", absolute);
  return href.toString();
}

export function threadsIntent(text: string, url?: string) {
  const href = new URL("https://www.threads.net/intent/post");
  const absolute = absoluteHttp(url);
  href.searchParams.set("text", absolute ? `${text}\n${absolute}` : text);
  return href.toString();
}

export function facebookIntent(url: string) {
  const href = new URL("https://www.facebook.com/sharer/sharer.php");
  const absolute = absoluteHttp(url);
  if (absolute) href.searchParams.set("u", absolute);
  return href.toString();
}

export function redditIntent(url: string, title: string) {
  const href = new URL("https://www.reddit.com/submit");
  const absolute = absoluteHttp(url);
  if (absolute) href.searchParams.set("url", absolute);
  if (title) href.searchParams.set("title", title);
  return href.toString();
}

export function discordCopy(text: string, url?: string) {
  const absolute = absoluteHttp(url);
  return absolute ? `${text}\n${absolute}` : text;
}
