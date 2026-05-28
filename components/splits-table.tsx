import { secondsToHms } from "@/lib/training";
import type { ActivitySplit } from "@/lib/types";

interface Props {
  splits: ActivitySplit[] | undefined;
  sport: string;
}

type SportKind = "run" | "bike" | "swim" | "other";

function classify(sport: string): SportKind {
  const s = sport.toLowerCase();
  if (s.includes("swim")) return "swim";
  if (s.includes("bik") || s.includes("cycl") || s.includes("turbo")) return "bike";
  if (s.includes("run") || s.includes("walk")) return "run";
  return "other";
}

function pace(mps: number | null | undefined, kind: SportKind): string {
  if (mps == null || mps <= 0) return "—";
  if (kind === "swim") {
    const sec = 100 / mps;
    return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}/100m`;
  }
  const sec = 1000 / mps;
  return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}/km`;
}

function km(distance_m: number | null | undefined): string {
  if (distance_m == null) return "—";
  return `${(distance_m / 1000).toFixed(2)} km`;
}

function num(v: number | null | undefined, suffix = ""): string {
  if (v == null) return "—";
  return `${v}${suffix}`;
}

export function SplitsTable({ splits, sport }: Props) {
  if (!splits || splits.length === 0) return null;
  const kind = classify(sport);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header row */}
      <SplitHeader kind={kind} />

      {/* Rows */}
      <div className="divide-y">
        {splits.map((sp, i) => (
          <SplitRow key={i} sp={sp} idx={i + 1} kind={kind} totalLaps={splits.length} />
        ))}
      </div>

      {/* Sport-specific legend hint at the bottom */}
      <div className="border-t bg-muted/30 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {kind === "bike" && "Bike splits · power (W) + cadence (rpm)"}
        {kind === "run" && "Run splits · pace (min/km) + cadence (spm)"}
        {kind === "swim" && "Swim splits · pace (min/100m)"}
        {kind === "other" && "Splits"}
      </div>
    </div>
  );
}

function SplitHeader({ kind }: { kind: SportKind }) {
  const cols = headerCols(kind);
  return (
    <div
      className="hidden border-b bg-gradient-to-r from-muted/50 to-muted/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid sm:gap-2"
      style={{ gridTemplateColumns: cols.template }}
    >
      <div>Lap</div>
      {cols.headings.map((h) => (
        <div key={h} className="text-right">
          {h}
        </div>
      ))}
    </div>
  );
}

function SplitRow({ sp, idx, kind, totalLaps }: { sp: ActivitySplit; idx: number; kind: SportKind; totalLaps: number }) {
  const cols = headerCols(kind);
  const isFinal = idx === totalLaps;
  // Mobile renders cards; sm+ renders an aligned grid row.
  return (
    <div className="px-3 py-2.5 transition hover:bg-muted/30 sm:py-2">
      {/* Desktop / wider — grid row */}
      <div
        className="hidden items-center gap-2 text-sm tabular-nums sm:grid"
        style={{ gridTemplateColumns: cols.template }}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
            {idx}
          </span>
          {isFinal && idx > 1 && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">finish</span>
          )}
        </div>
        {cells(sp, kind).map((c, i) => (
          <div key={i} className={`text-right ${c.muted ? "text-muted-foreground" : ""}`}>
            {c.value}
          </div>
        ))}
      </div>

      {/* Mobile — compact card */}
      <div className="flex flex-col gap-1.5 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
              {idx}
            </span>
            <span className="text-sm font-semibold tabular-nums">{km(sp.distance_m)}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              · {secondsToHms(sp.duration_sec)}
            </span>
          </div>
          {kind === "bike" && sp.avg_power_w && (
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 tabular-nums">
              {sp.avg_power_w}W
            </span>
          )}
          {kind === "run" && sp.avg_speed_mps && (
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 tabular-nums">
              {pace(sp.avg_speed_mps, kind)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
          {cells(sp, kind).slice(2).map((c, i) => (
            <div key={i} className="flex justify-between gap-2 tabular-nums">
              <span className="opacity-70">{cols.headings[i + 2]}</span>
              <span className={c.muted ? "" : "text-foreground"}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function headerCols(kind: SportKind): { template: string; headings: string[] } {
  switch (kind) {
    case "bike":
      return {
        // Lap | Distance | Time | Avg W | Max W | Avg HR | Max HR | Cadence
        template: "3.5rem 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        headings: ["Distance", "Time", "Avg W", "Max W", "Avg HR", "Max HR", "Cadence"],
      };
    case "run":
      return {
        // Lap | Distance | Time | Pace | Avg HR | Max HR | Cadence
        template: "3.5rem 1fr 1fr 1fr 1fr 1fr 1fr",
        headings: ["Distance", "Time", "Pace", "Avg HR", "Max HR", "Cadence"],
      };
    case "swim":
      return {
        template: "3.5rem 1fr 1fr 1fr 1fr 1fr",
        headings: ["Distance", "Time", "Pace", "Avg HR", "Max HR"],
      };
    default:
      return {
        template: "3.5rem 1fr 1fr 1fr 1fr",
        headings: ["Distance", "Time", "Pace", "Avg HR"],
      };
  }
}

function cells(sp: ActivitySplit, kind: SportKind): { value: string; muted: boolean }[] {
  const mute = (v: string) => ({ value: v, muted: v === "—" });

  if (kind === "bike") {
    return [
      mute(km(sp.distance_m)),
      mute(secondsToHms(sp.duration_sec)),
      mute(num(sp.avg_power_w, "W")),
      mute(num(sp.max_power_w, "W")),
      mute(num(sp.avg_hr)),
      mute(num(sp.max_hr)),
      mute(num(sp.avg_cadence, " rpm")),
    ];
  }
  if (kind === "run") {
    return [
      mute(km(sp.distance_m)),
      mute(secondsToHms(sp.duration_sec)),
      mute(pace(sp.avg_speed_mps, kind)),
      mute(num(sp.avg_hr)),
      mute(num(sp.max_hr)),
      mute(num(sp.avg_cadence, " spm")),
    ];
  }
  if (kind === "swim") {
    return [
      mute(km(sp.distance_m)),
      mute(secondsToHms(sp.duration_sec)),
      mute(pace(sp.avg_speed_mps, kind)),
      mute(num(sp.avg_hr)),
      mute(num(sp.max_hr)),
    ];
  }
  return [
    mute(km(sp.distance_m)),
    mute(secondsToHms(sp.duration_sec)),
    mute(pace(sp.avg_speed_mps, kind)),
    mute(num(sp.avg_hr)),
  ];
}
