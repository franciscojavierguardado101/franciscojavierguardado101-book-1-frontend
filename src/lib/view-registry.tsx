import type { ReactNode } from "react";
import { getArticleList } from "@/lib/drupal-articles";
import ArticleList from "@/components/article/ArticleList";

// To add support for a new Drupal view: add one entry below.
// Key = view machine name. Value = async function that receives the display_id
// and returns the rendered JSX. The ViewEmbed component itself stays unchanged.
export type ViewRenderer = (displayId: string) => Promise<ReactNode>;

export const VIEW_REGISTRY: Record<string, ViewRenderer> = {
  articles_listing: async (_displayId) => {
    const articles = await getArticleList();
    return <ArticleList articles={articles} />;
  },
};
