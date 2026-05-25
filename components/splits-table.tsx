import { secondsToHms } from "@/lib/training";
import type { ActivitySplit } from "@/lib/types";

interface Props {
  splits: ActivitySplit[] | undefined;
  sport: string;
}

function speedToHumanPace(mps: number | null, sport: string): string {
  if (mps == null || mps <= 0) return "—";
  if (sport.includes("swim")) {
    const sec100 = 100 / mps;
    const m = Math.floor(sec100 / 60);
    const s = Math.round(sec100 % 60);
    return `${m}:${String(s).padStart(2, "0")}/100m`;
  }
  // Default: per-km pace.
  const secKm = 1000 / mps;
  const m = Math.floor(secKm / 60);
  const s = Math.round(secKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

export function SplitsTable({ splits, sport }: Props) {
  if (!splits || splits.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-xs">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-2 py-1 font-medium">#</th>
            <th className="px-2 py-1 font-medium">Type</th>
            <th className="px-2 py-1 text-right font-medium">Duration</th>
            <th className="px-2 py-1 text-right font-medium">Distance</th>
            <th className="px-2 py-1 text-right font-medium">Pace</th>
            <th className="px-2 py-1 text-right font-medium">Avg HR</th>
          </tr>
        </thead>
        <tbody>
          {splits.map((sp, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-2 py-1 tabular-nums text-muted-foreground">{i + 1}</td>
              <td className="px-2 py-1 text-muted-foreground">
                {(sp.split_type || "").toLowerCase().replace(/_/g, " ") || "—"}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{secondsToHms(sp.duration_sec)}</td>
              <td className="px-2 py-1 text-right tabular-nums">
                {sp.distance_m ? `${(sp.distance_m / 1000).toFixed(2)} km` : "—"}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">
                {speedToHumanPace(sp.avg_speed_mps, sport)}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{sp.avg_hr ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
