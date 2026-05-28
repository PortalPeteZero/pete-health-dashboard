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
    // Legacy iOS standalone flag (Next emits the newer "mobile-web-app-capable";
    // older iOS only honours the apple-prefixed name).
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
    { label: "SST", href: "/sst", match: "/sst" },
    { label: "Zones", href: "/zones", match: "/zones" },
    { label: "Reports", href: "/reports", match: "/reports" },
    { label: "Coach", href: "/coach", match: "/coach" },
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ServiceWorkerRegistrar />
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/day/${latest}`} className="text-base font-bold">
              Pete · Health
            </Link>
            <NavTabs items={items} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-xs text-muted-foreground">
          Garmin Connect data · updated daily · private
        </footer>
      </body>
    </html>
  );
}
