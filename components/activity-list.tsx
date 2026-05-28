import { Card, CardContent } from "@/components/ui/card";
import { SportIcon } from "./sport-icon";
import { minutesToHm, sportLabel } from "@/lib/format";
import { paceMinKmHuman, pace100mHuman } from "@/lib/training";
import type { Activity } from "@/lib/types";

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

const KIND_TINT: Record<SportKind, string> = {
  run: "bg-emerald-100 text-emerald-700",
  bike: "bg-sky-100 text-sky-700",
  swim: "bg-cyan-100 text-cyan-700",
  strength: "bg-orange-100 text-orange-700",
  walk: "bg-amber-100 text-amber-700",
  hike: "bg-lime-100 text-lime-700",
  other: "bg-slate-100 text-slate-700",
};

function leadStat(a: Activity, kind: SportKind): string | null {
  if (kind === "bike" && a.bike_power_avg_w) return `${Math.round(a.bike_power_avg_w)} W avg`;
  if (kind === "run" && a.pace_min_per_km != null) return paceMinKmHuman(a.pace_min_per_km);
  if (kind === "swim" && a.pace_sec_per_100m != null) return pace100mHuman(a.pace_sec_per_100m);
  return null;
}

export function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Activities
          </h2>
          {activities.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {activities.length} session{activities.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {activities.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No activities recorded.</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((a, i) => {
              const kind = kindOf(a.sport);
              const tint = KIND_TINT[kind];
              const lead = leadStat(a, kind);
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition hover:border-foreground/15 hover:shadow-sm"
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
                    <SportIcon sport={a.sport} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {a.name || sportLabel(a.sport)}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                      <span>{minutesToHm(a.duration_min)}</span>
                      {a.distance_km && <span>· {a.distance_km} km</span>}
                      {a.avg_hr && <span>· {a.avg_hr} avg HR</span>}
                      {a.calories && <span>· {a.calories} kcal</span>}
                    </div>
                  </div>
                  {lead && (
                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold tabular-nums">{lead}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {kind === "bike" ? "power" : "pace"}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
