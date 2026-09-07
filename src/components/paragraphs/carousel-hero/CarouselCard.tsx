import Image from "next/image";
import Link from "next/link";
import type { CarouselCardData } from "./types";
import { POSITION_CLASSES, BUTTON_COLORS } from "./constants";

interface CarouselCardProps {
  card: CarouselCardData;
  active: boolean;
}

export default function CarouselCard({ card, active }: CarouselCardProps) {
  const positionClass = POSITION_CLASSES[card.artPosition];
  const btnStyle = card.buttonColor ? BUTTON_COLORS[card.buttonColor] : BUTTON_COLORS.carousel_hero_black;

  const isRight =
    card.artPosition === "carousel_hero_lower_right" ||
    card.artPosition === "carousel_hero_upper_right" ||
    card.artPosition === "carousel_hero_artistic_middle_right";

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      <Image
        src={card.image}
        alt={card.imageAlt ?? card.title}
        fill
        priority={active}
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

      <div className={`absolute inset-0 flex p-8 md:p-16 ${positionClass}`}>
        <div
          className="max-w-sm md:max-w-lg"
          style={{ textAlign: isRight ? "right" : "left" }}
        >
          {card.topCaption && (
            <p
              className="text-xs uppercase tracking-widest mb-3 opacity-80"
              style={{ color: "#fff", fontFamily: "var(--font-header)" }}
            >
              {card.topCaption}
            </p>
          )}

          <h1
            className="text-4xl md:text-6xl leading-none mb-4"
            style={{ color: "#fff", fontFamily: "var(--font-header)" }}
          >
            {card.title}
          </h1>

          {card.lowCaption && (
            <p
              className="text-sm md:text-base mb-6 opacity-80 leading-relaxed"
              style={{ color: "#fff", fontFamily: "var(--font-body)" }}
            >
              {card.lowCaption}
            </p>
          )}

          {card.linkHref && card.linkLabel && (
            <Link
              href={card.linkHref}
              className="inline-block px-6 py-3 text-sm uppercase tracking-widest font-semibold transition-opacity hover:opacity-80"
              style={{ background: btnStyle.bg, color: btnStyle.text }}
            >
              {card.linkLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
