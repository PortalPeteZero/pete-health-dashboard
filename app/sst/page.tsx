import Link from "next/link";
import { getAllFeedbackDates, getFeedback, getTrainingZones } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import type { FeedbackSessionEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "SST · Pete · Health",
};

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
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SSTPage() {
  const dates = getAllFeedbackDates().reverse(); // newest first
  const zones = getTrainingZones();
  const outdatedZones = zones?.status === "outdated-needs-refresh";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SST — Single Source of Truth</h1>
        <p className="text-sm text-muted-foreground">
          Training feedback Pete sends Loren via Xhale, alongside the day&apos;s session data.
          Vault canonical; this page reads the synced JSON.
        </p>
      </div>

      {outdatedZones && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            <span className="font-medium">Zone labels use July 2025 calibration.</span>{" "}
            <Link href="/zones" className="underline">View / refresh zones</Link>.
          </CardContent>
        </Card>
      )}

      {dates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <p className="text-base">No feedback entries yet.</p>
            <p className="mt-2">
              When Pete logs a feedback note via Cowork, it lands here.
              Process: <code>Library/processes/training-feedback-loop.md</code>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dates.map((d) => {
            const entry = getFeedback(d);
            if (!entry) return null;
            return (
              <Link key={d} href={`/sst/${d}`} className="block">
                <Card className="transition hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-baseline justify-between text-base">
                      <span>{formatDate(d)}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {entry.entries.length} session{entry.entries.length === 1 ? "" : "s"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    {entry.entries.map((s, i) => (
                      <SessionRow key={i} session={s} />
                    ))}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: FeedbackSessionEntry }) {
  const tone = toneFor(session.session_type);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
        {session.session_type}
      </span>
      <span className="text-muted-foreground">{session.sport}</span>
      {session.headline && (
        <span className="text-muted-foreground">· {session.headline}</span>
      )}
      {session.feedback_text && (
        <span className="line-clamp-1 text-muted-foreground">
          — {session.feedback_text.slice(0, 90)}
          {session.feedback_text.length > 90 ? "…" : ""}
        </span>
      )}
    </div>
  );
}
