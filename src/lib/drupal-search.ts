import type { SearchResult } from "@/components/search/types";
import { stripHtmlAndTruncate } from "@/lib/format-date";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

interface DrupalArticleNode {
  id: string;
  attributes: {
    title: string;
    drupal_internal__nid: number;
    created: string;
    field_article_desc: { processed?: string; value?: string } | null;
  };
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    "filter[pub][condition][path]": "status",
    "filter[pub][condition][operator]": "=",
    "filter[pub][condition][value]": "1",
    "filter[title][condition][path]": "title",
    "filter[title][condition][operator]": "CONTAINS",
    "filter[title][condition][value]": query,
    "fields[node--article]": "title,drupal_internal__nid,field_article_desc,created",
    "page[limit]": "12",
    "sort": "-created",
  });

  const url = `${DRUPAL_BASE}/jsonapi/node/article?${params}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.api+json" },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const json = await res.json();
    return (json.data ?? []).map((node: DrupalArticleNode): SearchResult => {
      const rawDesc =
        node.attributes.field_article_desc?.processed ??
        node.attributes.field_article_desc?.value ??
        null;
      return {
        id: node.id,
        type: "article",
        title: node.attributes.title,
        excerpt: rawDesc ? stripHtmlAndTruncate(rawDesc, 130) : undefined,
        href: `/articles/${node.attributes.drupal_internal__nid}`,
        dateIso: node.attributes.created,
      };
    });
  } catch {
    return [];
  }
}
