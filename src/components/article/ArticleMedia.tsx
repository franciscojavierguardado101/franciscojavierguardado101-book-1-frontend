import Image from "next/image";
import type { ArticleMediaData } from "./types";

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "vimeo.com") {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
  } catch {
    // fall through
  }
  return url;
}

interface ArticleMediaProps {
  media: ArticleMediaData;
}

export default function ArticleMedia({ media }: ArticleMediaProps) {
  if (media.type === "image") {
    return (
      <div className="article-media">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <Image
            src={media.url}
            alt={media.alt ?? ""}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 560px, 100vw"
          />
        </div>
      </div>
    );
  }

  if (media.type === "remote_video") {
    const embedUrl = toEmbedUrl(media.url);
    return (
      <div className="article-media">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Article video"
          />
        </div>
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="article-media">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <video
            src={media.url}
            controls
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return null;
}
