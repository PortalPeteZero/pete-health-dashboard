import {
  getDays,
  getLatestDate,
  navigatePrev,
  getLatestWeekEntry,
} from "@/lib/data";
import { prettyDate } from "@/lib/format";
import { TrendChart } from "@/components/trend-chart";
import { ActivityList } from "@/components/activity-list";
import { MarkdownPanel } from "@/components/markdown-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function dateNDaysBefore(date: string, n: number): string {
  let cur = date;
  for (let i = 0; i < n; i++) {
    const prev = navigatePrev(cur);
    if (!prev) break;
    cur = prev;
  }
  return cur;
}

export default function CoachPage() {
  const latest = getLatestDate();

  const trendDays = getDays(dateNDaysBefore(latest, 30), latest);
  const trendData = trendDays.map((d) => ({
    date: d.date,
    sleep: d.sleep.score,
    hrv: d.hrv.last_night,
    readiness: d.training_readiness.score,
  }));

  const last14 = getDays(dateNDaysBefore(latest, 14), latest);
  const recentActivities = last14
    .flatMap((d) => d.activities)
    .slice()
    .reverse();

  const recentJournals = last14
    .filter((d) => d.journal)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  const weekly = getLatestWeekEntry();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coach view</h1>
        <p className="text-sm text-muted-foreground">
          A clean snapshot for Loren — sleep, HRV, readiness, training and reflections.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Last 30 days — sleep · HRV · readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trendData} />
        </CardContent>
      </Card>

      {weekly && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest weekly reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownPanel body={weekly.body} />
          </CardContent>
        </Card>
      )}

      <ActivityList activities={recentActivities} />

      {recentJournals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent journal entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentJournals.map((d) => (
              <div key={d.date}>
                <h3 className="mb-1 text-sm font-semibold">{prettyDate(d.date)}</h3>
                <MarkdownPanel body={d.journal!.body} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
