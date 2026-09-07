"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CarouselCard from "./CarouselCard";
import type { CarouselHeroData } from "./types";
import { DEFAULT_AUTOPLAY_INTERVAL } from "./constants";

export default function CarouselHero({ cards, autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL }: CarouselHeroData) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, autoplayInterval);
  }, [goNext, autoplayInterval]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleDotClick = (index: number) => {
    goTo(index);
    resetTimer();
  };

  if (!cards.length) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "90vh", minHeight: 480, maxHeight: 900 }}>
      {cards.map((card, i) => (
        <CarouselCard key={card.id} card={card} active={i === activeIndex} />
      ))}

      {cards.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="w-2 h-2 rounded-full transition-all duration-300 focus:outline-none"
              style={{
                background: i === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
