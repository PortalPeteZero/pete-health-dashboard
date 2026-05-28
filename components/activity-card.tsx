import { Card, CardContent } from "@/components/ui/card";
import { SportIcon } from "./sport-icon";
import { TrainingEffectChips } from "./training-effect-chips";
import { HRZoneBar } from "./hr-zone-bar";
import { SplitsTable } from "./splits-table";
import { sportLabel, minutesToHm } from "@/lib/format";
import { paceMinKmHuman, pace100mHuman } from "@/lib/training";
import type { Activity } from "@/lib/types";

interface Props {
  activity: Activity;
}

type SportKind = "run" | "bike" | "swim" | "strength" | "walk" | "hike" | "other";

function kindOf(sport: string): SportKind {
  const s = (sport || "").toLowerCase();
  if (s.includes("swim")) return "swim";
  if (s.includes("bik") || s.includes("cycl") || s.includes("turbo")) return "bike";
  if (s.includes("run")) return "run";
  if (s.includes("walk")) return "walk";
  if (s.includes("hik")) return "hike";
  if (s.includes("strength") || s.includes("weight")) return "strength";
  return "other";
}

const KIND_TINT: Record<SportKind, { bar: string; chip: string; icon: string }> = {
  run: {
    bar: "from-emerald-500 to-emerald-600",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
  },
  bike: {
    bar: "from-sky-500 to-sky-600",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    icon: "bg-sky-100 text-sky-700",
  },
  swim: {
    bar: "from-cyan-500 to-teal-500",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    icon: "bg-cyan-100 text-cyan-700",
  },
  strength: {
    bar: "from-orange-500 to-rose-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-200",
    icon: "bg-orange-100 text-orange-700",
  },
  walk: {
    bar: "from-amber-400 to-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: "bg-amber-100 text-amber-700",
  },
  hike: {
    bar: "from-lime-500 to-emerald-600",
    chip: "bg-lime-50 text-lime-700 ring-lime-200",
    icon: "bg-lime-100 text-lime-700",
  },
  other: {
    bar: "from-slate-400 to-slate-500",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: "bg-slate-100 text-slate-700",
  },
};

/** "2026-05-25 07:59:27" → "07:59". */
function startTime(start: string | null): string {
  if (!start) return "";
  const t = start.split(" ")[1] || start.split("T")[1] || "";
  return t.slice(0, 5);
}

/** Sport-specific marquee stats (the second row, under the title). */
function sportMarquee(a: Activity, kind: SportKind): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];

  if (kind === "run" || kind === "walk" || kind === "hike") {
    if (a.pace_min_per_km != null) items.push({ label: "Pace", value: paceMinKmHuman(a.pace_min_per_km) });
    if (a.run_cadence_avg_spm != null) items.push({ label: "Cadence", value: `${Math.round(a.run_cadence_avg_spm)} spm` });
  } else if (kind === "swim") {
    if (a.pace_sec_per_100m != null) items.push({ label: "Pace", value: pace100mHuman(a.pace_sec_per_100m) });
    if (a.swim_avg_swolf != null) items.push({ label: "SWOLF", value: `${Math.round(a.swim_avg_swolf)}` });
    if (a.swim_fastest_100_sec != null) {
      const m = Math.floor(a.swim_fastest_100_sec / 60);
      const s = Math.round(a.swim_fastest_100_sec % 60);
      items.push({ label: "Best 100m", value: `${m}:${String(s).padStart(2, "0")}` });
    }
    if (a.swim_strokes != null) items.push({ label: "Strokes", value: `${a.swim_strokes}` });
  } else if (kind === "bike") {
    if (a.bike_power_avg_w != null) items.push({ label: "Avg power", value: `${Math.round(a.bike_power_avg_w)} W` });
    if (a.bike_power_max_w != null) items.push({ label: "Max power", value: `${Math.round(a.bike_power_max_w)} W` });
    if (a.bike_power_normalized_w != null) items.push({ label: "NP", value: `${Math.round(a.bike_power_normalized_w)} W` });
    if (a.bike_tss != null) items.push({ label: "TSS", value: `${Math.round(a.bike_tss)}` });
    if (a.bike_intensity_factor != null) items.push({ label: "IF", value: a.bike_intensity_factor.toFixed(2) });
  }
  return items;
}

export function ActivityCard({ activity: a }: Props) {
  const kind = kindOf(a.sport);
  const tint = KIND_TINT[kind];
  const marquee = sportMarquee(a, kind);
  const showSplits = a.splits && a.splits.length > 0 && kind !== "strength";

  return (
    <Card className="overflow-hidden">
      {/* Coloured top strip identifies the sport at a glance */}
      <div className={`h-1 bg-gradient-to-r ${tint.bar}`} />

      <CardContent className="space-y-4 p-4 sm:p-5">
        {/* Headline row */}
        <div className="flex items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint.icon}`}>
            <SportIcon sport={a.sport} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
              <h3 className="text-base font-bold leading-tight tracking-tight sm:text-lg">
                {a.name || sportLabel(a.sport)}
              </h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tint.chip}`}>
                {sportLabel(a.sport)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {startTime(a.start_local) && <>{startTime(a.start_local)} · </>}
              {minutesToHm(a.duration_min)}
              {a.distance_km ? ` · ${a.distance_km} km` : ""}
              {a.elevation_gain_m ? ` · ${a.elevation_gain_m} m ↑` : ""}
            </p>
          </div>
        </div>

        {/* Headline stats — big tabular numbers */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {a.avg_hr != null && (
            <HeadlineStat label="Avg HR" value={`${Math.round(a.avg_hr)}`} />
          )}
          {a.max_hr != null && (
            <HeadlineStat label="Max HR" value={`${Math.round(a.max_hr)}`} />
          )}
          {a.calories != null && (
            <HeadlineStat label="Calories" value={`${a.calories}`} />
          )}
          {a.training_load != null && (
            <HeadlineStat label="Load" value={a.training_load.toFixed(1)} />
          )}
        </div>

        {/* Sport-specific marquee row */}
        {marquee.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-4">
            {marquee.map((m) => (
              <div key={m.label}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
                <div className="text-sm font-bold tabular-nums">{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Training effect */}
        <TrainingEffectChips
          aerobic={a.aerobic_te}
          aerobicMsg={a.aerobic_te_msg}
          anaerobic={a.anaerobic_te}
          anaerobicMsg={a.anaerobic_te_msg}
          label={a.te_label}
        />

        {/* HR zones — hide for strength (no zones) and swim (HR strap often patchy) */}
        {kind !== "strength" && a.hr_zones && (
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Heart-rate zones
            </p>
            <HRZoneBar zones={a.hr_zones} detailed />
          </div>
        )}

        {/* Splits */}
        {showSplits ? (
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
              {a.splits!.length} split{a.splits!.length === 1 ? "" : "s"}
              <span className="ml-1 inline-block transition group-open:rotate-90">›</span>
            </summary>
            <div className="mt-2">
              <SplitsTable splits={a.splits} sport={a.sport} />
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums tracking-tight">{value}</div>
    </div>
  );
}
