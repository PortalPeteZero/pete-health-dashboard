const BANDS = [
  { label: "80+", color: "#16a34a" },
  { label: "65–79", color: "#84cc16" },
  { label: "50–64", color: "#f59e0b" },
  { label: "below 50", color: "#ef4444" },
];

export function SleepLegend({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground ${className}`}
    >
      <span className="font-medium">Sleep score</span>
      {BANDS.map((b) => (
        <span key={b.label} className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: b.color }}
          />
          {b.label}
        </span>
      ))}
    </div>
  );
}
