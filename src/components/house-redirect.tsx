import { Navigate } from "@tanstack/react-router";

/** Landmine desks dump into the staged room. One pack. Rip. Send. */
export function HouseRedirect() {
  return <Navigate to="/games/82-0" replace />;
}
