"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from "recharts";
import type { DataGovChartData, ChartType, DataGovChartApiResponse, DataGovDataPoint } from "./types";

const CHART_TABS: { key: ChartType; label: string }[] = [
  { key: "bar",     label: "Bar"     },
  { key: "line",    label: "Line"    },
  { key: "scatter", label: "Scatter" },
];

// Cyan accent — distinct from the NASA chart's orange
const ACCENT     = "#06b6d4";
const ACCENT_DIM = "rgba(6,182,212,0.50)";
const GRID       = "rgba(255,255,255,0.07)";

// Color-codes bar chart bars by unemployment rate.
function unemploymentColor(val: number | null): string {
  if (val === null) return ACCENT_DIM;
  if (val >= 7)   return "#dc2626"; // red    — high
  if (val >= 5)   return "#f97316"; // orange — elevated
  if (val >= 4)   return "#eab308"; // yellow — moderate
  return "#22c55e";                 // green  — low
}

function shortDate(iso: string): string {
  // "2024-10" → "Oct '24"
  const [year, month] = iso.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number | null; payload: DataGovDataPoint }[];
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#1a1a1a",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 6,
      padding: "10px 14px",
      fontFamily: "var(--font-body, monospace)",
      fontSize: "0.8rem",
      color: "#fff",
      lineHeight: 1.9,
      minWidth: 210,
    }}>
      <div style={{ color: ACCENT, marginBottom: 4, fontWeight: 600 }}>{d.label}</div>
      {d.unemployment !== null && (
        <div>
          Unemployment:{" "}
          <b style={{ color: unemploymentColor(d.unemployment) }}>{d.unemployment}%</b>
        </div>
      )}
      {d.cpi !== null && (
        <div>CPI-U All Items: <b>{d.cpi.toFixed(3)}</b></div>
      )}
    </div>
  );
}

export default function DataGovChart({ data }: { data: DataGovChartData }) {
  const { heading, defaultChartType, limit, apiPath, csvPath, source } = data;

  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [points, setPoints]       = useState<DataGovDataPoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiPath}?limit=${limit}&chart_type=${chartType}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: DataGovChartApiResponse) => setPoints(json.data ?? []))
      .catch(() => setError("Failed to load chart data."))
      .finally(() => setLoading(false));
  }, [chartType, limit, apiPath]);

  const tickStyle = {
    fontFamily: "var(--font-body, monospace)",
    fontSize: 10,
    fill: "rgba(255,255,255,0.4)",
  };

  const scatterPoints = points.filter(
    (p) => p.unemployment !== null && p.cpi !== null
  );

  // Bar chart tooltip subtitle
  const barSubtitle = "Unemployment Rate (%) — last " + points.length + " months";
  const lineSubtitle = "Trend: Unemployment Rate (%)";
  const scatterSubtitle = "Each dot = one month: Unemployment Rate (X) vs CPI-U (Y)";

  const subtitle =
    chartType === "bar"     ? barSubtitle :
    chartType === "line"    ? lineSubtitle :
    scatterSubtitle;

  return (
    <section style={{ padding: "64px 0", background: "#0d0d0d" }}>
      <div className="page-width">

        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 16, marginBottom: 32,
        }}>
          <div>
            {heading && (
              <h2 style={{
                fontFamily: "var(--font-header)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                letterSpacing: "0.04em",
                color: "#fff",
                marginBottom: 4,
                lineHeight: 1.2,
              }}>
                {heading}
              </h2>
            )}
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.35)",
              margin: "0 0 2px",
            }}>
              Source: {source} &nbsp;·&nbsp; {points.length} data points
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.22)",
              margin: 0,
              fontStyle: "italic",
            }}>
              {subtitle}
            </p>
          </div>

          {/* Chart type tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {CHART_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setChartType(tab.key)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: chartType === tab.key ? ACCENT : "rgba(255,255,255,0.15)",
                  background: chartType === tab.key ? "rgba(6,182,212,0.12)" : "transparent",
                  color: chartType === tab.key ? ACCENT : "rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: chartType === tab.key ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "24px 8px 16px",
          minHeight: 380,
        }}>
          {loading && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 340, color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
            }}>
              Loading BLS data…
            </div>
          )}

          {error && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 340, color: "#dc2626",
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          {/* ── BAR ── */}
          {!loading && !error && chartType === "bar" && (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={points} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ ...tickStyle, fontSize: 9 }}
                  tickFormatter={shortDate}
                  angle={-45}
                  textAnchor="end"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={tickStyle}
                  domain={[0, "auto"]}
                  tickFormatter={(v) => `${v}%`}
                  label={{
                    value: "Rate (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: tickStyle,
                    dx: -4,
                  }}
                />
                {/* 4% threshold reference */}
                <ReferenceLine
                  y={4}
                  stroke="rgba(234,179,8,0.4)"
                  strokeDasharray="4 4"
                  label={{ value: "4%", fill: "rgba(234,179,8,0.6)", fontSize: 9, position: "right" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="unemployment" name="Unemployment Rate" radius={[2, 2, 0, 0]}>
                  {points.map((p, i) => (
                    <Cell key={i} fill={unemploymentColor(p.unemployment)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* ── LINE ── */}
          {!loading && !error && chartType === "line" && (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={points} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ ...tickStyle, fontSize: 9 }}
                  tickFormatter={shortDate}
                  angle={-45}
                  textAnchor="end"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={tickStyle}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, "auto"]}
                  label={{
                    value: "Rate (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: tickStyle,
                    dx: -4,
                  }}
                />
                <ReferenceLine
                  y={4}
                  stroke="rgba(234,179,8,0.35)"
                  strokeDasharray="4 4"
                  label={{ value: "4%", fill: "rgba(234,179,8,0.5)", fontSize: 9, position: "right" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="unemployment"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* ── SCATTER ── */}
          {!loading && !error && chartType === "scatter" && (
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 4, right: 24, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis
                  dataKey="unemployment"
                  name="Unemployment Rate"
                  type="number"
                  tick={tickStyle}
                  tickFormatter={(v) => `${v}%`}
                  label={{
                    value: "Unemployment Rate (%)",
                    position: "insideBottom",
                    offset: -10,
                    style: tickStyle,
                  }}
                />
                <YAxis
                  dataKey="cpi"
                  name="CPI-U"
                  type="number"
                  tick={tickStyle}
                  label={{
                    value: "CPI-U (1982-84=100)",
                    angle: -90,
                    position: "insideLeft",
                    style: tickStyle,
                    dx: -4,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }}
                />
                <Scatter
                  data={scatterPoints}
                  fill={ACCENT}
                  fillOpacity={0.75}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Color legend for bar chart */}
        {!loading && !error && chartType === "bar" && (
          <div style={{
            display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap",
            fontFamily: "var(--font-body)", fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
          }}>
            {[
              { color: "#22c55e", label: "< 4%  Low"      },
              { color: "#eab308", label: "4–5%  Moderate"  },
              { color: "#f97316", label: "5–7%  Elevated"  },
              { color: "#dc2626", label: "> 7%  High"      },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  display: "inline-block", width: 10, height: 10,
                  borderRadius: 2, background: color,
                }} />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer: CSV download */}
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <a
            href={csvPath}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              paddingBottom: 1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            Download full dataset as CSV
          </a>
        </div>

      </div>
    </section>
  );
}
