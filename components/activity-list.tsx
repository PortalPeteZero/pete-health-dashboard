import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SportIcon } from "./sport-icon";
import { minutesToHm, sportLabel } from "@/lib/format";
import type { Activity } from "@/lib/types";

export function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activities{activities.length ? ` (${activities.length})` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        ) : (
          <ul className="divide-y">
            {activities.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <SportIcon sport={a.sport} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{a.name || sportLabel(a.sport)}</div>
                  <div className="text-xs text-muted-foreground">
                    {minutesToHm(a.duration_min)}
                    {a.distance_km ? ` · ${a.distance_km} km` : ""}
                    {a.avg_hr ? ` · ${a.avg_hr} bpm avg` : ""}
                    {a.calories ? ` · ${a.calories} kcal` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
