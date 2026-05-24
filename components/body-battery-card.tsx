import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GarminDay } from "@/lib/types";
import { BatteryCharging } from "lucide-react";

export function BodyBatteryCard({ day }: { day: GarminDay }) {
  const b = day.body_battery;
  const hasData = b.charged !== null || b.drained !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Body Battery
        </CardTitle>
        <BatteryCharging className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold tabular-nums text-green-600">
                {b.charged !== null ? `+${b.charged}` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">charged</div>
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums text-red-500">
                {b.drained !== null ? `−${b.drained}` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">drained</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
