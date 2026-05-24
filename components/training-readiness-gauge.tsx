"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function color(level: string | null): string {
  switch ((level || "").toUpperCase()) {
    case "MAXIMUM":
    case "HIGH":
      return "#059669";
    case "MODERATE":
      return "#f59e0b";
    case "LOW":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

export function TrainingReadinessGauge({
  score,
  level,
  feedback,
}: {
  score: number | null;
  level: string | null;
  feedback?: string | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Training Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score === null ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[{ value: score }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={8}
                    fill={color(level)}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{score}</span>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {level}
                </span>
              </div>
            </div>
            {feedback && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feedback.replace(/_/g, " ").toLowerCase()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
