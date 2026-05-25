import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HRZoneBar } from "./hr-zone-bar";
import { sportLabel } from "@/lib/format";
import { teLabelHuman } from "@/lib/training";
import type { WeeklyTrainingRollup } from "@/lib/types";

interface Props {
  rollup: WeeklyTrainingRollup;
}

function mmToHm(min: number): string {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function WeeklyTrainingSection({ rollup }: Props) {
  if (rollup.activity_count === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Training</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activities this week.</p>
        </CardContent>
      </Card>
    );
  }

  const sports = Object.entries(rollup.duration_min_by_sport).sort(
    (a, b) => b[1] - a[1],
  );
  const teBuckets = Object.entries(rollup.aerobic_effect_distribution).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-baseline justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Training this week
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {rollup.activity_count} session{rollup.activity_count === 1 ? "" : "s"} ·
          load {rollup.total_training_load.toFixed(0)}
          {rollup.acwr_avg != null ? ` · ACWR ${rollup.acwr_avg.toFixed(1)}` : ""}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Heart-rate zones (week total)
            </p>
            <HRZoneBar zones={rollup.hr_time_by_zone} detailed />
            {rollup.z2_percent != null ? (
              <p className="mt-2 text-xs">
                <span className="font-semibold tabular-nums">{rollup.z2_percent.toFixed(0)}%</span>{" "}
                <span className="text-muted-foreground">
                  in Z2 (target ~70–80% during HIM base build)
                </span>
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                By sport
              </p>
              <ul className="space-y-1 text-xs">
                {sports.map(([sport, mins]) => (
                  <li key={sport} className="flex items-baseline justify-between">
                    <span>{sportLabel(sport)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {mmToHm(mins)}
                      {rollup.distance_km_by_sport[sport] ? ` · ${rollup.distance_km_by_sport[sport]} km` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {teBuckets.length > 0 ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Session focus
                </p>
                <ul className="flex flex-wrap gap-1 text-xs">
                  {teBuckets.map(([label, n]) => (
                    <li
                      key={label}
                      className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
                    >
                      {teLabelHuman(label)} × {n}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {rollup.intensity_min_moderate + rollup.intensity_min_vigorous > 0 ? (
              <div className="text-xs text-muted-foreground">
                Intensity:{" "}
                <span className="text-foreground">{rollup.intensity_min_moderate}</span> mod ·{" "}
                <span className="text-foreground">{rollup.intensity_min_vigorous}</span> vig
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
