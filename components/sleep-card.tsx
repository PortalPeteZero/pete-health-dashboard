import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QualifierBadge } from "./qualifier-badge";
import { minutesToHm } from "@/lib/format";
import type { GarminDay } from "@/lib/types";

export function SleepCard({ day }: { day: GarminDay }) {
  const s = day.sleep;
  const segs = [
    { label: "Deep", min: s.deep_min ?? 0, color: "bg-indigo-700" },
    { label: "REM", min: s.rem_min ?? 0, color: "bg-indigo-400" },
    { label: "Light", min: s.light_min ?? 0, color: "bg-sky-300" },
    { label: "Awake", min: s.awake_min ?? 0, color: "bg-rose-300" },
  ];
  const total = segs.reduce((a, b) => a + b.min, 0) || 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Sleep</CardTitle>
        <QualifierBadge qualifier={s.qualifier} score={s.score} />
      </CardHeader>
      <CardContent>
        {s.score === null ? (
          <p className="text-sm text-muted-foreground">No sleep data.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">{s.score}</span>
              <span className="text-sm text-muted-foreground">
                {minutesToHm(s.total_min)} asleep
              </span>
            </div>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {segs.map((seg) => (
                <div
                  key={seg.label}
                  className={seg.color}
                  style={{ width: `${(seg.min / total) * 100}%` }}
                  title={`${seg.label} ${seg.min}m`}
                />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1 text-center text-xs text-muted-foreground">
              {segs.map((seg) => (
                <div key={seg.label}>
                  <div className="font-medium text-foreground">{seg.min}m</div>
                  {seg.label}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
