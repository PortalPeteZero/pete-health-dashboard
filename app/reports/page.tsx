import Link from "next/link";
import { format } from "date-fns";
import {
  getAllWeekEntries,
  getAllMonthsWithData,
  isoWeekRange,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const weeks = getAllWeekEntries().slice().reverse();
  const months = getAllMonthsWithData().slice().reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Weekly reflections and monthly summaries. Narrative auto-reports coming later.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly reflections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weekly entries yet.</p>
          ) : (
            <ul className="divide-y">
              {weeks.map((w) => {
                const { start, end } = isoWeekRange(w);
                return (
                  <li key={w}>
                    <Link
                      href={`/week/${w}`}
                      className="flex items-center justify-between py-2.5 hover:text-foreground"
                    >
                      <span>
                        Week {w.split("-W")[1]}{" "}
                        <span className="text-muted-foreground">
                          · {format(start, "d MMM")} – {format(end, "d MMM yyyy")}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly summaries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {months.map((ym) => {
              const [y, m] = ym.split("-");
              const label = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1).toLocaleDateString(
                "en-GB",
                { month: "long", year: "numeric" },
              );
              return (
                <li key={ym}>
                  <Link
                    href={`/month/${parseInt(y, 10)}/${parseInt(m, 10)}`}
                    className="flex items-center justify-between py-2.5 hover:text-foreground"
                  >
                    <span>{label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
