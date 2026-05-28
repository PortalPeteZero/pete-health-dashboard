import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { NavTabs } from "@/components/nav-tabs";
import { ServiceWorkerRegistrar } from "@/components/sw-register";
import { getLatestDate, getLatestWeek, getLatestMonth } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pete · Health",
  description: "Personal health + fitness dashboard.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Health",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const latest = getLatestDate();
  const week = getLatestWeek();
  const { year, month } = getLatestMonth();

  const items = [
    { label: "Day", href: `/day/${latest}`, match: "/day" },
    { label: "Training", href: `/training/${latest}`, match: "/training" },
    { label: "Week", href: `/week/${week}`, match: "/week" },
    { label: "Month", href: `/month/${year}/${month}`, match: "/month" },
    { label: "90 days", href: "/90-days", match: "/90-days" },
    { label: "Zones", href: "/zones", match: "/zones" },
    { label: "Reports", href: "/reports", match: "/reports" },
    { label: "Coach", href: "/coach", match: "/coach" },
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ServiceWorkerRegistrar />

        {/* Brand strip — slim top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/day/${latest}`}
              className="group flex items-center gap-2.5 self-start text-base font-bold tracking-tight"
            >
              <span
                aria-hidden
                className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-extrabold text-white shadow-sm transition group-hover:shadow"
              >
                P
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-extrabold tracking-tight">
                  Pete <span className="text-emerald-600">·</span> Health
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  HIM build
                </span>
              </span>
            </Link>
            <NavTabs items={items} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
            <p>Garmin Connect data · updated twice daily · private</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Single source of truth
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
