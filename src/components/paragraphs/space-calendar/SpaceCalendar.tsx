"use client";

import { useState, useEffect, useCallback } from "react";
import type { SpaceEvent, SpaceEventType } from "./types";
import { EVENT_TYPE_LABELS } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: SpaceEventType[] = ["FLR", "CME", "GST", "SEP"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start: toISO(start), end: toISO(end) };
}

function getEventId(event: SpaceEvent): string {
  return (
    (event.flrID ?? event.cmeID ?? event.gstID ?? event.sepID ?? "") +
    (event.beginTime ?? "")
  );
}

function getEventDate(event: SpaceEvent): string {
  const raw = event.beginTime ?? event.peakTime ?? "";
  return raw ? raw.split("T")[0] : "";
}

function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  return iso.replace("T", " ").replace("Z", " UTC");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventCard({ event, type }: { event: SpaceEvent; type: SpaceEventType }) {
  const label = EVENT_TYPE_LABELS[type];
  return (
    <div
      style={{
        borderLeft: "3px solid var(--color-accent-purple)",
        paddingLeft: 12,
        marginBottom: 16,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          style={{
            fontFamily: "var(--font-header)",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-accent-purple)",
            border: "1px solid var(--color-accent-purple)",
            borderRadius: 2,
            padding: "1px 5px",
          }}
        >
          {type}
        </span>
        {event.classType && (
          <span style={{ fontFamily: "var(--font-header)", fontSize: 13, color: "#fff" }}>
            {event.classType}
          </span>
        )}
      </div>

      <p style={{ fontFamily: "var(--font-header)", fontSize: 13, color: "#fff", marginBottom: 4 }}>
        {label}
      </p>

      {event.beginTime && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>
          Begin: {formatTime(event.beginTime)}
        </p>
      )}
      {event.peakTime && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>
          Peak: {formatTime(event.peakTime)}
        </p>
      )}
      {event.sourceLocation && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>
          Source: {event.sourceLocation}
        </p>
      )}
      {event.note && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--color-muted)",
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {event.note}
        </p>
      )}
      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-header)",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--color-accent-purple)",
            textDecoration: "none",
            display: "inline-block",
            marginTop: 4,
          }}
        >
          VIEW REPORT →
        </a>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SpaceCalendarProps {
  heading?: string;
}

export default function SpaceCalendar({ heading }: SpaceCalendarProps) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toISO(today));
  const [eventType, setEventType] = useState<SpaceEventType>("FLR");
  const [events, setEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = getMonthRange(year, month);
    try {
      const res = await fetch(
        `/api/space-events?type=${eventType}&startDate=${start}&endDate=${end}`,
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events ?? []);
      }
    } catch {
      setError("Failed to load events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month, eventType]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Days that have at least one event this month
  const eventDays = new Set(events.map(getEventDate));

  // Events for the selected day
  const dayEvents = events.filter((e) => getEventDate(e) === selectedDate);

  // Build calendar grid
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">
        {/* Section header */}
        <div className="article-list-header" style={{ marginBottom: 20 }}>
          <div className="article-list-header__line" />
          <div className="article-list-header__badge">
            {heading ?? "Space Weather Events"}
          </div>
        </div>

        {/* Layout: calendar left, events right */}
        <div
          className="flex flex-col lg:flex-row gap-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            padding: 24,
          }}
        >
          {/* ── Left: calendar ── */}
          <div className="flex-1 min-w-0">
            {/* Event type tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {EVENT_TYPES.map((t) => {
                const active = t === eventType;
                return (
                  <button
                    key={t}
                    onClick={() => setEventType(t)}
                    style={{
                      fontFamily: "var(--font-header)",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 2,
                      border: `1px solid ${active ? "var(--color-accent-purple)" : "var(--color-border)"}`,
                      background: active ? "rgba(147,51,234,0.15)" : "transparent",
                      color: active ? "var(--color-accent-purple)" : "var(--color-muted)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="hover:opacity-70 transition-opacity focus:outline-none"
                style={{ color: "var(--color-muted)", fontSize: 18 }}
              >
                ‹
              </button>
              <p style={{ fontFamily: "var(--font-header)", fontSize: 13, letterSpacing: "0.1em", color: "#fff" }}>
                {MONTHS[month]} {year}
              </p>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="hover:opacity-70 transition-opacity focus:outline-none"
                style={{ color: "var(--color-muted)", fontSize: 18 }}
              >
                ›
              </button>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d}
                  style={{
                    fontFamily: "var(--font-header)",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    textAlign: "center",
                    padding: "4px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const hasEvent = eventDays.has(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === toISO(today);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "8px 4px",
                      borderRadius: 3,
                      border: isSelected
                        ? "1px solid var(--color-accent-purple)"
                        : isToday
                        ? "1px solid var(--color-border)"
                        : "1px solid transparent",
                      background: isSelected
                        ? "rgba(147,51,234,0.2)"
                        : "transparent",
                      color: isSelected ? "#fff" : isToday ? "#fff" : "var(--color-muted)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.1s",
                    }}
                  >
                    {day}
                    {hasEvent && (
                      <span
                        style={{
                          display: "block",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "var(--color-accent-purple)",
                          margin: "2px auto 0",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading / error */}
            {loading && (
              <p style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.1em", color: "var(--color-muted)", marginTop: 16 }}>
                LOADING…
              </p>
            )}
            {error && !loading && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", marginTop: 16 }}>
                {error}
              </p>
            )}
          </div>

          {/* ── Right: events panel ── */}
          <div
            className="lg:w-72 flex-shrink-0"
            style={{ borderTop: "1px solid var(--color-border)" }}
            // On desktop, switch to left border
          >
            <div className="lg:border-t-0 lg:border-l lg:pl-6 pt-6 lg:pt-0" style={{ borderColor: "var(--color-border)" }}>
              <p
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: 16,
                }}
              >
                {selectedDate}
              </p>

              {dayEvents.length === 0 && !loading && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)", opacity: 0.6 }}>
                  No {EVENT_TYPE_LABELS[eventType].toLowerCase()} recorded on this date.
                </p>
              )}

              {dayEvents.map((event) => (
                <EventCard key={getEventId(event)} event={event} type={eventType} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
