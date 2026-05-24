# pete-health-dashboard

Pete's personal health + fitness dashboard. Pulls daily from Garmin Connect and
renders Day / Week / Month / 90-day / Reports / Coach views.

- **Live:** https://pete-health-dashboard.vercel.app (noindex, share-by-link)
- **Stack:** Next.js + TypeScript + Tailwind + shadcn/ui + Recharts (static-rendered)
- **Data:** static JSON in `data/garmin/` + `data/weekly/`, written daily by the
  `garmin-daily-pull` cron and pushed here (Vercel auto-deploys on push).

Full documentation lives in the vault: `Projects/PA-General/pete-health-dashboard/`.
Built 24 May 2026 as part of the Passion Fit coaching restart.
