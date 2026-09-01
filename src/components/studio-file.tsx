import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyStudioJson, downloadStudioFile, importStudio } from "@/lib/studio-save";

export function ExportStudioButton({
  variant = "ghost",
  loud = false,
}: {
  variant?: "primary" | "ghost";
  loud?: boolean;
}) {
  const [note, setNote] = useState("");
  const tone = loud ? "primary" : variant;
  return (
    <>
      <Button
        variant={tone === "ghost" ? "ghost" : "primary"}
        onClick={() => {
          downloadStudioFile();
          setNote("Studio file saved.");
        }}
      >
        {note || (loud ? "Export the file" : "Export studio")}
      </Button>
    </>
  );
}

export function CopyStudioButton() {
  const [note, setNote] = useState("");
  return (
    <Button
      variant="ghost"
      onClick={() => {
        void copyStudioJson()
          .then(() => setNote("Studio JSON copied."))
          .catch(() => setNote("Couldn’t copy."));
      }}
    >
      {note || "Copy studio JSON"}
    </Button>
  );
}

export function ImportStudioButton({ onLoaded }: { onLoaded?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  return (
    <>
      <Button variant="ghost" onClick={() => fileRef.current?.click()}>
        {note || "Import studio"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        suppressHydrationWarning
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void file.text().then((text) => {
            try {
              importStudio(text);
              setNote("Studio file loaded.");
              onLoaded?.();
            } catch {
              setNote("Not a studio file.");
            }
          });
        }}
      />
    </>
  );
}