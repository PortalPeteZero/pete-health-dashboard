import Link from "next/link";
import { sleepScoreColor } from "@/lib/format";
import type { GarminDay } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function compactHm(min: number | null): string {
  if (min === null || min === undefined) return "";
  return `${Math.floor(min / 60)}h${Math.round(min % 60)}m`;
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
      <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const score = cell.day?.sleep.score ?? null;
          const hasData = !!cell.day && score !== null;
          const dayNum = parseInt(cell.date.slice(-2), 10);
          const inner = (
            <div
              className="flex aspect-square flex-col rounded-md p-1"
              style={{
                backgroundColor: hasData ? sleepScoreColor(score) : "var(--muted)",
                color: hasData ? "#fff" : "var(--muted-foreground)",
              }}
            >
              <span className="text-[10px] font-medium leading-none opacity-80">{dayNum}</span>
              {hasData && (
                <div className="flex flex-1 flex-col items-center justify-center leading-none">
                  <span className="text-base font-bold tabular-nums">{score}</span>
                  <span className="mt-0.5 text-[10px] opacity-95">
                    {compactHm(cell.day!.sleep.total_min)}
                  </span>
                </div>
              )}
            </div>
          );
          return cell.day ? (
            <Link
              key={i}
              href={`/day/${cell.date}`}
              className="transition-transform hover:scale-105"
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
