"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NasaVideoItem } from "./types";

const TOPICS = ["Space", "ISS", "Mars", "Moon", "Webb", "Earth", "Launches", "Hubble"];

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface ModalProps {
  item: NasaVideoItem;
  onClose: () => void;
}

function VideoModal({ item, onClose }: ModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/nasa-videos?action=asset&id=${encodeURIComponent(item.nasaId)}`)
      .then((r) => r.json())
      .then((d) => setVideoUrl(d.videoUrl ?? null))
      .catch(() => setVideoUrl(null))
      .finally(() => setLoading(false));
  }, [item.nasaId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 4,
          width: "100%",
          maxWidth: 900,
          overflow: "hidden",
        }}
      >
        {/* Video area */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
          {loading && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <p style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em", color: "var(--color-muted)" }}>
                LOADING…
              </p>
            </div>
          )}
          {!loading && videoUrl && (
            <video
              src={videoUrl}
              controls
              autoPlay
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          {!loading && !videoUrl && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>
                Video unavailable.
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 24 }}>
          <div className="flex items-start justify-between gap-4">
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 6,
              }}>
                {formatDate(item.dateCreated)}
              </p>
              <h3 style={{
                fontFamily: "var(--font-header)", fontSize: "clamp(1rem, 2vw, 1.25rem)",
                color: "#fff", lineHeight: 1.3, marginBottom: 12,
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)",
                lineHeight: 1.65,
                display: "-webkit-box", WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {item.description}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                fontFamily: "var(--font-header)", fontSize: 18,
                color: "var(--color-muted)", background: "transparent",
                border: "none", cursor: "pointer", flexShrink: 0, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  heading?: string;
  defaultQuery?: string;
}

export default function NasaVideos({ heading, defaultQuery }: Props) {
  const initialQuery = defaultQuery || "Space";
  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [items, setItems] = useState<NasaVideoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NasaVideoItem | null>(null);

  const fetchVideos = useCallback(async (q: string, p: number, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/nasa-videos?q=${encodeURIComponent(q)}&page=${p}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setItems((prev) => append ? [...prev, ...data.items] : data.items);
      setTotal(data.total);
    } catch {
      setError("Failed to load videos.");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchVideos(query, 1, false);
  }, [query, fetchVideos]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputVal.trim() || "space");
  }

  function handleTopic(topic: string) {
    setInputVal(topic);
    setQuery(topic);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchVideos(query, next, true);
  }

  const hasMore = items.length < total;

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">
        {/* Section header */}
        <div className="article-list-header" style={{ marginBottom: 20 }}>
          <div className="article-list-header__line" />
          <div className="article-list-header__badge">
            {heading ?? "NASA Video Library"}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search NASA videos…"
            style={{
              flex: 1, background: "var(--color-surface)",
              border: "1px solid var(--color-border)", borderRadius: 2,
              padding: "8px 14px", fontFamily: "var(--font-body)", fontSize: 13,
              color: "#fff", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "8px 16px", borderRadius: 2,
              border: "1px solid var(--color-accent-purple)",
              background: "rgba(147,51,234,0.15)", color: "var(--color-accent-purple)",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TOPICS.map((t) => {
            const active = query.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => handleTopic(t)}
                style={{
                  fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.15em",
                  textTransform: "uppercase", padding: "4px 10px", borderRadius: 2,
                  border: `1px solid ${active ? "var(--color-accent-purple)" : "var(--color-border)"}`,
                  background: active ? "rgba(147,51,234,0.15)" : "transparent",
                  color: active ? "var(--color-accent-purple)" : "var(--color-muted)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* State: loading */}
        {loading && (
          <p style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em", color: "var(--color-muted)" }}>
            LOADING…
          </p>
        )}

        {/* State: error */}
        {error && !loading && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ef4444" }}>{error}</p>
        )}

        {/* Results count */}
        {!loading && !error && total > 0 && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", marginBottom: 20 }}>
            {total.toLocaleString()} results for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Video grid */}
        {!loading && items.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {items.map((item) => (
              <button
                key={item.nasaId}
                onClick={() => setSelected(item)}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4, overflow: "hidden",
                  textAlign: "left", cursor: "pointer",
                  transition: "border-color 0.15s",
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent-purple)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", paddingTop: "56.25%", background: "#000", overflow: "hidden" }}>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "#111" }} />
                  )}
                  {/* Play overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.3)",
                    transition: "background 0.15s",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(167,139,250,0.85)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: "#fff", paddingLeft: 3,
                    }}>
                      ▶
                    </div>
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: "12px 14px 14px" }}>
                  <p style={{
                    fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 5,
                  }}>
                    {formatDate(item.dateCreated)}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-header)", fontSize: 13, color: "#fff",
                    lineHeight: 1.3, marginBottom: 6,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)",
                    lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em",
                textTransform: "uppercase", padding: "10px 28px", borderRadius: 2,
                border: "1px solid var(--color-border)",
                background: "transparent", color: "var(--color-muted)",
                cursor: loadingMore ? "default" : "pointer",
                opacity: loadingMore ? 0.5 : 1,
              }}
            >
              {loadingMore ? "LOADING…" : "LOAD MORE"}
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && items.length === 0 && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>
            No videos found for &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>

      {/* Modal */}
      {selected && <VideoModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
