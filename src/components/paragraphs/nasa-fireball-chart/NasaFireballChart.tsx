"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { NasaFireballChartData, ChartType, ChartApiResponse, FireballDataPoint } from "./types";

const CHART_TABS: { key: ChartType; label: string }[] = [
  { key: "bar",     label: "Bar"     },
  { key: "line",    label: "Line"    },
  { key: "scatter", label: "Scatter" },
];

const ACCENT = "#f97316";
const ACCENT_DIM = "rgba(249,115,22,0.55)";
const GRID = "rgba(255,255,255,0.07)";

function energyColor(val: number | null): string {
  if (val === null) return ACCENT_DIM;
  if (val >= 100) return "#dc2626";
  if (val >= 10)  return "#f97316";
  if (val >= 1)   return "#eab308";
  return "#22c55e";
}

function shortDate(iso: string): string {
  return iso.slice(0, 10);
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number | null; payload: FireballDataPoint }[];
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
      lineHeight: 1.8,
    }}>
      <div style={{ color: ACCENT, marginBottom: 4, fontWeight: 600 }}>{d.date}</div>
      {d.energy        !== null && <div>Radiated energy: <b>{d.energy} J×10¹⁰</b></div>}
      {d.impact_energy !== null && <div>Impact energy: <b>{d.impact_energy} kt</b></div>}
      {d.velocity      !== null && <div>Velocity: <b>{d.velocity} km/s</b></div>}
      {d.altitude      !== null && <div>Altitude: <b>{d.altitude} km</b></div>}
      {d.lat           !== null && d.lon !== null && (
        <div>Location: <b>{d.lat.toFixed(1)}°, {d.lon.toFixed(1)}°</b></div>
      )}
    </div>
  );
}

export default function NasaFireballChart({ data }: { data: NasaFireballChartData }) {
  const { heading, defaultChartType, limit } = data;

  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [points, setPoints]       = useState<FireballDataPoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/nasa-fireball-chart?limit=${limit}&chart_type=${chartType}`)
      .then((r) => r.json())
      .then((json: ChartApiResponse) => setPoints(json.data ?? []))
      .catch(() => setError("Failed to load chart data."))
      .finally(() => setLoading(false));
  }, [chartType, limit]);

  const tickStyle = {
    fontFamily: "var(--font-body, monospace)",
    fontSize: 11,
    fill: "rgba(255,255,255,0.4)",
  };

  return (
    <section style={{ padding: "64px 0", background: "#0d0d0d" }}>
      <div className="page-width">

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            {heading && (
              <h2 style={{
                fontFamily: "var(--font-header)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                letterSpacing: "0.04em",
                color: "#fff",
                marginBottom: 6,
                lineHeight: 1.2,
              }}>
                {heading}
              </h2>
            )}
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
              Source: NASA/JPL CNEOS Fireball API &nbsp;·&nbsp; {points.length} events
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
                  background: chartType === tab.key ? "rgba(249,115,22,0.15)" : "transparent",
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 340, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
              Loading chart data…
            </div>
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 340, color: "#dc2626", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {!loading && !error && chartType === "bar" && (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={points} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ ...tickStyle, fontSize: 9 }} tickFormatter={shortDate} angle={-45} textAnchor="end" interval="preserveStartEnd" />
                <YAxis tick={tickStyle} tickFormatter={(v) => `${v}`} label={{ value: "J×10¹⁰", angle: -90, position: "insideLeft", style: tickStyle, dx: -4 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="energy" name="Radiated Energy" radius={[2, 2, 0, 0]}>
                  {points.map((p, i) => (
                    <Cell key={i} fill={energyColor(p.energy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {!loading && !error && chartType === "line" && (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={points} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ ...tickStyle, fontSize: 9 }} tickFormatter={shortDate} angle={-45} textAnchor="end" interval="preserveStartEnd" />
                <YAxis tick={tickStyle} label={{ value: "J×10¹⁰", angle: -90, position: "insideLeft", style: tickStyle, dx: -4 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="energy" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {!loading && !error && chartType === "scatter" && (
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="velocity" name="Velocity" type="number" tick={tickStyle} label={{ value: "Velocity (km/s)", position: "insideBottom", offset: -8, style: tickStyle }} />
                <YAxis dataKey="impact_energy" name="Impact Energy" type="number" tick={tickStyle} label={{ value: "Impact Energy (kt)", angle: -90, position: "insideLeft", style: tickStyle, dx: -4 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }} />
                <Scatter data={points.filter((p) => p.velocity !== null && p.impact_energy !== null)} fill={ACCENT} fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer: CSV download link */}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <a
            href="/api/nasa-fireball-csv"
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
