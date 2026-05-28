import {
  getMonthDays,
  getAllMonthsWithData,
  navigatePrevMonth,
  navigateNextMonth,
} from "@/lib/data";
import { avg, minutesToHm, sportLabel } from "@/lib/format";
import { DateNav } from "@/components/date-nav";
import { MonthHeatmap } from "@/components/month-heatmap";
import { SleepLegend } from "@/components/sleep-legend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMonthsWithData().map((ym) => {
    const [y, m] = ym.split("-");
    return { year: y, month: String(parseInt(m, 10)) };
  });
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const days = getMonthDays(y, m);
  const monthsWithData = new Set(getAllMonthsWithData());

  const label = new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const prev = navigatePrevMonth(y, m);
  const next = navigateNextMonth(y, m);
  const prevKey = `${prev.year}-${String(prev.month).padStart(2, "0")}`;
  const nextKey = `${next.year}-${String(next.month).padStart(2, "0")}`;

  const avgSleep = avg(days, (d) => d.sleep.score);
  // Only count nights that actually recorded sleep — "watch not worn" days store total_min: 0.
  const avgSleepMin = avg(days, (d) => (d.sleep.score === null ? null : d.sleep.total_min));
  const avgHrv = avg(days, (d) => d.hrv.last_night);
  const avgRhr = avg(days, (d) => d.daily.resting_hr);
  const avgStress = avg(days, (d) => d.daily.stress_avg);
  const avgReadiness = avg(days, (d) => d.training_readiness.score);
  const totalActivityMin = days.reduce(
    (a, d) => a + d.activities.reduce((s, x) => s + x.duration_min, 0),
    0,
  );
  // Sport totals: count + total duration_min per sport.
  const bySport = new Map<string, { count: number; mins: number }>();
  for (const d of days) {
    for (const a of d.activities) {
      const cur = bySport.get(a.sport) ?? { count: 0, mins: 0 };
      cur.count += 1;
      cur.mins += a.duration_min || 0;
      bySport.set(a.sport, cur);
    }
  }

  return (
    <div className="space-y-6">
      <DateNav
        label={label}
        prevHref={monthsWithData.has(prevKey) ? `/month/${prev.year}/${prev.month}` : null}
        nextHref={monthsWithData.has(nextKey) ? `/month/${next.year}/${next.month}` : null}
      />
      <h1 className="text-3xl font-bold tracking-tight">{label}</h1>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sleep calendar
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Each day shows <strong>sleep score</strong>, <strong>hours</strong>,{" "}
            <strong>HRV</strong>, <strong>RHR</strong> and <strong>finished work time</strong>. Tile
            colour grades the score. Tap a day for the full breakdown.
          </p>
        </CardHeader>
        <CardContent>
          <MonthHeatmap year={y} month={m} days={days} />
          <SleepLegend className="mt-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Daily averages this month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Avg sleep score" value={avgSleep} />
              <Row
                label="Avg sleep"
                value={avgSleepMin != null ? minutesToHm(avgSleepMin) : null}
              />
              <Row label="Avg HRV" value={avgHrv} />
              <Row label="Avg resting HR" value={avgRhr} />
              <Row label="Avg stress" value={avgStress} />
              <Row label="Avg readiness" value={avgReadiness} />
              <Row label="Days tracked" value={days.length} />
              <Row label="Total activity" value={minutesToHm(totalActivityMin)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activities by sport
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bySport.size === 0 ? (
                <p className="text-sm text-muted-foreground">None.</p>
              ) : (
                <>
                  <ul className="space-y-2 text-sm">
                    {Array.from(bySport.entries())
                      .sort((a, b) => b[1].mins - a[1].mins)
                      .map(([sport, { count, mins }]) => (
                        <li key={sport}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate font-medium">{sportLabel(sport)}</span>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {count} × {minutesToHm(mins)}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                  <div className="mt-3 flex items-baseline justify-between border-t pt-2 text-sm">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Total
                    </span>
                    <span className="font-bold tabular-nums">
                      {Array.from(bySport.values()).reduce((a, b) => a + b.count, 0)} sessions ·{" "}
                      {minutesToHm(Array.from(bySport.values()).reduce((a, b) => a + b.mins, 0))}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value ?? "—"}</span>
    </div>
  );
}
