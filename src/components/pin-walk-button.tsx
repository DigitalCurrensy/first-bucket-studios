import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isPinned, onSaveChange, togglePin } from "@/lib/studio-save";

export function PinWalkButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isPinned(id));
    sync();
    return onSaveChange(sync);
  }, [id]);

  if (!id) return null;

  return (
    <Button variant={on ? "bronze" : "ghost"} onClick={() => togglePin(id)}>
      {on ? "Pinned" : "Pin this walk"}
    </Button>
  );
}
