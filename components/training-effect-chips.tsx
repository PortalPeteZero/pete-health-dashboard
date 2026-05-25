import { humaniseFeedback, teLabelHuman } from "@/lib/training";

interface Props {
  aerobic: number | null | undefined;
  aerobicMsg?: string | null;
  anaerobic: number | null | undefined;
  anaerobicMsg?: string | null;
  label?: string | null;
}

function teColor(te: number | null | undefined): string {
  if (te === null || te === undefined || te === 0) return "bg-muted text-muted-foreground";
  if (te >= 5) return "bg-red-500 text-white";
  if (te >= 4) return "bg-amber-500 text-white";
  if (te >= 3) return "bg-emerald-500 text-white";
  if (te >= 2) return "bg-sky-500 text-white";
  if (te >= 1) return "bg-slate-400 text-white";
  return "bg-muted text-muted-foreground";
}

function teText(te: number | null | undefined): string {
  if (te === null || te === undefined) return "—";
  return te.toFixed(1);
}

export function TrainingEffectChips({
  aerobic,
  aerobicMsg,
  anaerobic,
  anaerobicMsg,
  label,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-medium ${teColor(aerobic)}`}>
        Aerobic {teText(aerobic)}
      </span>
      <span className={`rounded-full px-2 py-0.5 font-medium ${teColor(anaerobic)}`}>
        Anaerobic {teText(anaerobic)}
      </span>
      {label ? (
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
          {teLabelHuman(label)}
        </span>
      ) : null}
      {aerobicMsg ? (
        <span className="text-muted-foreground">{humaniseFeedback(aerobicMsg)}</span>
      ) : anaerobicMsg ? (
        <span className="text-muted-foreground">{humaniseFeedback(anaerobicMsg)}</span>
      ) : null}
    </div>
  );
}
