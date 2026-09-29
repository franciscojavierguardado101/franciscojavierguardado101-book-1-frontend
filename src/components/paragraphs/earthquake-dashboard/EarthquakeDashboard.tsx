"use client";

import { useState, useEffect } from "react";
import type { EarthquakeDashboardData, EarthquakeFeature, TimeRange } from "./types";
import { TIME_RANGE_LABELS } from "./types";

interface Props {
  data: EarthquakeDashboardData;
}

const MAG_CATEGORIES = [
  { label: "Minor", min: 0, max: 3, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { label: "Moderate", min: 3, max: 5, color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  { label: "Strong", min: 5, max: 6, color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  { label: "Major", min: 6, max: Infinity, color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
] as const;

function getMagStyle(mag: number): { color: string; bg: string } {
  for (const cat of MAG_CATEGORIES) {
    if (mag >= cat.min && mag < cat.max) return { color: cat.color, bg: cat.bg };
  }
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function EarthquakeDashboard({ data }: Props) {
  const { heading, defaultRange } = data;
  const [range, setRange] = useState<TimeRange>(defaultRange ?? "day");
  const [features, setFeatures] = useState<EarthquakeFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const USGS_URLS: Record<TimeRange, string> = {
    hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
    month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(USGS_URLS[range])
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.features ?? []).map((f: any) => ({
          id: f.id,
          mag: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          depth: f.geometry.coordinates[2],
          url: f.properties.url,
        }));
        setFeatures(mapped);
      })
      .catch(() => setError("Failed to load earthquake data."))
      .finally(() => setLoading(false));
  }, [range]);

  const counts = MAG_CATEGORIES.map((cat) => ({
    ...cat,
    count: features.filter((f) => f.mag >= cat.min && f.mag < cat.max).length,
  }));

  return (
    <section style={{ padding: "64px 0", background: "#0d0d0d" }}>
      <div className="page-width">
        {heading && (
          <h2
            style={{
              fontFamily: "var(--font-header)",
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              letterSpacing: "0.04em",
              color: "#fff",
              marginBottom: 32,
              lineHeight: 1.2,
            }}
          >
            {heading}
          </h2>
        )}

        {/* Time range tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "8px 20px",
                borderRadius: 4,
                border: "1px solid",
                borderColor: range === r ? "#f97316" : "rgba(255,255,255,0.15)",
                background: range === r ? "rgba(249,115,22,0.15)" : "transparent",
                color: range === r ? "#f97316" : "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: range === r ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {TIME_RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Severity stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {counts.map((cat) => (
            <div
              key={cat.label}
              style={{
                background: cat.bg,
                border: `1px solid ${cat.color}33`,
                borderRadius: 8,
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  fontWeight: 700,
                  color: cat.color,
                  fontFamily: "var(--font-header)",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {loading ? "-" : cat.count.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 4,
                }}
              >
                {cat.max === Infinity ? `M ${cat.min}+` : `M ${cat.min}–${cat.max}`}
              </div>
            </div>
          ))}
        </div>

        {/* Event list */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {loading
                ? "Loading..."
                : error
                  ? "Error loading data"
                  : `${features.length.toLocaleString()} events`}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Source: USGS
            </span>
          </div>

          {error && (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                fontFamily: "var(--font-body)",
                color: "#dc2626",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {!error && (
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 32,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.06)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 12,
                          width: "60%",
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.06)",
                          marginBottom: 8,
                        }}
                      />
                      <div
                        style={{
                          height: 10,
                          width: "35%",
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : features.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    fontFamily: "var(--font-body)",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.875rem",
                  }}
                >
                  No earthquakes recorded for this period.
                </div>
              ) : (
                features.map((f) => {
                  const { color, bg } = getMagStyle(f.mag);
                  return (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        textDecoration: "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Magnitude badge */}
                      <div
                        style={{
                          minWidth: 52,
                          textAlign: "center",
                          background: bg,
                          border: `1px solid ${color}44`,
                          borderRadius: 4,
                          padding: "4px 6px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.65rem",
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "var(--font-body)",
                            letterSpacing: "0.05em",
                            lineHeight: 1,
                          }}
                        >
                          MAG
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color,
                            fontFamily: "var(--font-header)",
                            lineHeight: 1.2,
                          }}
                        >
                          {f.mag != null ? f.mag.toFixed(1) : "?"}
                        </div>
                      </div>

                      {/* Location + meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginBottom: 4,
                          }}
                        >
                          {f.place ?? "Unknown location"}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.75rem",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          {f.depth != null ? `${f.depth} km depth` : "depth unknown"} &middot;{" "}
                          {timeAgo(f.time)}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        &#8599;
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
