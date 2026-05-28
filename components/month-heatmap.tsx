import Link from "next/link";
import { sleepScoreColor } from "@/lib/format";
import { Clock, Heart, Activity } from "lucide-react";
import type { GarminDay } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function compactHm(min: number | null): string {
  if (min === null || min === undefined) return "";
  return `${Math.floor(min / 60)}h${Math.round(min % 60)}m`;
}

function lightContrastColor(score: number | null): boolean {
  // For sleep-score backgrounds: use white text on darker tiers, dark text on the lighter green
  if (score === null) return false;
  return score >= 65; // 65+ = green tiers (use white text)
}

export function MonthHeatmap({
  year,
  month,
  days,
}: {
  year: number;
  month: number;
  days: GarminDay[];
}) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // JS getDay: 0=Sun..6=Sat. Convert to Mon=0..Sun=6.
  const startOffset = (first.getDay() + 6) % 7;

  const cells: ({ date: string; day: GarminDay | null } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: byDate.get(date) ?? null });
  }

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const day = cell.day;
          const score = day?.sleep.score ?? null;
          const hasData = !!day && score !== null;
          const dayNum = parseInt(cell.date.slice(-2), 10);
          const useWhiteText = lightContrastColor(score);

          const signoff = day?.signoff;
          const signoffStr = signoff?.confirmed || signoff?.detected || null;
          const signoffEst = !signoff?.confirmed && !!signoff?.detected;

          const hrv = day?.hrv?.last_night ?? null;
          const rhr = day?.daily?.resting_hr ?? null;
          const activityCount = day?.activities?.length ?? 0;

          const inner = (
            <div
              className="flex min-h-[7.5rem] flex-col gap-1 rounded-xl p-2 ring-1 ring-inset ring-black/5 transition"
              style={{
                backgroundColor: hasData ? sleepScoreColor(score) : "var(--muted)",
                color: hasData ? (useWhiteText ? "#fff" : "rgba(0,0,0,0.85)") : "var(--muted-foreground)",
              }}
            >
              {/* Header: day number + signoff */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-bold leading-none opacity-80">{dayNum}</span>
                {signoffStr && (
                  <span className="flex items-center gap-0.5 text-[9px] tabular-nums opacity-85">
                    <Clock className="h-2.5 w-2.5" />
                    {signoffStr}
                    {signoffEst && <span className="opacity-70">~</span>}
                  </span>
                )}
              </div>

              {hasData ? (
                <>
                  {/* Sleep score + hours */}
                  <div className="flex flex-1 flex-col items-center justify-center leading-none">
                    <span className="text-2xl font-extrabold tabular-nums sm:text-3xl">{score}</span>
                    <span className="mt-0.5 text-[10px] tabular-nums opacity-90">
                      {compactHm(day!.sleep.total_min)}
                    </span>
                  </div>

                  {/* Stats footer: HRV / RHR / activity flag */}
                  <div className="mt-auto grid grid-cols-2 gap-1 text-[10px] tabular-nums">
                    <div className="flex items-center gap-0.5 opacity-90">
                      <Heart className="h-2.5 w-2.5" />
                      <span className="font-semibold">{hrv ?? "—"}</span>
                      <span className="opacity-75">hrv</span>
                    </div>
                    <div className="flex items-center justify-end gap-0.5 opacity-90">
                      <span className="font-semibold">{rhr ?? "—"}</span>
                      <span className="opacity-75">rhr</span>
                    </div>
                  </div>
                  {activityCount > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] opacity-85">
                      <Activity className="h-2.5 w-2.5" />
                      <span>{activityCount} session{activityCount === 1 ? "" : "s"}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center" />
              )}
            </div>
          );
          return day ? (
            <Link
              key={i}
              href={`/day/${cell.date}`}
              className="transition-transform hover:scale-[1.03]"
            >
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
