import { cn } from "@/lib/utils";
import { qualifierClasses, scoreToQualifier } from "@/lib/format";

export function QualifierBadge({
  qualifier,
  score,
  className,
}: {
  qualifier?: string | null;
  score?: number | null;
  className?: string;
}) {
  const q = qualifier || scoreToQualifier(score);
  if (q === "—") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        qualifierClasses(q),
        className,
      )}
    >
      {q}
    </span>
  );
}
