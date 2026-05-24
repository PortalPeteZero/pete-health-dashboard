import {
  getDays,
  getEarliestDate,
  getLatestDate,
} from "@/lib/data";
import { avg, minutesToHm, sportLabel } from "@/lib/format";
import { TrendChart } from "@/components/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NinetyDayPage() {
  const days = getDays(getEarliestDate(), getLatestDate());
  const data = days.map((d) => ({
    date: d.date,
    sleep: d.sleep.score,
    hrv: d.hrv.last_night,
    readiness: d.training_readiness.score,
  }));

  const avgSleep = avg(days, (d) => d.sleep.score);
  const avgHrv = avg(days, (d) => d.hrv.last_night);
  const daysBelow65 = days.filter(
    (d) => d.sleep.score !== null && d.sleep.score < 65,
  ).length;

  let streak = 0;
  let longestStreak = 0;
  for (const d of days) {
    if (d.sleep.score !== null && d.sleep.score >= 75) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else if (d.sleep.score !== null) {
      streak = 0;
    }
  }

  const totalActivityMin = days.reduce(
    (a, d) => a + d.activities.reduce((s, x) => s + x.duration_min, 0),
    0,
  );
  const bySport = new Map<string, number>();
  for (const d of days)
    for (const a of d.activities) bySport.set(a.sport, (bySport.get(a.sport) ?? 0) + 1);
  const totalActivities = Array.from(bySport.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Last 90 days</h1>
      <p className="text-sm text-muted-foreground">
        {days.length} days tracked · {getEarliestDate()} → {getLatestDate()}
      </p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sleep · HRV · Readiness trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={data} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat value={avgSleep ?? "—"} label="avg sleep score" />
        <Stat value={avgHrv ?? "—"} label="avg HRV (ms)" />
        <Stat value={daysBelow65} label="days sleep < 65" />
        <Stat value={longestStreak} label="longest streak ≥ 75" />
        <Stat value={totalActivities} label="activities" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity ({minutesToHm(totalActivityMin)} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bySport.size === 0 ? (
            <p className="text-sm text-muted-foreground">No activities.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
              {Array.from(bySport.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([sport, n]) => (
                  <li key={sport} className="flex justify-between border-b py-1">
                    <span>{sportLabel(sport)}</span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
