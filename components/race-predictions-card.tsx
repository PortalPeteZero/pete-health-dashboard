import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { secondsToHms } from "@/lib/training";
import type { RacePredictions } from "@/lib/types";

interface Props {
  predictions: RacePredictions | null | undefined;
}

const ROWS: Array<{ key: keyof RacePredictions; label: string }> = [
  { key: "time_5k_sec", label: "5K" },
  { key: "time_10k_sec", label: "10K" },
  { key: "time_half_marathon_sec", label: "Half marathon" },
  { key: "time_marathon_sec", label: "Marathon" },
];

export function RacePredictionsCard({ predictions }: Props) {
  if (
    !predictions ||
    (predictions.time_5k_sec == null &&
      predictions.time_10k_sec == null &&
      predictions.time_half_marathon_sec == null &&
      predictions.time_marathon_sec == null)
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Race predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm">
          {ROWS.map((r) => {
            const v = predictions[r.key] as number | null;
            return (
              <li key={r.key} className="flex items-baseline justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium tabular-nums">{secondsToHms(v)}</span>
              </li>
            );
          })}
        </ul>
        {predictions.calendar_date ? (
          <p className="mt-2 text-[10px] text-muted-foreground">As at {predictions.calendar_date}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
