import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { acwrStatusClasses } from "@/lib/training";

interface Props {
  ratio: number | null | undefined;
  status: string | null | undefined;
  acuteLoad: number | null | undefined;
  chronicLoad: number | null | undefined;
  tunnelMin: number | null | undefined;
  tunnelMax: number | null | undefined;
}

/** Layout: a thin bar showing the acute load's position inside the chronic-load
 *  tunnel (Garmin's "stay-in-this-band" target). The ACWR ratio is the headline. */
export function AcwrGauge({
  ratio,
  status,
  acuteLoad,
  chronicLoad,
  tunnelMin,
  tunnelMax,
}: Props) {
  let positionPct: number | null = null;
  if (
    acuteLoad != null &&
    tunnelMin != null &&
    tunnelMax != null &&
    tunnelMax > tunnelMin
  ) {
    positionPct = ((acuteLoad - tunnelMin) / (tunnelMax - tunnelMin)) * 100;
    positionPct = Math.max(-15, Math.min(115, positionPct));
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Load &amp; ACWR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums">
            {ratio != null ? ratio.toFixed(1) : "—"}
          </span>
          {status ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${acwrStatusClasses(status)}`}>
              {status}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Acute load <span className="font-medium text-foreground">{acuteLoad ?? "—"}</span> ·
          Chronic <span className="font-medium text-foreground">{chronicLoad ?? "—"}</span>
        </p>
        {positionPct !== null && tunnelMin != null && tunnelMax != null ? (
          <div className="space-y-1">
            <div className="relative h-2 w-full rounded-full bg-muted">
              <div className="absolute inset-y-0 left-[20%] right-[20%] rounded-full bg-emerald-200" />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow"
                style={{ left: `calc(${positionPct}% - 0.375rem)` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Load tunnel: {Math.round(tunnelMin)} – {Math.round(tunnelMax)} · Sweet spot in the centre band
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
