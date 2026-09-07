"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  href: string;
  bg: string;
  btnStyle: string;
  align: "left" | "right";
  overlay: number;
}

const SLIDES: Slide[] = [
  {
    title: "Book 1",
    subtitle: "Now Available",
    description: "The first chapter of an epic story begins here.",
    cta: "Read Now",
    href: "/books/book-1",
    bg: "#1a1a1a",
    btnStyle: "btn--primary",
    align: "right",
    overlay: 0.36,
  },
  {
    title: "The Series",
    subtitle: "Explore the world",
    description: "Dive deep into a universe built for readers who demand more.",
    cta: "See All Books",
    href: "/series",
    bg: "#0f0f0f",
    btnStyle: "btn--yellow",
    align: "left",
    overlay: 0.4,
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden transition-colors duration-700"
      style={{ minHeight: "600px", background: slide.bg }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: `rgba(0,0,0,${slide.overlay})` }}
      />

      {/* Content */}
      <div
        className={`page-width relative z-20 flex h-full items-end py-16 ${
          slide.align === "right" ? "justify-end" : "justify-start"
        }`}
        style={{ minHeight: "600px" }}
      >
        <div className="max-w-lg">
          <p
            className="text-sm uppercase tracking-widest mb-3 opacity-80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {slide.subtitle}
          </p>
          <h1
            className="text-5xl md:text-7xl mb-4 text-white"
            style={{ fontFamily: "var(--font-header)", lineHeight: 1 }}
          >
            {slide.title}
          </h1>
          <p className="mb-8 opacity-80 text-base leading-relaxed">
            {slide.description}
          </p>
          <Link href={slide.href} className={`btn ${slide.btnStyle}`}>
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i === current ? "#fff" : "rgba(255,255,255,0.4)" }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
