"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import type { MosaicPhotoCardData } from "./types";

interface MosaicLightboxProps {
  cards: MosaicPhotoCardData[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function MosaicLightbox({
  cards,
  activeIndex,
  onClose,
  onNavigate,
}: MosaicLightboxProps) {
  const card = cards[activeIndex];
  const total = cards.length;

  const goPrev = useCallback(() => {
    onNavigate((activeIndex - 1 + total) % total);
  }, [activeIndex, total, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((activeIndex + 1) % total);
  }, [activeIndex, total, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.92)" }}
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
    >
      {/* Image area */}
      <div className="relative flex-1 flex items-center justify-center min-w-0">
        {/* Prev arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-4 z-10 flex items-center justify-center w-12 h-12 transition-opacity hover:opacity-70 focus:outline-none"
          style={{ color: "#fff" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M18 6L10 14L18 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full h-full max-w-[calc(100%-120px)]" style={{ maxHeight: "90vh" }}>
          {card.mediaType === "image" ? (
            <Image
              key={card.id}
              src={card.imageUrl}
              alt={card.imageAlt ?? card.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 75vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--color-muted)" }}>
              <span style={{ fontFamily: "var(--font-header)", fontSize: 13, letterSpacing: "0.1em" }}>
                VIDEO PREVIEW UNAVAILABLE
              </span>
            </div>
          )}
        </div>

        {/* Next arrow */}
        <button
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-4 z-10 flex items-center justify-center w-12 h-12 transition-opacity hover:opacity-70 focus:outline-none"
          style={{ color: "#fff" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M10 6L18 14L10 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Details panel */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{
          width: 300,
          flexShrink: 0,
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          padding: "48px 28px 28px",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none"
          style={{ color: "#fff", fontFamily: "var(--font-header)", fontSize: 20 }}
        >
          ×
        </button>

        {/* Counter */}
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
          {activeIndex + 1}/{total}
        </p>

        {/* Title */}
        <p
          style={{
            fontFamily: "var(--font-header)",
            fontSize: 16,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.3,
          }}
        >
          {card.title}
        </p>

        {/* Description */}
        {card.description && (
          <div
            className="article-rte"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-muted)",
              lineHeight: 1.65,
              marginBottom: 24,
            }}
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        )}

        {/* Caption */}
        {card.caption && !card.description && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-muted)",
              lineHeight: 1.65,
              marginBottom: 24,
            }}
          >
            {card.caption}
          </p>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 20 }} />

        {/* Credit */}
        {card.credit && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>
            <span style={{ fontFamily: "var(--font-header)", fontSize: 11, letterSpacing: "0.08em", color: "#fff", marginRight: 8 }}>
              Credit:
            </span>
            {card.credit}
          </p>
        )}
      </div>
    </div>
  );
}
