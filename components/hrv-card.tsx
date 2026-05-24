"use client";

import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HrvStatusBadge } from "./hrv-status-badge";

export function HrvCard({
  value,
  weeklyAvg,
  status,
  history,
}: {
  value: number | null;
  weeklyAvg: number | null;
  status: string | null;
  history: { date: string; hrv: number | null }[];
}) {
  const series = history.filter((h) => h.hrv !== null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">HRV</CardTitle>
        <HrvStatusBadge status={status} />
      </CardHeader>
      <CardContent>
        {value === null ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">{value}</span>
              <span className="text-sm text-muted-foreground">ms last night</span>
            </div>
            {weeklyAvg !== null && (
              <div className="text-xs text-muted-foreground">7-day avg {weeklyAvg} ms</div>
            )}
            {series.length > 1 && (
              <div className="mt-3 w-full">
                <ResponsiveContainer width="100%" height={56}>
                  <LineChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip
                      formatter={(value) => [`${value} ms`, "HRV"]}
                      labelFormatter={(l) => String(l)}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
