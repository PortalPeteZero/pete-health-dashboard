import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllFeedbackDates, getFeedback } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

const ZONE_TONES: Record<string, string> = {
  competent: "bg-slate-200 text-slate-900",
  chilled: "bg-sky-200 text-sky-900",
  comfortable: "bg-emerald-200 text-emerald-900",
  controlled: "bg-teal-300 text-teal-900",
  challenging: "bg-amber-300 text-amber-900",
  candy: "bg-orange-300 text-orange-900",
  critical: "bg-rose-400 text-rose-50",
  crazy: "bg-red-600 text-red-50",
  long: "bg-violet-200 text-violet-900",
  race: "bg-fuchsia-400 text-fuchsia-50",
  recovery: "bg-blue-200 text-blue-900",
  rest: "bg-zinc-200 text-zinc-900",
};

function toneFor(sessionType: string): string {
  return ZONE_TONES[sessionType.toLowerCase()] ?? "bg-muted text-foreground";
}

function formatDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  return { title: `SST · ${date}` };
}

export function generateStaticParams() {
  return getAllFeedbackDates().map((date) => ({ date }));
}

export default async function SSTEntryPage({ params }: PageProps) {
  const { date } = await params;
  const entry = getFeedback(date);
  if (!entry) notFound();

  const dates = getAllFeedbackDates();
  const idx = dates.indexOf(date);
  const prev = idx > 0 ? dates[idx - 1] : null;
  const next = idx >= 0 && idx < dates.length - 1 ? dates[idx + 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/sst" className="text-sm text-muted-foreground hover:text-foreground">
          ← All feedback
        </Link>
        <div className="flex gap-3 text-sm">
          {prev && <Link href={`/sst/${prev}`} className="text-muted-foreground hover:text-foreground">← {prev}</Link>}
          {next && <Link href={`/sst/${next}`} className="text-muted-foreground hover:text-foreground">{next} →</Link>}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{formatDate(date)}</h1>
        <p className="text-sm text-muted-foreground">
          {entry.entries.length} session{entry.entries.length === 1 ? "" : "s"} · sent via {entry.entries[0]?.sent_via ?? "xhale"}
        </p>
      </div>

      {entry.pending_garmin_backfill && (
        <Card className="border-sky-300 bg-sky-50">
          <CardContent className="p-4 text-sm text-sky-900">
            Pending Garmin backfill — activity IDs / stats may not be filled in yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {entry.entries.map((s, i) => {
          const tone = toneFor(s.session_type);
          return (
            <Card key={i}>
              <CardHeader className="space-y-2 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
                    {s.session_type}
                  </span>
                  <span className="text-sm text-muted-foreground">{s.sport}</span>
                  {s.time && <span className="text-sm text-muted-foreground">· {s.time}</span>}
                </div>
                <CardTitle className="text-base">
                  {s.activity_name ?? s.headline ?? "Session"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(s.distance_km !== undefined || s.duration_min !== undefined || s.avg_hr !== undefined) && (
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    {s.distance_km !== undefined && (
                      <Stat label="Distance" value={`${s.distance_km} km`} />
                    )}
                    {s.duration_min !== undefined && (
                      <Stat label="Duration" value={`${s.duration_min} min`} />
                    )}
                    {s.avg_hr !== undefined && (
                      <Stat label="Avg HR" value={`${s.avg_hr}`} />
                    )}
                    {s.max_hr !== undefined && (
                      <Stat label="Max HR" value={`${s.max_hr}`} />
                    )}
                    {s.effort_perceived !== undefined && (
                      <Stat label="RPE" value={`${s.effort_perceived} / 10`} />
                    )}
                  </div>
                )}

                {s.feedback_text && (
                  <div className="rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Sent to Loren
                    </div>
                    <p className="whitespace-pre-wrap">{s.feedback_text}</p>
                  </div>
                )}

                {s.notes_tags && s.notes_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.notes_tags.map((t) => (
                      <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {s.garmin_activity_id && (
                  <p className="text-xs text-muted-foreground">
                    Garmin activity ID: <code>{s.garmin_activity_id}</code>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
