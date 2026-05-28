import { Card, CardContent } from "@/components/ui/card";
import type { FeedbackSessionEntry } from "@/lib/types";

const TONE: Record<string, { bar: string; chip: string }> = {
  competent: { bar: "bg-slate-400", chip: "bg-slate-100 text-slate-800" },
  chilled: { bar: "bg-sky-400", chip: "bg-sky-100 text-sky-800" },
  comfortable: { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  controlled: { bar: "bg-teal-500", chip: "bg-teal-100 text-teal-800" },
  challenging: { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-800" },
  candy: { bar: "bg-orange-500", chip: "bg-orange-100 text-orange-800" },
  critical: { bar: "bg-rose-600", chip: "bg-rose-100 text-rose-800" },
  crazy: { bar: "bg-red-700", chip: "bg-red-100 text-red-800" },
  drills: { bar: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-800" },
  progressive: { bar: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  long: { bar: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  race: { bar: "bg-fuchsia-600", chip: "bg-fuchsia-100 text-fuchsia-800" },
  recovery: { bar: "bg-blue-500", chip: "bg-blue-100 text-blue-800" },
  rest: { bar: "bg-zinc-400", chip: "bg-zinc-100 text-zinc-800" },
  missed: { bar: "bg-zinc-500", chip: "bg-zinc-100 text-zinc-700" },
};

function toneFor(sessionType: string | undefined): { bar: string; chip: string } {
  return TONE[(sessionType || "").toLowerCase()] ?? { bar: "bg-foreground/40", chip: "bg-muted text-foreground" };
}

export function FeedbackBox({ entry }: { entry: FeedbackSessionEntry }) {
  const tone = toneFor(entry.session_type);
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${tone.bar}`} aria-hidden />
        <CardContent className="flex-1 space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Sent to Loren
            </span>
            {entry.session_type && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>
                {entry.session_type}
              </span>
            )}
            {entry.effort_perceived != null && (
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                RPE {entry.effort_perceived}
              </span>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {entry.feedback_text}
          </p>

          {entry.notes_tags && entry.notes_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.notes_tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Standalone feedback box for entries that have no matching Garmin activity
 * (e.g. a "missed session" explanation note). Renders above the Sessions section.
 */
export function UnpairedFeedbackBox({ entry }: { entry: FeedbackSessionEntry }) {
  const tone = toneFor(entry.session_type);
  return (
    <Card className="overflow-hidden border-dashed">
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${tone.bar}`} aria-hidden />
        <CardContent className="flex-1 space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Note to Loren
            </span>
            {entry.activity_name && (
              <span className="text-xs font-semibold">{entry.activity_name}</span>
            )}
            {entry.session_type && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>
                {entry.session_type}
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {entry.feedback_text}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
