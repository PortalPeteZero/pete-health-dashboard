import Link from "next/link";
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
import { avg, minutesToHm, sleepScoreColor, sportLabel } from "@/lib/format";
import { DateNav } from "@/components/date-nav";
import { MarkdownPanel } from "@/components/markdown-panel";
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
  const avgHrv = avg(days, (d) => d.hrv.last_night);
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

      {entry && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownPanel body={entry.body} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-7 gap-2">
        {dateStrings.map((ds) => {
          const d = byDate.get(ds);
          const dow = new Date(ds + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "short",
          });
          const dayNum = ds.slice(-2);
          if (!d) {
            return (
              <div
                key={ds}
                className="flex flex-col items-center rounded-lg border border-dashed p-2 text-center"
              >
                <span className="text-xs text-muted-foreground">{dow}</span>
                <span className="text-xs text-muted-foreground">{dayNum}</span>
                <span className="mt-2 text-xs text-muted-foreground">—</span>
              </div>
            );
          }
          return (
            <Link
              key={ds}
              href={`/day/${ds}`}
              className="flex flex-col items-center rounded-lg border p-2 text-center transition-colors hover:bg-accent"
            >
              <span className="text-xs text-muted-foreground">{dow}</span>
              <span className="text-xs text-muted-foreground">{dayNum}</span>
              <span
                className="mt-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: sleepScoreColor(d.sleep.score) }}
              >
                {d.sleep.score ?? "–"}
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">
                {d.activities.length ? `${d.activities.length} act` : ""}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Week averages
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold tabular-nums">{avgSleep ?? "—"}</div>
              <div className="text-xs text-muted-foreground">avg sleep</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">{avgHrv ?? "—"}</div>
              <div className="text-xs text-muted-foreground">avg HRV</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">{avgReadiness ?? "—"}</div>
              <div className="text-xs text-muted-foreground">avg readiness</div>
            </div>
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
    </div>
  );
}
