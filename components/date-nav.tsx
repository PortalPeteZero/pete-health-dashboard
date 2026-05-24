"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavOption {
  value: string;
  label: string;
  href: string;
}

export function DateNav({
  label,
  prevHref,
  nextHref,
  options,
  currentValue,
}: {
  label: string;
  prevHref: string | null;
  nextHref: string | null;
  options?: NavOption[];
  currentValue?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-2">
      <NavArrow href={prevHref} dir="prev" />
      <div className="flex-1 text-center">
        {options ? (
          <select
            value={currentValue}
            onChange={(e) => {
              const opt = options.find((o) => o.value === e.target.value);
              if (opt) router.push(opt.href);
            }}
            className="cursor-pointer rounded-md border bg-background px-3 py-1.5 text-center text-sm font-semibold"
            aria-label="Jump to date"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-semibold">{label}</span>
        )}
      </div>
      <NavArrow href={nextHref} dir="next" />
    </div>
  );
}

function NavArrow({ href, dir }: { href: string | null; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  const base =
    "flex h-9 w-9 items-center justify-center rounded-md border transition-colors";
  if (!href) {
    return (
      <span className={cn(base, "cursor-not-allowed opacity-30")}>
        <Icon className="h-4 w-4" />
      </span>
    );
  }
  return (
    <Link href={href} className={cn(base, "hover:bg-accent")} aria-label={dir}>
      <Icon className="h-4 w-4" />
    </Link>
  );
}
