"use client";

import { useState } from "react";
import Image from "next/image";
import type { MosaicPhotosData, MosaicPhotoCardData } from "./types";
import MosaicLightbox from "./MosaicLightbox";

// ─── Grid placement ───────────────────────────────────────────────────────────
// 4-column grid, grid-auto-rows: 225px, gap: 15px
// Featured cells (index 0 and 3) span 2×2, giving them 465px height.
// Items 10+ overflow into rows of 4 beneath the pattern.

function getGridPlacement(index: number): {
  gridColumn: string;
  gridRow: string;
  isFeatured: boolean;
} {
  const placements: Array<{ gridColumn: string; gridRow: string; isFeatured: boolean }> = [
    { gridColumn: "1 / 3", gridRow: "1 / 3", isFeatured: true  }, // 0: large top-left
    { gridColumn: "3 / 4", gridRow: "1 / 2", isFeatured: false }, // 1: small top-right-1
    { gridColumn: "4 / 5", gridRow: "1 / 2", isFeatured: false }, // 2: small top-right-2
    { gridColumn: "3 / 5", gridRow: "2 / 4", isFeatured: true  }, // 3: large bottom-right
    { gridColumn: "1 / 2", gridRow: "3 / 4", isFeatured: false }, // 4: small mid-left-1
    { gridColumn: "2 / 3", gridRow: "3 / 4", isFeatured: false }, // 5: small mid-left-2
    { gridColumn: "1 / 2", gridRow: "4 / 5", isFeatured: false }, // 6: row 4, col 1
    { gridColumn: "2 / 3", gridRow: "4 / 5", isFeatured: false }, // 7: row 4, col 2
    { gridColumn: "3 / 4", gridRow: "4 / 5", isFeatured: false }, // 8: row 4, col 3
    { gridColumn: "4 / 5", gridRow: "4 / 5", isFeatured: false }, // 9: row 4, col 4
  ];

  if (index < placements.length) return placements[index];

  // Additional cards flow in standard 4-column rows from row 5 onward
  const col = ((index - 10) % 4) + 1;
  const row = Math.floor((index - 10) / 4) + 5;
  return { gridColumn: `${col} / ${col + 1}`, gridRow: `${row} / ${row + 1}`, isFeatured: false };
}

// ─── Grid cell ────────────────────────────────────────────────────────────────

function MosaicCell({
  card,
  index,
  onClick,
}: {
  card: MosaicPhotoCardData;
  index: number;
  onClick: () => void;
}) {
  const { gridColumn, gridRow } = getGridPlacement(index);

  return (
    <button
      onClick={onClick}
      className="group relative block overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={{ gridColumn, gridRow, background: "var(--color-surface)" }}
      aria-label={`View photo: ${card.title}`}
    >
      {/* Image */}
      {card.mediaType === "image" ? (
        <Image
          src={card.imageUrl}
          alt={card.imageAlt ?? card.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--color-surface)", color: "var(--color-muted)" }}>
          <VideoIcon />
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: "rgba(0,0,0,0.55)" }}
        aria-hidden="true"
      >
        <ZoomIcon />
        <span
          className="mt-3 px-4 text-center text-sm"
          style={{ fontFamily: "var(--font-header)", color: "#fff", letterSpacing: "0.05em" }}
        >
          {card.title}
        </span>
      </div>
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ZoomIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="8" stroke="#fff" strokeWidth="2" />
      <line x1="20" y1="20" x2="28" y2="28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="14" x2="18" y2="14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 13L28 20L16 27V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ heading }: { heading: string }) {
  return (
    <div className="article-list-header" style={{ marginBottom: 20 }}>
      <div className="article-list-header__line" />
      <div className="article-list-header__badge">{heading}</div>
    </div>
  );
}

// ─── Parent component ─────────────────────────────────────────────────────────

export default function MosaicPhotos({ heading = "Photos", cards }: MosaicPhotosData) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!cards.length) return null;

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">
        <SectionHeader heading={heading} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: "225px",
            gap: "15px",
          }}
        >
          {cards.map((card, i) => (
            <MosaicCell
              key={card.id}
              card={card}
              index={i}
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <MosaicLightbox
          cards={cards}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
