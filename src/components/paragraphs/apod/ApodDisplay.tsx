"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ApodItem } from "./types";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ heading }: { heading: string }) {
  return (
    <div className="article-list-header" style={{ marginBottom: 32 }}>
      <div className="article-list-header__line" />
      <div className="article-list-header__badge">{heading}</div>
    </div>
  );
}

// Strip HTML tags for plain-text display (explanation and copyright from new API contain HTML)
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#039;/g, "'").trim();
}

// ─── Main image panel ─────────────────────────────────────────────────────────

function ApodMain({ item }: { item: ApodItem }) {
  // New API: hdurl is the image, url is the article permalink
  const imageUrl = item.hdurl ?? item.url;
  const explanation = stripHtml(item.explanation);
  const copyright = item.copyright ? stripHtml(item.copyright) : undefined;

  return (
    <div
      className="flex flex-col lg:flex-row gap-8"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Media */}
      <div className="flex-1 min-w-0" style={{ minHeight: 320, position: "relative" }}>
        {item.media_type === "video" ? (
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={imageUrl}
              title={item.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={item.alt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        )}
      </div>

      {/* Details */}
      <div
        className="flex flex-col lg:w-80 flex-shrink-0"
        style={{ padding: "32px 28px" }}
      >
        <p
          style={{
            fontFamily: "var(--font-header)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: 12,
          }}
        >
          {item.date}
        </p>

        <h2
          style={{
            fontFamily: "var(--font-header)",
            fontSize: 20,
            color: "#fff",
            lineHeight: 1.25,
            marginBottom: 16,
          }}
        >
          {item.title}
        </h2>

        <p
          className="flex-1 overflow-y-auto"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--color-muted)",
            lineHeight: 1.7,
            marginBottom: 24,
            maxHeight: 260,
          }}
        >
          {explanation}
        </p>

        {copyright && (
          <>
            <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 16 }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>
              <span
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "#fff",
                  marginRight: 8,
                }}
              >
                Credit:
              </span>
              {copyright}
            </p>
          </>
        )}

        {item.permalink && item.media_type === "image" && (
          <a
            href={item.permalink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 16,
              fontFamily: "var(--font-header)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-accent-purple)",
              textDecoration: "none",
            }}
          >
            View on NASA →
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Gallery thumbnail ────────────────────────────────────────────────────────

function GalleryThumb({
  item,
  active,
  onClick,
}: {
  item: ApodItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative block overflow-hidden focus:outline-none"
      style={{
        aspectRatio: "1",
        border: `2px solid ${active ? "var(--color-accent-purple)" : "transparent"}`,
        borderRadius: 2,
        background: "var(--color-surface)",
        transition: "border-color 0.15s",
        flexShrink: 0,
        width: "calc((100% - 40px) / 6)",
        minWidth: 60,
      }}
      aria-label={`View: ${item.title}`}
    >
      {item.media_type === "image" && (item.hdurl ?? item.url) ? (
        <Image
          src={item.hdurl ?? item.url}
          alt={item.alt ?? item.title}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-70"
          sizes="10vw"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "var(--color-surface)", color: "var(--color-muted)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ApodDisplayProps {
  heading?: string;
}

export default function ApodDisplay({ heading = "Astronomy Picture of the Day" }: ApodDisplayProps) {
  const [today, setToday] = useState<ApodItem | null>(null);
  const [gallery, setGallery] = useState<ApodItem[]>([]);
  const [active, setActive] = useState<ApodItem | null>(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's APOD once on mount
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/apod?mode=today", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: ApodItem | { error: string }) => {
        if ("error" in data) {
          setError((data as { error: string }).error);
        } else {
          setToday(data as ApodItem);
          setActive(data as ApodItem);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error && err.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to load today's APOD.";
        setError(msg);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoadingToday(false);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  // Fetch random gallery
  const fetchGallery = useCallback(() => {
    setLoadingGallery(true);
    fetch("/api/apod?mode=random")
      .then((r) => r.json())
      .then((data: ApodItem[] | { error: string }) => {
        if (Array.isArray(data)) setGallery(data);
      })
      .catch(() => {})
      .finally(() => setLoadingGallery(false));
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">
        <SectionHeader heading={heading} />

        {/* Today's APOD */}
        {loadingToday && (
          <p
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--color-muted)",
              marginBottom: 24,
            }}
          >
            LOADING…
          </p>
        )}

        {error && !loadingToday && !active && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-muted)", marginBottom: 24 }}>
            {error}
          </p>
        )}

        {active && <ApodMain item={active} />}

        {/* Gallery row */}
        {gallery.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                }}
              >
                Random Gallery
              </p>
              <button
                onClick={fetchGallery}
                disabled={loadingGallery}
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-purple)",
                  background: "none",
                  border: "1px solid var(--color-accent-purple)",
                  borderRadius: 2,
                  padding: "3px 10px",
                  cursor: "pointer",
                  opacity: loadingGallery ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {loadingGallery ? "Loading…" : "Refresh"}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {gallery.map((item) => (
                <GalleryThumb
                  key={item.date + item.url}
                  item={item}
                  active={active?.url === item.url}
                  onClick={() => setActive(item)}
                />
              ))}
            </div>

            {today && active && active.url !== today.url && (
              <button
                onClick={() => setActive(today)}
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-header)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                ← Back to today
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
