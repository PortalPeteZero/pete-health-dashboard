export interface JournalEntry {
  date: string;
  exists: true;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface Activity {
  name: string;
  sport: string;
  start_local: string | null;
  duration_min: number;
  distance_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  calories: number | null;
  elevation_gain_m: number | null;
}

export interface GarminDay {
  date: string; // ISO YYYY-MM-DD — the CALENDAR DAY (daytime + sleep at end of that day)
  day_of_week: string;
  recovery_query_date: string;
  journal: JournalEntry | null;
  sleep: {
    score: number | null;
    qualifier: string | null;
    total_min: number | null;
    deep_min: number | null;
    rem_min: number | null;
    light_min: number | null;
    awake_min: number | null;
  };
  hrv: {
    last_night: number | null;
    last_night_5min_high: number | null;
    weekly_avg: number | null;
    status: string | null;
    feedback_phrase: string | null;
  };
  body_battery: {
    charged: number | null;
    drained: number | null;
    highest: number | null;
    lowest: number | null;
  };
  training_readiness: {
    score: number | null;
    level: string | null;
    feedback_short: string | null;
    feedback_long: string | null;
  };
  daily: {
    steps: number | null;
    step_goal: number | null;
    resting_hr: number | null;
    max_hr: number | null;
    stress_avg: number | null;
    floors: number | null;
    distance_m: number | null;
    active_kcal: number | null;
    total_kcal: number | null;
    intensity_min_moderate: number | null;
    intensity_min_vigorous: number | null;
    vo2_max: number | null;
  };
  activities: Activity[];
}

export interface WeeklySummary {
  iso_week: string; // "2026-W22"
  exists: true;
  frontmatter: Record<string, unknown>;
  body: string;
}
