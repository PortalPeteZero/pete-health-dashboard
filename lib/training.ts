// Training helpers — formatting, classification, weekly rollups.
// All client-safe (no Node-only imports) so components can use them directly.

import type {
  Activity,
  GarminDay,
  HRZones,
  TrainingBlock,
  WeeklyTrainingRollup,
} from "./types";

// --- Time formatting ---

/** 1826 sec -> "30:26"; 9294 -> "2:34:54". */
export function secondsToHms(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return "—";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** 7.22 (min/km) -> "7:13/km" (decimal-minute to MM:SS). */
export function paceMinKmHuman(pace: number | null | undefined): string {
  if (pace === null || pace === undefined) return "—";
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

/** 112.9 (sec/100m) -> "1:53/100m". */
export function pace100mHuman(pace: number | null | undefined): string {
  if (pace === null || pace === undefined) return "—";
  const m = Math.floor(pace / 60);
  const s = Math.round(pace % 60);
  return `${m}:${String(s).padStart(2, "0")}/100m`;
}

// --- Training status / ACWR classification ---

/** Garmin training-status enum 1-7 → background colour token (HSL tailwind). */
export function trainingStatusClasses(statusInt: number | null | undefined): string {
  switch (statusInt) {
    case 5: // PRODUCTIVE
    case 6: // PEAKING
      return "bg-emerald-500 text-white";
    case 4: // MAINTAINING
      return "bg-sky-500 text-white";
    case 7: // OVERREACHING
      return "bg-amber-500 text-white";
    case 1: // DETRAINING
    case 3: // UNPRODUCTIVE
      return "bg-red-500 text-white";
    case 2: // RECOVERY
      return "bg-violet-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Garmin ACWR status string → background colour token. */
export function acwrStatusClasses(status: string | null | undefined): string {
  switch ((status || "").toUpperCase()) {
    case "OPTIMAL":
      return "bg-emerald-500 text-white";
    case "MAINTAINING":
      return "bg-sky-500 text-white";
    case "LOW":
      return "bg-amber-500 text-white";
    case "HIGH":
      return "bg-red-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Humanise Garmin's enum-style feedback phrase: "MAINTAINING_AEROBIC_BASE_7" → "Maintaining Aerobic Base". */
export function humaniseFeedback(phrase: string | null | undefined): string {
  if (!phrase) return "";
  const cleaned = phrase
    .replace(/_\d+$/, "") // drop trailing variant index
    .toLowerCase()
    .replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// --- HR-zone helpers ---

/** Sum of all zone seconds. Useful for percentage calcs. */
export function hrZoneTotalSec(z: HRZones | null | undefined): number {
  if (!z) return 0;
  return (z.z1 || 0) + (z.z2 || 0) + (z.z3 || 0) + (z.z4 || 0) + (z.z5 || 0);
}

export function hrZonePercents(z: HRZones | null | undefined): {
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  z5: number;
} {
  const total = hrZoneTotalSec(z);
  if (!z || !total) return { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  return {
    z1: (z.z1 / total) * 100,
    z2: (z.z2 / total) * 100,
    z3: (z.z3 / total) * 100,
    z4: (z.z4 / total) * 100,
    z5: (z.z5 / total) * 100,
  };
}

/** Garmin's standard zone colours, light → heavy. */
export const HR_ZONE_COLOURS: Record<keyof HRZones, string> = {
  z1: "#9ca3af", // gray-400
  z2: "#3b82f6", // blue-500
  z3: "#10b981", // emerald-500
  z4: "#f59e0b", // amber-500
  z5: "#ef4444", // red-500
};

export const HR_ZONE_LABELS: Record<keyof HRZones, string> = {
  z1: "Z1 Warm-up",
  z2: "Z2 Easy",
  z3: "Z3 Aerobic",
  z4: "Z4 Threshold",
  z5: "Z5 Maximum",
};

// --- Weekly rollup (computed client-side from 7 daily JSONs) ---

export function computeWeeklyRollup(
  isoWeek: string,
  days: GarminDay[],
): WeeklyTrainingRollup {
  const durationBySport: Record<string, number> = {};
  const distanceBySport: Record<string, number> = {};
  const longestBySport: Record<string, number> = {};
  let totalLoad = 0;
  const zones: HRZones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  const aerobicBuckets: Record<string, number> = {};
  let modMin = 0;
  let vigMin = 0;
  const acwrs: number[] = [];
  const statusPhrases: string[] = [];
  let activityCount = 0;
  let daysWithData = 0;

  for (const d of days) {
    daysWithData++;
    const tr = d.training;
    if (tr?.acwr_ratio != null) acwrs.push(tr.acwr_ratio);
    if (tr?.status_phrase) statusPhrases.push(tr.status_phrase);
    for (const a of d.activities || []) {
      activityCount++;
      const sport = a.sport || "?";
      const durMin = a.duration_min || 0;
      const distKm = a.distance_km || 0;
      durationBySport[sport] = (durationBySport[sport] || 0) + durMin;
      distanceBySport[sport] = Math.round(((distanceBySport[sport] || 0) + distKm) * 100) / 100;
      if (durMin > (longestBySport[sport] || 0)) longestBySport[sport] = durMin;
      totalLoad += a.training_load || 0;
      if (a.hr_zones) {
        zones.z1 += a.hr_zones.z1 || 0;
        zones.z2 += a.hr_zones.z2 || 0;
        zones.z3 += a.hr_zones.z3 || 0;
        zones.z4 += a.hr_zones.z4 || 0;
        zones.z5 += a.hr_zones.z5 || 0;
      }
      const label = a.te_label;
      if (label) aerobicBuckets[label] = (aerobicBuckets[label] || 0) + 1;
      modMin += a.moderate_intensity_min || 0;
      vigMin += a.vigorous_intensity_min || 0;
    }
  }

  const zoneTotal = hrZoneTotalSec(zones);
  return {
    iso_week: isoWeek,
    days_with_data: daysWithData,
    activity_count: activityCount,
    duration_min_by_sport: durationBySport,
    distance_km_by_sport: distanceBySport,
    longest_session_min_by_sport: longestBySport,
    total_training_load: Math.round(totalLoad * 10) / 10,
    hr_time_by_zone: zones,
    z2_percent: zoneTotal ? Math.round((zones.z2 / zoneTotal) * 1000) / 10 : null,
    aerobic_effect_distribution: aerobicBuckets,
    intensity_min_moderate: modMin,
    intensity_min_vigorous: vigMin,
    acwr_avg: acwrs.length ? Math.round((acwrs.reduce((a, b) => a + b, 0) / acwrs.length) * 100) / 100 : null,
    acwr_count: acwrs.length,
    status_phrases: statusPhrases,
  };
}

/** Total training-load sum across an arbitrary day-list (for the 90-day sparkline). */
export function totalLoad(days: GarminDay[]): number {
  return days.reduce(
    (sum, d) =>
      sum + (d.activities || []).reduce((s: number, a: Activity) => s + (a.training_load || 0), 0),
    0,
  );
}

/** Map "AEROBIC_BASE" → "Aerobic base" for chip labels. */
export function teLabelHuman(label: string | null | undefined): string {
  if (!label) return "";
  return label.toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}
