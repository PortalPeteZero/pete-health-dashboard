import { cn } from "@/lib/utils";
import { hrvStatusClasses } from "@/lib/format";

export function HrvStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        hrvStatusClasses(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
