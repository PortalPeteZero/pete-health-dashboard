import type { GarminDay } from "./types";

/** 499 -> "8h 19m"; 45 -> "45m"; null -> "—". */
export function minutesToHm(min: number | null | undefined): string {
  if (min === null || min === undefined) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function metresToKm(m: number | null | undefined): string {
  if (m === null || m === undefined) return "—";
  return `${(m / 1000).toFixed(2)} km`;
}

export function orDash(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return typeof v === "number" ? v.toLocaleString("en-GB") : v;
}

/** Tailwind classes for a sleep / generic 0-100 score qualifier. */
export function qualifierClasses(qualifier: string | null | undefined): string {
  switch ((qualifier || "").toUpperCase()) {
    case "EXCELLENT":
      return "bg-emerald-600 text-white";
    case "GOOD":
      return "bg-green-500 text-white";
    case "FAIR":
      return "bg-amber-500 text-white";
    case "POOR":
      return "bg-red-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Score -> qualifier word (Garmin sleep banding) when the API didn't give one. */
export function scoreToQualifier(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "GOOD";
  if (score >= 60) return "FAIR";
  return "POOR";
}

export function hrvStatusClasses(status: string | null | undefined): string {
  switch ((status || "").toUpperCase()) {
    case "BALANCED":
      return "bg-green-500 text-white";
    case "UNBALANCED":
      return "bg-amber-500 text-white";
    case "LOW":
    case "POOR":
      return "bg-red-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function readinessClasses(level: string | null | undefined): string {
  switch ((level || "").toUpperCase()) {
    case "MAXIMUM":
    case "HIGH":
      return "text-emerald-600";
    case "MODERATE":
      return "text-amber-500";
    case "LOW":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

/** Hex colour for a sleep score, used by the month heatmap. */
export function sleepScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "var(--muted)";
  if (score >= 80) return "#16a34a"; // green-600
  if (score >= 65) return "#84cc16"; // lime-500
  if (score >= 50) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

/** Pretty "Saturday 23 May 2026" from "2026-05-23". */
export function prettyDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Garmin sport key -> human label. */
export function sportLabel(sport: string): string {
  return sport
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Average a numeric metric across days, ignoring nulls. */
export function avg(days: GarminDay[], pick: (d: GarminDay) => number | null | undefined): number | null {
  const vals = days.map(pick).filter((v): v is number => v !== null && v !== undefined);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
