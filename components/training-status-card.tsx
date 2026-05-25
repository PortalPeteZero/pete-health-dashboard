import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { humaniseFeedback, trainingStatusClasses } from "@/lib/training";
import type { TrainingBlock } from "@/lib/types";

interface Props {
  training: TrainingBlock | null | undefined;
}

export function TrainingStatusCard({ training }: Props) {
  if (!training || training.status_int == null) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Training status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No status recorded.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Training status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${trainingStatusClasses(training.status_int)}`}>
            {training.status_label || "—"}
          </span>
          {training.primary_sport ? (
            <span className="text-xs text-muted-foreground">{training.primary_sport.toLowerCase()}</span>
          ) : null}
        </div>
        {training.status_phrase ? (
          <p className="text-sm">{humaniseFeedback(training.status_phrase)}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
