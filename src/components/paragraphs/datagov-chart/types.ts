export type ChartType = "bar" | "line" | "scatter";

export interface DataGovDataPoint {
  date: string;               // "2024-10"
  label: string;              // "October 2024"
  unemployment: number | null;
  cpi: number | null;
}

export interface DataGovChartApiResponse {
  chart_type: ChartType;
  limit: number;
  count: number;
  data: DataGovDataPoint[];
}

export interface DataGovChartData {
  id: string;
  heading?: string;
  defaultChartType: ChartType;
  limit: number;
  apiPath: string;
  csvPath: string;
  source: string;
}
