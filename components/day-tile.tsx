import Link from "next/link";
import { minutesToHm, sleepScoreColor } from "@/lib/format";
import type { GarminDay } from "@/lib/types";

function Mini({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-semibold tabular-nums">{value ?? "—"}</span>
    </div>
  );
}

export function DayTile({
  day,
  weekday,
  dayNum,
  date,
}: {
  day: GarminDay | null;
  weekday: string;
  dayNum: string;
  date: string;
}) {
  if (!day) {
    return (
      <div className="flex flex-col rounded-lg border border-dashed p-3">
        <div className="text-center">
          <div className="text-xs font-semibold">{weekday}</div>
          <div className="text-xs text-muted-foreground">{dayNum}</div>
        </div>
        <div className="flex flex-1 items-center justify-center py-4 text-xs text-muted-foreground">
          No data
        </div>
      </div>
    );
  }

  const s = day.sleep;
  return (
    <Link
      href={`/day/${date}`}
      className="flex flex-col rounded-lg border p-3 transition-colors hover:bg-accent"
    >
      <div className="text-center">
        <div className="text-xs font-semibold">{weekday}</div>
        <div className="text-xs text-muted-foreground">{dayNum}</div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Sleep
        </span>
        <span
          className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: sleepScoreColor(s.score) }}
        >
          {s.score ?? "–"}
        </span>
        <span className="mt-1 text-xs font-semibold tabular-nums">
          {s.total_min ? minutesToHm(s.total_min) : "—"}
        </span>
      </div>

      <div className="mt-3 space-y-1 border-t pt-2">
        <Mini label="HRV" value={day.hrv.last_night} />
        <Mini label="RHR" value={day.daily.resting_hr} />
        <Mini label="Stress" value={day.daily.stress_avg} />
        <Mini label="Ready" value={day.training_readiness.score} />
      </div>

      {day.activities.length > 0 && (
        <div className="mt-2 text-center text-[10px] text-muted-foreground">
          {day.activities.length} activit{day.activities.length === 1 ? "y" : "ies"}
        </div>
      )}
    </Link>
  );
}
