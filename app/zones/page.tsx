import { getTrainingZones } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import type { TrainingZone } from "@/lib/types";

export const metadata: Metadata = {
  title: "Zones · Pete · Health",
};

// Bold colour-tier per zone, lightest at the top → hottest at the bottom.
// Uses gradients + strong saturation so the chart actually pops.
const ZONE_TIER: Record<string, { gradient: string; text: string; ring: string; chip: string }> = {
  competent: {
    gradient: "from-slate-100 to-slate-200",
    text: "text-slate-900",
    ring: "ring-slate-300",
    chip: "bg-slate-700 text-slate-50",
  },
  chilled: {
    gradient: "from-sky-100 to-sky-200",
    text: "text-sky-950",
    ring: "ring-sky-300",
    chip: "bg-sky-600 text-sky-50",
  },
  comfortable: {
    gradient: "from-emerald-100 to-emerald-200",
    text: "text-emerald-950",
    ring: "ring-emerald-300",
    chip: "bg-emerald-600 text-emerald-50",
  },
  controlled: {
    gradient: "from-teal-200 to-teal-300",
    text: "text-teal-950",
    ring: "ring-teal-400",
    chip: "bg-teal-700 text-teal-50",
  },
  challenging: {
    gradient: "from-amber-200 to-amber-300",
    text: "text-amber-950",
    ring: "ring-amber-400",
    chip: "bg-amber-700 text-amber-50",
  },
  candy: {
    gradient: "from-orange-200 to-orange-400",
    text: "text-orange-950",
    ring: "ring-orange-400",
    chip: "bg-orange-700 text-orange-50",
  },
  critical: {
    gradient: "from-rose-300 to-rose-500",
    text: "text-rose-950",
    ring: "ring-rose-400",
    chip: "bg-rose-700 text-rose-50",
  },
  crazy: {
    gradient: "from-red-500 to-red-700",
    text: "text-red-50",
    ring: "ring-red-500",
    chip: "bg-red-900 text-red-50",
  },
};

function tierFor(slug: string) {
  return ZONE_TIER[slug] ?? {
    gradient: "from-muted to-muted",
    text: "text-foreground",
    ring: "ring-border",
    chip: "bg-foreground text-background",
  };
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {zones.framework}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Training intensity zones</h1>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>
            Last calibrated <span className="font-medium text-foreground">{zones.calibration_date}</span>
          </div>
          <div>for {zones.athlete}</div>
        </div>
      </div>

      {outdated && (
        <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold">Numbers are outdated.</div>
          <div className="mt-0.5">
            {zones.outdated_reason ?? "Calibration older than current fitness state."}
          </div>
        </div>
      )}

      {/* SUMMARY CHART — the hero, at the top */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">At a glance</h2>
          <p className="text-xs text-muted-foreground">Click any row for the feel + use cases</p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {/* Table head */}
          <div className="hidden grid-cols-[minmax(8rem,1.4fr)_5rem_1fr_1fr_1fr_1fr_1fr] gap-2 border-b bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <div>Zone</div>
            <div className="text-center">RPE</div>
            <div className="text-center">Bike HR</div>
            <div className="text-center">Bike W</div>
            <div className="text-center">Run HR</div>
            <div className="text-center">Run /km</div>
            <div className="text-center">Tread kph</div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {zones.zones.map((z) => (
              <ZoneRow key={z.slug} z={z} />
            ))}
          </div>
        </div>

        <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Anchor:</span> {zones.framework_anchor}{" "}
          <span className="ml-3 font-semibold text-foreground">Power:</span> {zones.power_notation}
        </div>
      </section>

      {/* Definitions — accordion-style detail cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">How each zone feels</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {zones.zones.map((z) => (
            <ZoneFeelCard key={z.slug} z={z} />
          ))}
        </div>
      </section>

      <p className="pt-2 text-xs text-muted-foreground">
        Source of truth: vault file{" "}
        <code className="rounded bg-muted px-1 py-0.5">Personal/passion-fit/coaching/training-zones-pete.md</code>.
        Intensity words are <span className="font-semibold">feelings</span>, not prescriptions — the
        chart is orientation, actual numbers always come from Garmin.
      </p>
    </div>
  );
}

function ZoneRow({ z }: { z: TrainingZone }) {
  const tier = tierFor(z.slug);
  return (
    <details className="group">
      <summary className="grid cursor-pointer list-none grid-cols-[minmax(8rem,1.4fr)_5rem_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-3 transition hover:bg-muted/40 sm:gap-2">
        {/* Zone name with coloured tier band */}
        <div className="flex items-center gap-3">
          <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${tier.gradient}`} />
          <div className="leading-tight">
            <div className="font-bold">{z.name}</div>
            <div className="text-xs text-muted-foreground sm:hidden">{z.definition}</div>
          </div>
        </div>
        {/* RPE chip */}
        <div className="text-center">
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${tier.chip}`}>
            {z.rpe}
          </span>
        </div>
        {/* Stats — hidden on mobile (the feel-card below holds them) */}
        <Cell value={z.bike_hr} />
        <Cell value={z.bike_power_w} />
        <Cell value={z.run_hr} />
        <Cell value={z.run_pace_per_km} />
        <Cell value={z.treadmill_kph} />
      </summary>

      {/* Expanded definition row */}
      <div className={`border-t border-l-4 bg-gradient-to-r ${tier.gradient} ${tier.text} ${tier.ring} ring-1 ring-inset px-4 py-3 sm:px-6`}>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {z.definition} · RPE {z.rpe}
        </div>
        <p className="mt-1 text-sm italic">{z.feel}</p>
        <p className="mt-2 text-xs opacity-80">
          <span className="font-semibold">Use:</span> {z.use_cases}
        </p>
        {/* Mobile-only stats grid */}
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:hidden">
          <StatPair label="Bike HR" value={z.bike_hr} />
          <StatPair label="Bike Power" value={z.bike_power_w} />
          <StatPair label="Run HR" value={z.run_hr} />
          <StatPair label="Run Pace" value={z.run_pace_per_km} />
          <StatPair label="Treadmill" value={z.treadmill_kph} />
        </dl>
      </div>
    </details>
  );
}

function Cell({ value }: { value: string }) {
  const muted = value === "N/A" || value.toLowerCase().includes("uncertain");
  return (
    <div
      className={`hidden text-center text-xs tabular-nums sm:block sm:text-sm ${
        muted ? "text-muted-foreground" : ""
      }`}
    >
      {value}
    </div>
  );
}

function StatPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider opacity-70">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function ZoneFeelCard({ z }: { z: TrainingZone }) {
  const tier = tierFor(z.slug);
  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-r ${tier.gradient} ${tier.text} px-4 py-3`}>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-lg font-bold">{z.name}</div>
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${tier.chip}`}>
            RPE {z.rpe}
          </span>
        </div>
        <div className="text-xs opacity-80">{z.definition}</div>
      </div>
      <CardContent className="space-y-2 p-4 text-sm">
        <p className="italic">{z.feel}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Use:</span> {z.use_cases}
        </p>
      </CardContent>
    </Card>
  );
}
