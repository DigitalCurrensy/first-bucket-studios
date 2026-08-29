/** 2026-27 regular season opens October 20. */
export const TIP_OFF = { year: 2026, month: 9, day: 20 };

export function daysUntilTip(from = new Date()) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(TIP_OFF.year, TIP_OFF.month, TIP_OFF.day);
  return Math.round((b - a) / 86_400_000);
}

export function seasonLine(from = new Date()) {
  const days = daysUntilTip(from);
  if (days > 1) return `${days} days until tip-off`;
  if (days === 1) return "Tip-off is tomorrow";
  if (days === 0) return "Tip-off is tonight";
  return "Regular season";
}

export function shortDate(from = new Date()) {
  return from.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
