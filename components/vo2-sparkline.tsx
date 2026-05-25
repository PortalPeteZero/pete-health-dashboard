"use client";

import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  series: Array<{ date: string; vo2: number | null }>;
  current: number | null | undefined;
  currentDate?: string | null;
}

export function Vo2Sparkline({ series, current, currentDate }: Props) {
  const data = series.filter((p) => p.vo2 !== null) as Array<{ date: string; vo2: number }>;
  const min = data.length ? Math.min(...data.map((p) => p.vo2)) : 0;
  const max = data.length ? Math.max(...data.map((p) => p.vo2)) : 0;
  const delta = data.length >= 2 ? data[data.length - 1].vo2 - data[0].vo2 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">VO₂ max</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">
            {current != null ? current.toFixed(1) : "—"}
          </span>
          {data.length >= 2 ? (
            <span className={`text-xs ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} over 90d
            </span>
          ) : null}
        </div>
        {data.length >= 2 ? (
          <div className="h-12">
            <ResponsiveContainer width="100%" height={48}>
              <LineChart data={data}>
                <YAxis hide domain={[min - 0.5, max + 0.5]} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  labelFormatter={(l) => l as string}
                  formatter={(v) => [v, "VO₂"]}
                />
                <Line type="monotone" dataKey="vo2" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Need more data for the trend.</p>
        )}
        {currentDate ? (
          <p className="text-[10px] text-muted-foreground">As at {currentDate}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
