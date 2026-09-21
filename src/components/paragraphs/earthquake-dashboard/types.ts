export type TimeRange = "hour" | "day" | "week" | "month";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  hour: "Past Hour",
  day: "Past Day",
  week: "Past Week",
  month: "Past Month",
};

export interface EarthquakeFeature {
  id: string;
  mag: number;
  place: string;
  time: number;
  depth: number;
  url: string;
}

export interface EarthquakeApiResponse {
  count: number;
  features: EarthquakeFeature[];
  error?: string;
}

export interface EarthquakeDashboardData {
  id: string;
  heading?: string;
  defaultRange?: TimeRange;
}
