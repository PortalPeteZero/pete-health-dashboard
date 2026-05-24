"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface TrendPoint {
  date: string;
  sleep: number | null;
  hrv: number | null;
  readiness: number | null;
}

const METRICS = [
  { key: "sleep", label: "Sleep score", color: "#16a34a", axis: "score" },
  { key: "readiness", label: "Readiness", color: "#f59e0b", axis: "score" },
  { key: "hrv", label: "HRV (ms)", color: "#6366f1", axis: "hrv" },
] as const;

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [active, setActive] = useState<Record<string, boolean>>({
    sleep: true,
    readiness: true,
    hrv: true,
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive((s) => ({ ...s, [m.key]: !s[m.key] }))}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active[m.key]
                ? "text-white"
                : "bg-background text-muted-foreground",
            )}
            style={active[m.key] ? { backgroundColor: m.color, borderColor: m.color } : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={24}
            />
            <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
            <YAxis
              yAxisId="hrv"
              orientation="right"
              domain={["dataMin - 5", "dataMax + 5"]}
              tick={{ fontSize: 11 }}
              width={32}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {METRICS.filter((m) => active[m.key]).map((m) => (
              <Line
                key={m.key}
                yAxisId={m.axis}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
