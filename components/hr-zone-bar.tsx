import {
  HR_ZONE_COLOURS,
  HR_ZONE_LABELS,
  hrZonePercents,
  hrZoneTotalSec,
} from "@/lib/training";
import type { HRZones } from "@/lib/types";

function mmss(sec: number): string {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  zones: HRZones | null | undefined;
  /** When true, show labels + minute totals alongside the bar. */
  detailed?: boolean;
}

/** A flat stacked HR-zone bar with optional per-zone labels.
 *  Renders nothing if zones are empty (so older activities don't show a blank bar). */
export function HRZoneBar({ zones, detailed = false }: Props) {
  const total = hrZoneTotalSec(zones);
  if (!zones || !total) {
    return (
      <p className="text-xs text-muted-foreground">No HR-zone data for this activity.</p>
    );
  }
  const pcts = hrZonePercents(zones);
  const keys: Array<keyof HRZones> = ["z1", "z2", "z3", "z4", "z5"];

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {keys.map((k) =>
          pcts[k] > 0 ? (
            <div
              key={k}
              style={{ width: `${pcts[k]}%`, backgroundColor: HR_ZONE_COLOURS[k] }}
              title={`${HR_ZONE_LABELS[k]} · ${pcts[k].toFixed(1)}% · ${mmss(zones[k])}`}
            />
          ) : null,
        )}
      </div>
      {detailed ? (
        <div className="grid grid-cols-5 gap-1 text-[10px] leading-tight">
          {keys.map((k) => (
            <div key={k} className="rounded bg-muted/40 p-1 text-center">
              <div className="flex items-center justify-center gap-1">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: HR_ZONE_COLOURS[k] }}
                />
                <span className="font-semibold">{k.toUpperCase()}</span>
              </div>
              <div className="text-muted-foreground">{mmss(zones[k])}</div>
              <div className="text-muted-foreground">{pcts[k].toFixed(0)}%</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
