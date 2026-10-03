"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { IssPosition, IssCrew } from "./types";

interface WikiSummary {
  name: string;
  extract: string;
  thumbnail?: string;
  url: string;
}

const IssMap = dynamic(() => import("./IssMap"), { ssr: false });

const MAX_TRACK_POINTS = 60; // 5 minutes at 5s intervals

function formatCoord(val: number, pos: string, neg: string): string {
  return `${Math.abs(val).toFixed(4)}° ${val >= 0 ? pos : neg}`;
}

interface Props {
  heading?: string;
}

export default function IssTracker({ heading }: Props) {
  const [position, setPosition] = useState<IssPosition | null>(null);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [crew, setCrew] = useState<IssCrew[]>([]);
  const [follow, setFollow] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch("/api/iss-tracker?type=position");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPosition(data);
        setLastUpdated(new Date());
        setError(null);
        setTrack((prev) => {
          const next: [number, number][] = [...prev, [data.latitude, data.longitude]];
          return next.length > MAX_TRACK_POINTS ? next.slice(-MAX_TRACK_POINTS) : next;
        });
      }
    } catch {
      setError("Failed to fetch ISS position.");
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    const id = setInterval(fetchPosition, 5000);
    return () => clearInterval(id);
  }, [fetchPosition]);

  useEffect(() => {
    fetch("/api/iss-tracker?type=crew")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setCrew(data.crew ?? []); })
      .catch(() => {});
  }, []);

  const fetchWiki = useCallback(async (name: string) => {
    if (wiki?.name === name) { setWiki(null); return; }
    setWikiLoading(true);
    setWiki(null);
    try {
      const slug = name.replace(/ /g, "_");
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setWiki({
        name,
        extract: data.extract ?? "",
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${slug}`,
      });
    } catch {
      setWiki({ name, extract: "No Wikipedia article found.", url: "" });
    } finally {
      setWikiLoading(false);
    }
  }, [wiki]);

  const stats = position
    ? [
        { label: "Latitude", value: formatCoord(position.latitude, "N", "S") },
        { label: "Longitude", value: formatCoord(position.longitude, "E", "W") },
        { label: "Altitude", value: `${position.altitude} km` },
        { label: "Velocity", value: `${position.velocity.toLocaleString()} km/h` },
        { label: "Visibility", value: position.visibility === "daylight" ? "Daylight" : "Eclipsed" },
      ]
    : [];

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">
        {/* Section header */}
        <div className="article-list-header" style={{ marginBottom: 20 }}>
          <div className="article-list-header__line" />
          <div className="article-list-header__badge">
            {heading ?? "ISS Live Tracker"}
          </div>
        </div>

        {/* Main card */}
        <div
          className="flex flex-col lg:flex-row"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Map */}
          <div className="flex-1 min-w-0" style={{ minHeight: 360, position: "relative" }}>
            <IssMap position={position} track={track} follow={follow} />

            {/* Follow toggle overlay */}
            <button
              onClick={() => setFollow((f) => !f)}
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                zIndex: 1000,
                fontFamily: "var(--font-header)",
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 2,
                border: `1px solid ${follow ? "var(--color-accent-purple)" : "var(--color-border)"}`,
                background: follow ? "rgba(147,51,234,0.25)" : "rgba(0,0,0,0.6)",
                color: follow ? "var(--color-accent-purple)" : "var(--color-muted)",
                cursor: "pointer",
              }}
            >
              {follow ? "Following ISS" : "Free Pan"}
            </button>
          </div>

          {/* Stats panel */}
          <div
            className="lg:w-64 flex-shrink-0"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <div
              className="lg:border-t-0 lg:border-l lg:pl-6 pt-6 lg:pt-0"
              style={{ borderColor: "var(--color-border)", padding: 24 }}
            >
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: error ? "#ef4444" : "#22c55e",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-header)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: error ? "#ef4444" : "#22c55e",
                    textTransform: "uppercase",
                  }}
                >
                  {error ? "Error" : "Live"}
                </span>
                {lastUpdated && (
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 10,
                      color: "var(--color-muted)",
                      marginLeft: "auto",
                    }}
                  >
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {error && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#ef4444", marginBottom: 16 }}>
                  {error}
                </p>
              )}

              {/* Position stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {stats.map(({ label, value }) => (
                  <div key={label}>
                    <p
                      style={{
                        fontFamily: "var(--font-header)",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-muted)",
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontFamily: "var(--font-header)", fontSize: 14, color: "#fff" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Crew */}
              {crew.length > 0 && (
                <>
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: 16,
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-header)",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--color-muted)",
                      }}
                    >
                      Crew on ISS ({crew.length})
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {crew.map((member) => {
                      const isSelected = wiki?.name === member.name;
                      return (
                        <button
                          key={member.name}
                          onClick={() => fetchWiki(member.name)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: isSelected ? "var(--color-accent-purple)" : "#fff",
                            background: "transparent",
                            border: "none",
                            padding: "3px 0",
                            textAlign: "left",
                            cursor: "pointer",
                            opacity: wikiLoading && !isSelected ? 0.5 : 1,
                            textDecoration: isSelected ? "underline" : "none",
                            textUnderlineOffset: 3,
                            transition: "color 0.15s",
                          }}
                        >
                          {member.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Wiki panel */}
                  {wikiLoading && (
                    <p style={{ fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.12em", color: "var(--color-muted)", marginTop: 16 }}>
                      LOADING…
                    </p>
                  )}
                  {wiki && !wikiLoading && (
                    <div
                      style={{
                        marginTop: 16,
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: 16,
                      }}
                    >
                      {wiki.thumbnail && (
                        <img
                          src={wiki.thumbnail}
                          alt={wiki.name}
                          style={{
                            width: "100%",
                            maxHeight: 140,
                            objectFit: "cover",
                            objectPosition: "top",
                            borderRadius: 2,
                            marginBottom: 10,
                          }}
                        />
                      )}
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          color: "var(--color-muted)",
                          lineHeight: 1.6,
                          marginBottom: wiki.url ? 8 : 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {wiki.extract}
                      </p>
                      {wiki.url && (
                        <a
                          href={wiki.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "var(--font-header)",
                            fontSize: 9,
                            letterSpacing: "0.12em",
                            color: "var(--color-accent-purple)",
                            textDecoration: "none",
                          }}
                        >
                          READ ON WIKIPEDIA →
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
