import { notFound } from "next/navigation";
import {
  getDay,
  getDays,
  getAllDates,
  navigatePrev,
  navigateNext,
} from "@/lib/data";
import { prettyDate } from "@/lib/format";
import { DateNav } from "@/components/date-nav";
import { ActivityCard } from "@/components/activity-card";
import { TrainingStatusCard } from "@/components/training-status-card";
import { AcwrGauge } from "@/components/acwr-gauge";
import { Vo2Sparkline } from "@/components/vo2-sparkline";
import { RacePredictionsCard } from "@/components/race-predictions-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

function shortLabel(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const day = getDay(date);
  if (!day) notFound();

  const prev = navigatePrev(date);
  const next = navigateNext(date);
  const options = getAllDates()
    .slice()
    .reverse()
    .map((d) => ({ value: d, label: shortLabel(d), href: `/training/${d}` }));

  // VO2 series — collect the last 90 days' vo2_max from the training block.
  // Note: Garmin only re-computes VO2 occasionally (every couple of weeks),
  // so most days carry the same number — we plot the unique-changes curve.
  const allDates = getAllDates();
  const idx = allDates.indexOf(date);
  const window = allDates.slice(Math.max(0, idx - 89), idx + 1);
  const vo2Series = getDays(window[0], window[window.length - 1])
    .map((d) => ({ date: d.date, vo2: d.training?.vo2_max ?? null }))
    .filter((p) => p.vo2 !== null) as Array<{ date: string; vo2: number }>;

  const training = day.training;
  const activities = day.activities || [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{prettyDate(date)}</h1>
        <p className="text-sm text-muted-foreground">Training</p>
      </header>

      <DateNav
        label={shortLabel(date)}
        prevHref={prev ? `/training/${prev}` : null}
        nextHref={next ? `/training/${next}` : null}
        options={options}
        currentValue={date}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TrainingStatusCard training={training} />
        <AcwrGauge
          ratio={training?.acwr_ratio}
          status={training?.acwr_status}
          acuteLoad={training?.acute_load}
          chronicLoad={training?.chronic_load}
          tunnelMin={training?.load_tunnel_min}
          tunnelMax={training?.load_tunnel_max}
        />
        <Vo2Sparkline
          series={vo2Series}
          current={training?.vo2_max}
          currentDate={training?.vo2_max_date}
        />
        <RacePredictionsCard predictions={training?.race_predictions} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Sessions ({activities.length})
        </h2>
        {activities.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                No sessions recorded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rest day or watch not worn during exercise.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((a, i) => (
              <ActivityCard key={i} activity={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
