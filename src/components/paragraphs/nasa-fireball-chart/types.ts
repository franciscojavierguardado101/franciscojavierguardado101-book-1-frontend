export type ChartType = "bar" | "line" | "scatter";

export interface FireballDataPoint {
  date: string;
  energy: number | null;
  impact_energy: number | null;
  velocity: number | null;
  altitude: number | null;
  lat: number | null;
  lon: number | null;
}

export interface ChartApiResponse {
  chart_type: ChartType;
  limit: number;
  count: number;
  data: FireballDataPoint[];
}

export interface NasaFireballChartData {
  id: string;
  heading?: string;
  defaultChartType: ChartType;
  limit: number;
}
