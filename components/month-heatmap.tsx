import Link from "next/link";
import type { GarminDay } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function compactHm(min: number | null): string {
  if (min === null || min === undefined) return "";
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
}

/** Sleep tier palette — soft, modern, readable on white. */
function sleepTier(score: number | null): {
  label: string;
  // Tailwind class fragments for the tier band + score colour
  band: string;
  scoreText: string;
} {
  if (score === null || score === undefined) {
    return { label: "—", band: "bg-muted", scoreText: "text-muted-foreground" };
  }
  if (score >= 80) return { label: "Excellent", band: "bg-emerald-500", scoreText: "text-emerald-700" };
  if (score >= 65) return { label: "Good", band: "bg-lime-500", scoreText: "text-lime-700" };
  if (score >= 50) return { label: "Fair", band: "bg-amber-500", scoreText: "text-amber-700" };
  return { label: "Poor", band: "bg-rose-500", scoreText: "text-rose-700" };
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

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isFuture = (date: string) => date > todayStr;

  const cells: ({ date: string; day: GarminDay | null } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: byDate.get(date) ?? null });
  }

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const day = cell.day;
          const score = day?.sleep.score ?? null;
          const hasData = !!day && score !== null;
          const dayNum = parseInt(cell.date.slice(-2), 10);
          const future = isFuture(cell.date);
          const isToday = cell.date === todayStr;

          const tier = sleepTier(score);
          const signoff = day?.signoff;
          const signoffStr = signoff?.confirmed || signoff?.detected || null;
          const hrv = day?.hrv?.last_night ?? null;
          const rhr = day?.daily?.resting_hr ?? null;
          const activityCount = day?.activities?.length ?? 0;

          // Empty state — past day with no data
          if (!hasData) {
            return (
              <div
                key={i}
                className={`flex min-h-[8.5rem] flex-col rounded-xl border bg-card/40 p-2.5 ${
                  future ? "opacity-40" : "opacity-70"
                } ${isToday ? "ring-2 ring-emerald-400" : ""}`}
              >
                <span className="text-xs font-bold text-muted-foreground">{dayNum}</span>
              </div>
            );
          }

          const inner = (
            <div
              className={`group relative flex min-h-[8.5rem] flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md ${
                isToday ? "ring-2 ring-emerald-500" : ""
              }`}
            >
              {/* Top coloured tier band */}
              <div className={`h-1 w-full ${tier.band}`} aria-hidden />

              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                {/* Header: day # + signoff */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">{dayNum}</span>
                  {signoffStr && (
                    <span className="font-semibold tabular-nums text-muted-foreground">
                      {signoffStr}
                    </span>
                  )}
                </div>

                {/* Score + hours — the hero */}
                <div className="flex flex-1 flex-col items-center justify-center leading-none">
                  <span className={`text-3xl font-extrabold tabular-nums tracking-tight ${tier.scoreText}`}>
                    {score}
                  </span>
                  <span className="mt-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {compactHm(day!.sleep.total_min)}
                  </span>
                </div>

                {/* Footer: HRV / RHR + activity count */}
                <div className="mt-auto space-y-1 border-t pt-1.5">
                  <div className="flex items-center justify-between gap-1 text-[10px] tabular-nums">
                    <span>
                      <span className="font-bold text-foreground/80">{hrv ?? "—"}</span>
                      <span className="ml-0.5 text-muted-foreground">hrv</span>
                    </span>
                    <span>
                      <span className="font-bold text-foreground/80">{rhr ?? "—"}</span>
                      <span className="ml-0.5 text-muted-foreground">rhr</span>
                    </span>
                  </div>
                  {activityCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>
                        {activityCount} session{activityCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <Link
              key={i}
              href={`/day/${cell.date}`}
              className="transition-transform hover:scale-[1.02]"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
