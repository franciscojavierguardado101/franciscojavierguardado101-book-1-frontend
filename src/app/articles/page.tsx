import type { Metadata } from "next";
import { getArticleList } from "@/lib/drupal-articles";
import ArticleList from "@/components/article/ArticleList";

export const metadata: Metadata = {
  title: "Articles — Francisco Guardado Book 1",
};

export default async function ArticlesPage() {
  const articles = await getArticleList();
  return <ArticleList articles={articles} />;
}
