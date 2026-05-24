import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orDash, metresToKm } from "@/lib/format";
import type { GarminDay } from "@/lib/types";
import { Footprints, HeartPulse, Activity, Flame, Mountain, Gauge } from "lucide-react";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-lg font-semibold leading-tight tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function DailyStatsCard({ day }: { day: GarminDay }) {
  const d = day.daily;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Daily</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            icon={<Footprints className="h-4 w-4" />}
            label={d.step_goal ? `steps / ${d.step_goal.toLocaleString("en-GB")} goal` : "steps"}
            value={orDash(d.steps)}
          />
          <Stat icon={<HeartPulse className="h-4 w-4" />} label="resting HR" value={orDash(d.resting_hr)} />
          <Stat icon={<HeartPulse className="h-4 w-4" />} label="max HR" value={orDash(d.max_hr)} />
          <Stat icon={<Gauge className="h-4 w-4" />} label="avg stress" value={orDash(d.stress_avg)} />
          <Stat icon={<Mountain className="h-4 w-4" />} label="floors" value={orDash(d.floors)} />
          <Stat icon={<Activity className="h-4 w-4" />} label="distance" value={metresToKm(d.distance_m)} />
          <Stat
            icon={<Flame className="h-4 w-4" />}
            label="active kcal"
            value={orDash(d.active_kcal != null ? Math.round(d.active_kcal) : null)}
          />
          <Stat
            icon={<Flame className="h-4 w-4" />}
            label="total kcal"
            value={orDash(d.total_kcal != null ? Math.round(d.total_kcal) : null)}
          />
          {d.vo2_max != null && (
            <Stat icon={<Activity className="h-4 w-4" />} label="VO₂ max" value={orDash(d.vo2_max)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
