import fs from "fs";
import path from "path";
import {
  parseISO,
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  addDays,
  format,
  eachDayOfInterval,
} from "date-fns";
import type { GarminDay, WeeklySummary } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "garmin");
const WEEKLY_DIR = path.join(process.cwd(), "data", "weekly");

// ---- Daily ----

export function getAllDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}

export function getDay(date: string): GarminDay | null {
  const fp = path.join(DATA_DIR, `${date}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8")) as GarminDay;
}

export function getLatestDate(): string {
  const all = getAllDates();
  return all[all.length - 1];
}

export function getEarliestDate(): string {
  const all = getAllDates();
  return all[0];
}

export function getDays(start: string, end: string): GarminDay[] {
  return getAllDates()
    .filter((d) => d >= start && d <= end)
    .map((d) => getDay(d))
    .filter((d): d is GarminDay => d !== null);
}

/** The N days up to and including `date` (chronological). Used for sparklines. */
export function getDaysUpTo(date: string, n: number): GarminDay[] {
  const all = getAllDates();
  const idx = all.indexOf(date);
  if (idx === -1) return [];
  const slice = all.slice(Math.max(0, idx - n + 1), idx + 1);
  return slice.map((d) => getDay(d)).filter((d): d is GarminDay => d !== null);
}

// ---- Navigation (daily) ----

export function navigatePrev(date: string): string | null {
  const all = getAllDates();
  const idx = all.indexOf(date);
  return idx > 0 ? all[idx - 1] : null;
}

export function navigateNext(date: string): string | null {
  const all = getAllDates();
  const idx = all.indexOf(date);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

// ---- ISO week helpers ----

/** "2026-W22" -> { start: Monday, end: Sunday } as Date objects (local). */
export function isoWeekRange(isoWeek: string): { start: Date; end: Date } {
  const [yStr, wStr] = isoWeek.split("-W");
  const year = parseInt(yStr, 10);
  const week = parseInt(wStr, 10);
  // Jan 4th is always in ISO week 1.
  const jan4 = new Date(year, 0, 4);
  const monday = startOfISOWeek(addWeeks(jan4, week - 1));
  return { start: monday, end: endOfISOWeek(monday) };
}

/** ISO-week string ("2026-W22") for a given YYYY-MM-DD date string. */
export function dateToISOWeek(date: string): string {
  return format(parseISO(date), "RRRR-'W'II");
}

/** The (up to 7) Garmin days that exist within an ISO week, Mon-Sun. */
export function getWeekDays(isoWeek: string): GarminDay[] {
  const { start, end } = isoWeekRange(isoWeek);
  return getDays(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
}

/** All seven date strings Mon-Sun for an ISO week (whether data exists or not). */
export function isoWeekDateStrings(isoWeek: string): string[] {
  const { start, end } = isoWeekRange(isoWeek);
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

export function navigatePrevWeek(isoWeek: string): string {
  const { start } = isoWeekRange(isoWeek);
  return format(addDays(start, -7), "RRRR-'W'II");
}

export function navigateNextWeek(isoWeek: string): string {
  const { start } = isoWeekRange(isoWeek);
  return format(addDays(start, 7), "RRRR-'W'II");
}

/** ISO weeks that have at least one day of Garmin data — for generateStaticParams. */
export function getAllWeeksWithData(): string[] {
  const weeks = new Set<string>();
  for (const d of getAllDates()) weeks.add(dateToISOWeek(d));
  return Array.from(weeks).sort();
}

export function getLatestWeek(): string {
  return dateToISOWeek(getLatestDate());
}

// ---- Weekly PF entries ----

export function getAllWeekEntries(): string[] {
  if (!fs.existsSync(WEEKLY_DIR)) return [];
  return fs
    .readdirSync(WEEKLY_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}

export function getWeekEntry(isoWeek: string): WeeklySummary | null {
  const fp = path.join(WEEKLY_DIR, `${isoWeek}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8")) as WeeklySummary;
}

export function getLatestWeekEntry(): WeeklySummary | null {
  const all = getAllWeekEntries();
  if (all.length === 0) return null;
  return getWeekEntry(all[all.length - 1]);
}

// ---- Month helpers ----

/** Garmin days within a month (year, month 1-12). */
export function getMonthDays(year: number, month: number): GarminDay[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return getAllDates()
    .filter((d) => d.startsWith(prefix))
    .map((d) => getDay(d))
    .filter((d): d is GarminDay => d !== null);
}

/** "YYYY-MM" strings that have at least one day of data. */
export function getAllMonthsWithData(): string[] {
  const months = new Set<string>();
  for (const d of getAllDates()) months.add(d.slice(0, 7));
  return Array.from(months).sort();
}

export function getLatestMonth(): { year: number; month: number } {
  const latest = getLatestDate();
  return { year: parseInt(latest.slice(0, 4), 10), month: parseInt(latest.slice(5, 7), 10) };
}

export function navigatePrevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function navigateNextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}
