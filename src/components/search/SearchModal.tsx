"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatApDate } from "@/lib/format-date";
import type { SearchResult } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","is","was","are","be","as","it","its","from","this","that","they",
  "we","he","she","you","i","my","our","your","their","not","no","do",
  "did","has","have","had","been","will","would","could","should","may",
  "can","what","how","who","when","where","why","all","into","about",
]);

function getTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return [...new Set([query.trim(), ...words])].slice(0, 8);
}

// Highlights every matched term inside a piece of text
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const terms = getTerms(query).sort((a, b) => b.length - a.length); // longest first
  const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  if (!pattern) return <>{text}</>;
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: "rgba(147, 51, 234, 0.3)",
              color: "inherit",
              borderRadius: 2,
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2 pt-10">
      {(["0ms", "150ms", "300ms"] as const).map((delay) => (
        <span
          key={delay}
          className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: "var(--color-muted)", animationDelay: delay }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setActiveIndex(-1);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex] ?? results[0];
        if (target) { router.push(target.href); onClose(); }
      }
    },
    [results, activeIndex, router, onClose],
  );

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;
  const showEmpty = !loading && hasQuery && results.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 60, background: "rgba(8,8,8,0.97)" }}
    >
      {/* ─── Search bar ─────────────────────────────────────────────────── */}
      <div
        className="page-width"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-4 py-5">
          <svg
            width="20" height="20" viewBox="0 0 64 64"
            fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--color-muted)", flexShrink: 0 }}
            aria-hidden="true"
          >
            <circle cx="28.58" cy="28.58" r="18.58" />
            <line x1="41.94" y1="42" x2="54" y2="54" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            placeholder="Search articles, topics, authors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            className="flex-1 bg-transparent border-none outline-none text-white"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.05rem, 2.5vw, 1.35rem)",
              caretColor: "var(--color-accent-purple)",
            }}
          />

          {!loading && results.length > 0 && (
            <span
              className="hidden sm:block flex-shrink-0"
              style={{
                fontFamily: "var(--font-header)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
              }}
            >
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          )}

          <button
            onClick={onClose}
            aria-label="Close search"
            className="flex-shrink-0 transition-opacity hover:opacity-60 focus:outline-none"
            style={{
              color: "var(--color-muted)",
              fontFamily: "var(--font-header)",
              fontSize: 26,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* ─── Results ────────────────────────────────────────────────────── */}
      <div className="page-width flex-1 overflow-y-auto">
        {loading && <LoadingDots />}

        {showEmpty && (
          <div className="pt-10">
            <p
              style={{
                fontFamily: "var(--font-header)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: 8,
              }}
            >
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-muted)",
                opacity: 0.55,
              }}
            >
              Try different keywords or check the spelling.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <ul role="listbox" aria-label="Search results" className="py-2">
            {results.map((result, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={result.id} role="option" aria-selected={isActive}>
                  <Link
                    href={result.href}
                    onClick={onClose}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="block py-4 focus:outline-none transition-all duration-150"
                    style={{
                      paddingLeft: isActive ? 16 : 4,
                      paddingRight: 4,
                      borderLeft: `3px solid ${isActive ? "var(--color-accent-purple)" : "transparent"}`,
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    {/* Type + date */}
                    <div className="flex items-center gap-3 mb-1.5">
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
                          opacity: 0.85,
                        }}
                      >
                        {result.type}
                      </span>
                      {result.dateIso && (
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: "var(--color-muted)",
                          }}
                        >
                          {formatApDate(result.dateIso)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p
                      style={{
                        fontFamily: "var(--font-header)",
                        fontSize: "clamp(1rem, 2vw, 1.15rem)",
                        color: "#fff",
                        lineHeight: 1.25,
                        marginBottom: result.excerpt ? 5 : 0,
                      }}
                    >
                      <HighlightMatch text={result.title} query={trimmedQuery} />
                    </p>

                    {/* Excerpt */}
                    {result.excerpt && (
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          color: "var(--color-muted)",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        <HighlightMatch text={result.excerpt} query={trimmedQuery} />
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Initial prompt */}
        {!loading && !hasQuery && (
          <p
            className="pt-10"
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              opacity: 0.45,
            }}
          >
            Start typing to search
          </p>
        )}
      </div>

      {/* ─── Keyboard hints footer ───────────────────────────────────────── */}
      <div
        className="page-width py-3 flex items-center gap-5"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {[
          { key: "↑↓", label: "navigate" },
          { key: "↵", label: "open" },
          { key: "Esc", label: "close" },
        ].map(({ key, label }) => (
          <span
            key={key}
            className="flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 11,
              color: "var(--color-muted)",
              opacity: 0.45,
            }}
          >
            <kbd
              style={{
                fontFamily: "inherit",
                fontSize: 10,
                padding: "1px 5px",
                borderRadius: 3,
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              {key}
            </kbd>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
