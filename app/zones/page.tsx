import { getTrainingZones } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zones · Pete · Health",
};

// Color tone per zone — lightest at the top, hottest at the bottom.
const ZONE_TONES: Record<string, { bar: string; text: string }> = {
  competent: { bar: "bg-slate-200", text: "text-slate-900" },
  chilled: { bar: "bg-sky-200", text: "text-sky-900" },
  comfortable: { bar: "bg-emerald-200", text: "text-emerald-900" },
  controlled: { bar: "bg-teal-300", text: "text-teal-900" },
  challenging: { bar: "bg-amber-300", text: "text-amber-900" },
  candy: { bar: "bg-orange-300", text: "text-orange-900" },
  critical: { bar: "bg-rose-400", text: "text-rose-50" },
  crazy: { bar: "bg-red-600", text: "text-red-50" },
};

function toneFor(slug: string) {
  return ZONE_TONES[slug] ?? { bar: "bg-muted", text: "text-foreground" };
}

export default function ZonesPage() {
  const zones = getTrainingZones();

  if (!zones) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Training intensity zones</h1>
          <p className="text-sm text-muted-foreground">Calibration data not loaded.</p>
        </div>
      </div>
    );
  }

  const outdated = zones.status === "outdated-needs-refresh";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training intensity zones</h1>
        <p className="text-sm text-muted-foreground">
          {zones.framework} · calibration last filled {zones.calibration_date} for {zones.athlete}
        </p>
      </div>

      {outdated && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            <div className="font-medium">Numbers are outdated.</div>
            <div className="mt-1">
              {zones.outdated_reason ?? "Calibration is older than the current fitness state."}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            How to read this
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Anchor:</span> {zones.framework_anchor}</p>
          <p><span className="font-medium">Bike power notation:</span> {zones.power_notation}</p>
          <p><span className="font-medium">8 zones</span> — alphabetical alliteration, lightest at the top.</p>
        </CardContent>
      </Card>

      {/* Per-zone cards (mobile-friendly, primary view) */}
      <div className="space-y-3">
        {zones.zones.map((z) => {
          const tone = toneFor(z.slug);
          return (
            <Card key={z.slug} className="overflow-hidden">
              <div className={`flex ${tone.bar}`}>
                <div className={`px-4 py-3 ${tone.text}`}>
                  <div className="text-lg font-bold">{z.name}</div>
                  <div className="text-xs opacity-90">{z.definition} · RPE {z.rpe}</div>
                </div>
              </div>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm italic text-muted-foreground">{z.feel}</p>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <Stat label="Bike HR" value={z.bike_hr} />
                  <Stat label="Bike Power (W)" value={z.bike_power_w} />
                  <Stat label="Run HR" value={z.run_hr} />
                  <Stat label="Run Pace /km" value={z.run_pace_per_km} />
                  <Stat label="Treadmill kph" value={z.treadmill_kph} />
                  <Stat label="RPE" value={z.rpe} />
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Use:</span> {z.use_cases}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Compact summary table (desktop-leaning, scroll-on-narrow) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Summary table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <Th>Zone</Th>
                  <Th>RPE</Th>
                  <Th>Bike HR</Th>
                  <Th>Bike Power W</Th>
                  <Th>Run HR</Th>
                  <Th>Run Pace</Th>
                  <Th>Treadmill</Th>
                </tr>
              </thead>
              <tbody>
                {zones.zones.map((z) => {
                  const tone = toneFor(z.slug);
                  return (
                    <tr key={z.slug} className="border-t">
                      <Td>
                        <span className={`inline-block rounded px-2 py-0.5 ${tone.bar} ${tone.text} font-medium`}>
                          {z.name}
                        </span>
                      </Td>
                      <Td>{z.rpe}</Td>
                      <Td>{z.bike_hr}</Td>
                      <Td>{z.bike_power_w}</Td>
                      <Td>{z.run_hr}</Td>
                      <Td>{z.run_pace_per_km}</Td>
                      <Td>{z.treadmill_kph}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Source of truth: vault file <code>Personal/passion-fit/coaching/training-zones-pete.md</code>.
        Edits there sync to this page.
      </p>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-muted-foreground">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
