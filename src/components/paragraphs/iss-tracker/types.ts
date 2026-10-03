export interface IssPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: "daylight" | "eclipsed" | string;
  footprint: number;
  timestamp: number;
  error?: string;
}

export interface IssCrew {
  name: string;
  craft: string;
}

export interface IssCrewResponse {
  crew: IssCrew[];
  total: number;
  error?: string;
}

export interface IssTrackerData {
  id: string;
  heading?: string;
}
