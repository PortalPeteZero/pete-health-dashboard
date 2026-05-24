import {
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  MountainSnow,
  HeartPulse,
  Activity as ActivityIcon,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  running: Footprints,
  treadmill_running: Footprints,
  trail_running: Footprints,
  track_running: Footprints,
  walking: Footprints,
  hiking: MountainSnow,
  cycling: Bike,
  road_biking: Bike,
  indoor_cycling: Bike,
  mountain_biking: Bike,
  gravel_cycling: Bike,
  open_water_swimming: Waves,
  lap_swimming: Waves,
  swimming: Waves,
  strength_training: Dumbbell,
  indoor_cardio: HeartPulse,
  cardio: HeartPulse,
  yoga: ActivityIcon,
};

export function SportIcon({
  sport,
  className = "h-4 w-4",
}: {
  sport: string;
  className?: string;
}) {
  const Icon = MAP[sport] || ActivityIcon;
  return <Icon className={className} />;
}
