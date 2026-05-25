import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SportIcon } from "./sport-icon";
import { TrainingEffectChips } from "./training-effect-chips";
import { HRZoneBar } from "./hr-zone-bar";
import { SplitsTable } from "./splits-table";
import { sportLabel, minutesToHm } from "@/lib/format";
import { paceMinKmHuman, pace100mHuman, secondsToHms } from "@/lib/training";
import type { Activity } from "@/lib/types";

interface Props {
  activity: Activity;
}

/** Pretty start-time from "2026-05-25 07:59:27" → "07:59". */
function startTime(start: string | null): string {
  if (!start) return "";
  const t = start.split(" ")[1] || start.split("T")[1] || "";
  return t.slice(0, 5);
}

/** Sport-specific stats line under the headline. */
function SportSpecific({ activity }: { activity: Activity }) {
  const a = activity;
  const items: string[] = [];

  if (a.sport === "running") {
    if (a.pace_min_per_km != null) items.push(paceMinKmHuman(a.pace_min_per_km));
    if (a.run_cadence_avg_spm != null) items.push(`${Math.round(a.run_cadence_avg_spm)} spm`);
  } else if (a.sport.includes("swim")) {
    if (a.pace_sec_per_100m != null) items.push(pace100mHuman(a.pace_sec_per_100m));
    if (a.swim_avg_swolf != null) items.push(`SWOLF ${Math.round(a.swim_avg_swolf)}`);
    if (a.swim_fastest_100_sec != null) {
      const m = Math.floor(a.swim_fastest_100_sec / 60);
      const s = Math.round(a.swim_fastest_100_sec % 60);
      items.push(`Fastest 100m ${m}:${String(s).padStart(2, "0")}`);
    }
    if (a.swim_strokes != null) items.push(`${a.swim_strokes} strokes`);
  } else if (a.sport.includes("bik") || a.sport === "cycling") {
    if (a.bike_power_avg_w != null) items.push(`${Math.round(a.bike_power_avg_w)} W avg`);
    if (a.bike_power_normalized_w != null) items.push(`NP ${Math.round(a.bike_power_normalized_w)}`);
    if (a.bike_tss != null) items.push(`TSS ${Math.round(a.bike_tss)}`);
    if (a.bike_intensity_factor != null) items.push(`IF ${a.bike_intensity_factor.toFixed(2)}`);
  }

  if (items.length === 0) return null;
  return <p className="text-xs text-muted-foreground">{items.join(" · ")}</p>;
}

export function ActivityCard({ activity: a }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <SportIcon sport={a.sport} />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="truncate font-medium">{a.name || sportLabel(a.sport)}</span>
            <span className="text-xs text-muted-foreground">
              {startTime(a.start_local)} · {minutesToHm(a.duration_min)}
              {a.distance_km ? ` · ${a.distance_km} km` : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {a.avg_hr ? <span>{Math.round(a.avg_hr)} avg HR</span> : null}
            {a.max_hr ? <span>{Math.round(a.max_hr)} max HR</span> : null}
            {a.calories ? <span>{a.calories} kcal</span> : null}
            {a.training_load != null ? (
              <span>Load {a.training_load.toFixed(1)}</span>
            ) : null}
          </div>
          <SportSpecific activity={a} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TrainingEffectChips
          aerobic={a.aerobic_te}
          aerobicMsg={a.aerobic_te_msg}
          anaerobic={a.anaerobic_te}
          anaerobicMsg={a.anaerobic_te_msg}
          label={a.te_label}
        />
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Heart-rate zones
          </p>
          <HRZoneBar zones={a.hr_zones ?? null} detailed />
        </div>
        {a.splits && a.splits.length > 0 ? (
          <details>
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              {a.splits.length} split{a.splits.length === 1 ? "" : "s"}
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
