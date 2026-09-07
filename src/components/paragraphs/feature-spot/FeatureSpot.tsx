import Image from "next/image";
import Link from "next/link";
import type { FeatureSpotData, FeatureSpotPosition, FeatureSpotBgColor } from "./types";

interface Theme {
  cardBg: string;
  titleColor: string;
  descColor: string;
  themeAttr: "black" | "white";
}

function getTheme(bgColor?: FeatureSpotBgColor): Theme {
  if (bgColor === "feat_spot_white") {
    return {
      cardBg: "#ffffff",
      titleColor: "#000000",
      descColor: "rgba(0,0,0,0.68)",
      themeAttr: "white",
    };
  }
  return {
    cardBg: "#000000",
    titleColor: "#ffffff",
    descColor: "rgba(255,255,255,0.72)",
    themeAttr: "black",
  };
}

function cardPositionStyle(position: FeatureSpotPosition): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    maxWidth: 360,
    minWidth: 260,
    padding: "32px 28px",
  };

  switch (position) {
    case "fs_up_right_side":
      return { ...base, top: 40, right: 40 };
    case "fs_up_left_side":
      return { ...base, top: 40, left: 40 };
    case "lo_right_side":
      return { ...base, bottom: 40, right: 40 };
    case "lo_left_side":
      return { ...base, bottom: 40, left: 40 };
  }
}

export default function FeatureSpot({ data }: { data: FeatureSpotData }) {
  const { title, description, linkHref, linkLabel, imageUrl, imageAlt, position, bgColor } = data;
  const theme = getTheme(bgColor);

  return (
    <section
      style={{ position: "relative", width: "100%", background: "#0a0a0a" }}
      aria-label={title}
    >
      {/* Background image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 7",
          minHeight: 340,
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            style={{ objectFit: "cover" }}
            sizes="100vw"
            priority
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
        )}

        {/* Gradient vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.48) 100%)",
          }}
        />

        {/* Floating text card — desktop only */}
        <div
          className="feature-spot-card feature-spot-card--desktop"
          data-theme={theme.themeAttr}
          style={{ ...cardPositionStyle(position), background: theme.cardBg }}
        >
          <TextCard
            title={title}
            description={description}
            linkHref={linkHref}
            linkLabel={linkLabel}
            theme={theme}
          />
        </div>
      </div>

      {/* Stacked text card — mobile only */}
      <div
        className="feature-spot-card--mobile"
        data-theme={theme.themeAttr}
        style={{ padding: "28px 20px", background: theme.cardBg }}
      >
        <TextCard
          title={title}
          description={description}
          linkHref={linkHref}
          linkLabel={linkLabel}
          theme={theme}
        />
      </div>

      <style>{`
        .feature-spot-card--desktop { display: block; }
        .feature-spot-card--mobile  { display: none; }

        @media (max-width: 767px) {
          .feature-spot-card--desktop { display: none !important; }
          .feature-spot-card--mobile  { display: block; }
        }

        .feature-spot-btn {
          display: inline-block;
          font-family: var(--font-header);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 10px 20px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }

        [data-theme="black"] .feature-spot-btn {
          color: #fff;
          background: #000;
          border: 1px solid rgba(255,255,255,0.5);
        }
        [data-theme="black"] .feature-spot-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: #fff;
        }

        [data-theme="white"] .feature-spot-btn {
          color: #000;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.4);
        }
        [data-theme="white"] .feature-spot-btn:hover {
          background: rgba(0,0,0,0.08);
          border-color: #000;
        }
      `}</style>
    </section>
  );
}

function TextCard({
  title,
  description,
  linkHref,
  linkLabel,
  theme,
}: {
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
  theme: Theme;
}) {
  return (
    <>
      <p
        style={{
          fontFamily: "var(--font-header)",
          fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
          color: theme.titleColor,
          lineHeight: 1.25,
          marginBottom: description ? 16 : linkHref ? 24 : 0,
        }}
      >
        {title}
      </p>

      {description && (
        <div
          dangerouslySetInnerHTML={{ __html: description }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.85rem, 1.4vw, 1rem)",
            color: theme.descColor,
            lineHeight: 1.65,
            marginBottom: linkHref ? 24 : 0,
          }}
        />
      )}

      {linkHref && (
        <Link href={linkHref} className="feature-spot-btn">
          {linkLabel ?? "Learn more"}
        </Link>
      )}
    </>
  );
}
