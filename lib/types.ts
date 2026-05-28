export interface JournalEntry {
  date: string;
  exists: true;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ActivitySplit {
  split_type: string | null;
  duration_sec: number | null;
  distance_m: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_speed_mps: number | null;
  // New rich fields (post 2026-05-28; older days lack them).
  avg_power_w?: number | null;
  max_power_w?: number | null;
  normalized_power_w?: number | null;
  avg_cadence?: number | null;
  max_cadence?: number | null;
  elevation_gain_m?: number | null;
  calories?: number | null;
}

export interface HRZones {
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  z5: number;
}

export interface Activity {
  // Preserved shallow shape — Day-view cards keep rendering unchanged.
  name: string;
  sport: string;
  start_local: string | null;
  duration_min: number;
  distance_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  calories: number | null;
  elevation_gain_m: number | null;
  // Rich fields (all optional — older backfilled days may lack them).
  activity_id?: number | null;
  duration_sec?: number | null;
  distance_m?: number | null;
  moving_duration_sec?: number | null;
  aerobic_te?: number | null;
  aerobic_te_msg?: string | null;
  anaerobic_te?: number | null;
  anaerobic_te_msg?: string | null;
  te_label?: string | null;
  training_load?: number | null;
  hr_zones?: HRZones | null;
  hr_zone_total_sec?: number | null;
  avg_speed_mps?: number | null;
  max_speed_mps?: number | null;
  pace_min_per_km?: number | null;
  pace_sec_per_100m?: number | null;
  moderate_intensity_min?: number | null;
  vigorous_intensity_min?: number | null;
  run_cadence_avg_spm?: number | null;
  run_cadence_max_spm?: number | null;
  bike_power_avg_w?: number | null;
  bike_power_max_w?: number | null;
  bike_power_normalized_w?: number | null;
  bike_intensity_factor?: number | null;
  bike_tss?: number | null;
  swim_strokes?: number | null;
  swim_avg_strokes_per_length?: number | null;
  swim_cadence_avg_spm?: number | null;
  swim_avg_swolf?: number | null;
  swim_fastest_100_sec?: number | null;
  swim_active_lengths?: number | null;
  swim_pool_length_m?: number | null;
  lap_count?: number | null;
  splits?: ActivitySplit[];
}

export interface RacePredictions {
  calendar_date: string | null;
  time_5k_sec: number | null;
  time_10k_sec: number | null;
  time_half_marathon_sec: number | null;
  time_marathon_sec: number | null;
}

export interface TrainingBlock {
  status_int: number | null;
  status_label: string | null;
  status_phrase: string | null;
  fitness_trend: number | null;
  primary_sport: string | null;
  since_date: string | null;
  acute_load: number | null;
  chronic_load: number | null;
  acwr_ratio: number | null;
  acwr_status: string | null;
  acwr_percent: number | null;
  load_tunnel_min: number | null;
  load_tunnel_max: number | null;
  vo2_max: number | null;
  vo2_max_date: string | null;
  fitness_age: number | null;
  race_predictions: RacePredictions;
}

export interface WeeklyTrainingRollup {
  iso_week: string;
  days_with_data: number;
  activity_count: number;
  duration_min_by_sport: Record<string, number>;
  distance_km_by_sport: Record<string, number>;
  longest_session_min_by_sport: Record<string, number>;
  total_training_load: number;
  hr_time_by_zone: HRZones;
  z2_percent: number | null;
  aerobic_effect_distribution: Record<string, number>;
  intensity_min_moderate: number;
  intensity_min_vigorous: number;
  acwr_avg: number | null;
  acwr_count: number;
  status_phrases: string[];
}

export interface GarminDay {
  date: string; // ISO YYYY-MM-DD — the CALENDAR DAY (daytime + sleep at end of that day)
  day_of_week: string;
  recovery_query_date: string;
  journal: JournalEntry | null;
  signoff?: {
    detected: string | null;
    detected_iso: string | null;
    confirmed: string | null;
    source: string;
  } | null;
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
  training?: TrainingBlock | null;
}

export interface WeeklySummary {
  iso_week: string; // "2026-W22"
  exists: true;
  frontmatter: Record<string, unknown>;
  body: string;
}

// ---- Passion Fit training zones ----

export interface TrainingZone {
  name: string;
  slug: string;
  definition: string;
  feel: string;
  rpe: string;
  bike_hr: string;
  bike_power_w: string;
  run_hr: string;
  run_pace_per_km: string;
  treadmill_kph: string;
  use_cases: string;
}

export interface TrainingZones {
  schema_version: number;
  athlete: string;
  calibration_date: string;
  status: "active" | "outdated-needs-refresh";
  outdated_reason?: string;
  framework: string;
  framework_anchor: string;
  power_notation: string;
  zones: TrainingZone[];
}

// ---- Coaching feedback (SST) ----

export interface FeedbackSessionEntry {
  time: string;
  garmin_activity_id?: number | null;
  activity_name?: string;
  sport: string;
  session_type: string;
  distance_km?: number;
  duration_min?: number;
  avg_hr?: number;
  max_hr?: number;
  effort_perceived?: number;
  feedback_text: string;
  headline?: string;
  notes_tags?: string[];
  sent_via?: string;
}

export interface FeedbackEntry {
  schema_version: number;
  date: string;
  garmin_tracked: boolean;
  pending_garmin_backfill?: boolean;
  entries: FeedbackSessionEntry[];
}
