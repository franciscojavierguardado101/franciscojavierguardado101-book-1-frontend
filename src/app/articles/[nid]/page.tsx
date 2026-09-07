import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleByNid, getAllArticleNids } from "@/lib/drupal-articles";
import ArticlePage from "@/components/article/ArticlePage";

interface ArticleRouteProps {
  params: Promise<{ nid: string }>;
}

export async function generateStaticParams() {
  const nids = await getAllArticleNids();
  return nids.map((nid) => ({ nid: String(nid) }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { nid } = await params;
  const article = await getArticleByNid(Number(nid));
  if (!article) return {};
  return { title: `${article.title} — Francisco Guardado Book 1` };
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { nid } = await params;
  const article = await getArticleByNid(Number(nid));
  if (!article) notFound();
  return <ArticlePage article={article} />;
}
