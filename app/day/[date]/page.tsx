import { notFound } from "next/navigation";
import {
  getDay,
  getAllDates,
  getDaysUpTo,
  navigatePrev,
  navigateNext,
} from "@/lib/data";
import { prettyDate, scoreToQualifier } from "@/lib/format";
import { DateNav } from "@/components/date-nav";
import { SleepCard } from "@/components/sleep-card";
import { HrvCard } from "@/components/hrv-card";
import { TrainingReadinessGauge } from "@/components/training-readiness-gauge";
import { BodyBatteryCard } from "@/components/body-battery-card";
import { DailyStatsCard } from "@/components/daily-stats-card";
import { ActivityList } from "@/components/activity-list";
import { MarkdownPanel } from "@/components/markdown-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop } from "lucide-react";

export const dynamicParams = false;

const JOURNAL_START = "2026-05-23";

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

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const day = getDay(date);
  if (!day) notFound();

  const prev = navigatePrev(date);
  const next = navigateNext(date);
  const history = getDaysUpTo(date, 14).map((d) => ({
    date: d.date,
    hrv: d.hrv.last_night,
  }));
  const options = getAllDates()
    .slice()
    .reverse()
    .map((d) => ({ value: d, label: shortLabel(d), href: `/day/${d}` }));

  const showJournalEmpty = !day.journal && date >= JOURNAL_START;

  return (
    <div className="space-y-6">
      <DateNav
        label={prettyDate(date)}
        prevHref={prev ? `/day/${prev}` : null}
        nextHref={next ? `/day/${next}` : null}
        options={options}
        currentValue={date}
      />
      <h1 className="text-2xl font-bold">{prettyDate(date)}</h1>

      {day.signoff && (day.signoff.confirmed || day.signoff.detected) && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
          <Laptop className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Last night
            </div>
            <div className="text-base font-semibold">
              Finished work {day.signoff.confirmed ? "" : "~"}
              {day.signoff.confirmed || day.signoff.detected}
              {!day.signoff.confirmed && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  estimate
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SleepCard day={day} />
        <HrvCard
          value={day.hrv.last_night}
          weeklyAvg={day.hrv.weekly_avg}
          status={day.hrv.status}
          history={history}
        />
        <TrainingReadinessGauge
          score={day.training_readiness.score}
          level={day.training_readiness.level}
          feedback={day.training_readiness.feedback_short}
        />
        <BodyBatteryCard day={day} />
        <div className="md:col-span-2">
          <DailyStatsCard day={day} />
        </div>
        <div className="md:col-span-2 space-y-3">
          <ActivityList activities={day.activities} />
          {day.activities.length > 0 ? (
            <a
              href={`/training/${day.date}`}
              className="group flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-white shadow-sm transition-all hover:shadow-md hover:from-emerald-600 hover:to-sky-600 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-xl">⚡</span>
                <div>
                  <div className="text-sm font-semibold leading-tight">
                    View training detail
                  </div>
                  <div className="text-xs text-white/80 leading-tight">
                    HR zones · training effect · splits · ACWR · load
                  </div>
                </div>
              </div>
              <span
                aria-hidden
                className="text-lg transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          ) : null}
        </div>
      </div>

      {day.journal && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pete&apos;s journal — {day.sleep.qualifier || scoreToQualifier(day.sleep.score)} day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownPanel body={day.journal.body} />
          </CardContent>
        </Card>
      )}
      {showJournalEmpty && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No journal entry for this day.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
