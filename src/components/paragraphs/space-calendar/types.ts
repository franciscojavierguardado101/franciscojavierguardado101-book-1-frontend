export type SpaceEventType = "FLR" | "CME" | "GST" | "SEP";

export const EVENT_TYPE_LABELS: Record<SpaceEventType, string> = {
  FLR: "Solar Flares",
  CME: "Coronal Mass Ejections",
  GST: "Geomagnetic Storms",
  SEP: "Solar Energetic Particles",
};

// Raw shape returned by DONKI — fields vary per event type
// FLR: beginTime/peakTime/endTime
// CME: startTime (no beginTime)
// GST: startTime (no beginTime)
// SEP: beginTime
export interface SpaceEvent {
  flrID?: string;
  cmeID?: string;
  activityID?: string;
  gstID?: string;
  sepID?: string;
  beginTime?: string;
  startTime?: string;
  peakTime?: string;
  endTime?: string;
  classType?: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  note?: string;
  linkedEvents?: Array<{ activityID: string }>;
  link?: string;
  [key: string]: unknown;
}

export interface SpaceCalendarData {
  id: string;
  heading?: string;
}

export interface SpaceEventsApiResponse {
  events: SpaceEvent[];
  eventType: SpaceEventType;
  error?: string;
}
