import Link from "next/link";
import ArticleMedia from "./ArticleMedia";
import type { ArticleData } from "./types";

const BG_STYLES: Record<string, { background: string; color: string; linkColor: string }> = {
  article_black: { background: "#000000", color: "#ffffff", linkColor: "#c66ec2" },
  article_white: { background: "#ffffff", color: "#6b0135", linkColor: "#6b0135" },
};

interface ArticlePageProps {
  article: ArticleData;
}

export default function ArticlePage({ article }: ArticlePageProps) {
  const theme = BG_STYLES[article.bgColor] ?? BG_STYLES.article_black;

  return (
    <section
      className="min-h-screen py-12"
      style={{ background: theme.background, color: theme.color }}
    >
      <div className="page-width--narrow">
        {/* Breadcrumb */}
        <nav className="text-xs uppercase tracking-widest mb-8 opacity-70" aria-label="Breadcrumb">
          <Link href="/" style={{ color: theme.color }}>Home</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span>{article.title}</span>
        </nav>

        {/* Title */}
        <h1
          className="mb-8 leading-tight"
          style={{
            fontFamily: "var(--font-header)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: theme.color,
          }}
        >
          {article.title}
        </h1>

        {/* Description */}
        {article.description && (
          <div
            className="article-rte mb-10"
            style={{ "--article-link-color": theme.linkColor, color: theme.color } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}

        {/* Media */}
        {article.media && (
          <div className="mb-10">
            <ArticleMedia media={article.media} />
          </div>
        )}

        {/* Author */}
        {article.author && (
          <p
            className="text-sm opacity-70"
            style={{ fontFamily: "var(--font-header)", color: theme.color }}
          >
            {article.author}
          </p>
        )}
      </div>
    </section>
  );
}
