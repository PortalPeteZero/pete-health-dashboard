import { format } from "date-fns";
import {
  getWeekDays,
  getWeekEntry,
  getAllWeeksWithData,
  getAllWeekEntries,
  isoWeekRange,
  isoWeekDateStrings,
  navigatePrevWeek,
  navigateNextWeek,
} from "@/lib/data";
import { avg, minutesToHm, sportLabel } from "@/lib/format";
import { computeWeeklyRollup } from "@/lib/training";
import { splitWeekEntry } from "@/lib/week-entry";
import { DateNav } from "@/components/date-nav";
import { DayTile } from "@/components/day-tile";
import { SleepLegend } from "@/components/sleep-legend";
import { MarkdownPanel } from "@/components/markdown-panel";
import { WeeklyTrainingSection } from "@/components/weekly-training-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamicParams = false;

export function generateStaticParams() {
  const weeks = new Set([...getAllWeeksWithData(), ...getAllWeekEntries()]);
  return Array.from(weeks).map((isoWeek) => ({ isoWeek }));
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ isoWeek: string }>;
}) {
  const { isoWeek } = await params;
  const { start, end } = isoWeekRange(isoWeek);
  const days = getWeekDays(isoWeek);
  const entry = getWeekEntry(isoWeek);
  const dateStrings = isoWeekDateStrings(isoWeek);
  const byDate = new Map(days.map((d) => [d.date, d]));

  const label = `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
  const weekNo = isoWeek.split("-W")[1];

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
  const totalSteps = days.reduce((a, d) => a + (d.daily.steps ?? 0), 0);

  const bySport = new Map<string, number>();
  for (const d of days)
    for (const a of d.activities)
      bySport.set(a.sport, (bySport.get(a.sport) ?? 0) + 1);

  // Week training rollup — computed live from the 7 daily JSONs.
  const trainingRollup = computeWeeklyRollup(isoWeek, days);

  // Plan vs Reflection split. Cadence: during the week the entry holds the plan.
  // End-of-week, Pete appends a `## Reflection` heading and writes the reflection
  // on the week just lived, then writes the plan for the next week in next week's entry.
  const { plan, reflection } = entry
    ? splitWeekEntry(entry.body)
    : { plan: null, reflection: null };

  const avgStats = [
    { label: "avg sleep score", value: avgSleep ?? "—" },
    { label: "avg sleep", value: avgSleepMin != null ? minutesToHm(avgSleepMin) : "—" },
    { label: "avg HRV", value: avgHrv ?? "—" },
    { label: "avg RHR", value: avgRhr ?? "—" },
    { label: "avg stress", value: avgStress ?? "—" },
    { label: "avg readiness", value: avgReadiness ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <DateNav
        label={label}
        prevHref={`/week/${navigatePrevWeek(isoWeek)}`}
        nextHref={`/week/${navigateNextWeek(isoWeek)}`}
      />
      <div>
        <h1 className="text-2xl font-bold">Week {weekNo}</h1>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>

      {/* Charts first — at-a-glance view of the week */}
      <WeeklyTrainingSection rollup={trainingRollup} />

      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {dateStrings.map((ds) => (
            <DayTile
              key={ds}
              day={byDate.get(ds) ?? null}
              weekday={new Date(ds + "T12:00:00").toLocaleDateString("en-GB", {
                weekday: "short",
              })}
              dayNum={ds.slice(-2)}
              date={ds}
            />
          ))}
        </div>
        <SleepLegend className="mt-3" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily averages this week
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {avgStats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-sm">
              <span className="font-semibold">{minutesToHm(totalActivityMin)}</span> total ·{" "}
              <span className="font-semibold">{totalSteps.toLocaleString("en-GB")}</span> steps
            </div>
            {bySport.size === 0 ? (
              <p className="text-sm text-muted-foreground">No activities.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {Array.from(bySport.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([sport, n]) => (
                    <li key={sport} className="flex justify-between">
                      <span>{sportLabel(sport)}</span>
                      <span className="tabular-nums text-muted-foreground">{n}</span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Write-up: Plan + Reflection. Plan is forward-looking, written at start of week.
          Reflection is backward-looking, written at end of week. */}
      {entry && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan for the week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownPanel body={plan ?? entry.body} />
          </CardContent>
        </Card>
      )}

      {entry && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reflection on the week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reflection ? (
              <MarkdownPanel body={reflection} />
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Reflection to be written at end of week. Add a{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">## Reflection</code>{" "}
                heading to this week&rsquo;s entry and the section will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
