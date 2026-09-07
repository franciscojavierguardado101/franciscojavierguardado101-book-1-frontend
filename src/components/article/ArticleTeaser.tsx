import Image from "next/image";
import Link from "next/link";
import type { ArticleListItem } from "./types";
import { formatApDate } from "@/lib/format-date";

interface ArticleTeaserProps {
  article: ArticleListItem;
  isFirst: boolean;
}

export default function ArticleTeaser({ article, isFirst }: ArticleTeaserProps) {
  return (
    <div className={`article-teaser${isFirst ? "" : " article-teaser--sep"}`}>
      <Link href={`/articles/${article.nid}`} className="article-teaser__inner">
        <figure className="article-teaser__figure">
          {/* Image column */}
          <div className="article-teaser__img-col">
            <div className="article-teaser__img-wrap">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt ?? article.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 300px, 100vw"
                />
              ) : (
                <div className="article-teaser__img-placeholder" />
              )}
            </div>
          </div>

          {/* Text column */}
          <figcaption className="article-teaser__caption">
            <span className="article-teaser__meta">
              <span className="article-teaser__label">Article</span>
              <span className="article-teaser__pipe" aria-hidden="true" />
              <time className="article-teaser__date" dateTime={article.dateIso}>
                {formatApDate(article.dateIso)}
              </time>
            </span>

            <h3 className="article-teaser__title">
              <span>{article.title}</span>
            </h3>

            {article.excerpt && (
              <p className="article-teaser__excerpt">{article.excerpt}</p>
            )}

            <span className="article-teaser__read-more">Read More →</span>
          </figcaption>
        </figure>
      </Link>
    </div>
  );
}
