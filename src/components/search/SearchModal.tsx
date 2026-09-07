"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatApDate } from "@/lib/format-date";
import type { SearchResult } from "./types";

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

  // Focus input and lock scroll on mount
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced fetch
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

  // Arrow + Enter keyboard navigation
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
        if (target) {
          router.push(target.href);
          onClose();
        }
      }
    },
    [results, activeIndex, router, onClose],
  );

  const showEmpty = !loading && query.trim().length >= 2 && results.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 60, background: "rgba(8,8,8,0.97)" }}
    >
      {/* Search bar */}
      <div
        className="page-width flex items-center gap-4 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--color-muted)", flexShrink: 0 }}
          aria-hidden="true"
        >
          <circle cx="28.58" cy="28.58" r="18.58" />
          <line x1="41.94" y1="42" x2="54" y2="54" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          className="flex-1 bg-transparent border-none outline-none text-white"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
            caretColor: "var(--color-accent-purple)",
          }}
        />

        <button
          onClick={onClose}
          aria-label="Close search"
          className="flex-shrink-0 transition-opacity hover:opacity-60 focus:outline-none"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-header)", fontSize: 26, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Results */}
      <div className="page-width flex-1 overflow-y-auto">
        {/* Loading */}
        {loading && (
          <p
            className="pt-8"
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            Searching…
          </p>
        )}

        {/* No results */}
        {showEmpty && (
          <p
            className="pt-8"
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            No results for &ldquo;{query.trim()}&rdquo;
          </p>
        )}

        {/* Result list */}
        {results.length > 0 && (
          <ul role="listbox" aria-label="Search results">
            {results.map((result, i) => {
              const isActive = i === activeIndex;
              return (
                <li
                  key={result.id}
                  role="option"
                  aria-selected={isActive}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <Link
                    href={result.href}
                    onClick={onClose}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="block py-5 transition-all duration-150 focus:outline-none"
                    style={{
                      paddingLeft: isActive ? 12 : 0,
                      borderLeft: isActive
                        ? "3px solid var(--color-accent-purple)"
                        : "3px solid transparent",
                    }}
                  >
                    {/* Meta row */}
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        style={{
                          fontFamily: "var(--font-header)",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--color-accent-purple)",
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
                        fontSize: "clamp(1rem, 2vw, 1.25rem)",
                        color: "#fff",
                        lineHeight: 1.2,
                        marginBottom: result.excerpt ? 6 : 0,
                      }}
                    >
                      {result.title}
                    </p>

                    {/* Excerpt */}
                    {result.excerpt && (
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 14,
                          color: "var(--color-muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        {result.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Hint shown before typing */}
        {!loading && query.trim().length < 2 && (
          <p
            className="pt-8"
            style={{
              fontFamily: "var(--font-header)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </div>
  );
}
