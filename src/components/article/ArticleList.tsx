import ArticleTeaser from "./ArticleTeaser";
import type { ArticleListItem } from "./types";

interface ArticleListProps {
  articles: ArticleListItem[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <section className="article-list-section">
      <div className="page-width">
        {/* Section header */}
        <div className="article-list-header" aria-hidden="true">
          <div className="article-list-header__line" />
          <div className="article-list-header__badge">Articles</div>
        </div>

        {articles.length === 0 ? (
          <p style={{ color: "var(--color-muted)", padding: "2rem 0" }}>
            No articles published yet.
          </p>
        ) : (
          <div>
            {articles.map((article, i) => (
              <ArticleTeaser key={article.nid} article={article} isFirst={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
