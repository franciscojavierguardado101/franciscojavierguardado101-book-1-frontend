import type { SearchResult } from "@/components/search/types";
import { stripHtmlAndTruncate } from "@/lib/format-date";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

// Words too common to be useful search terms
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","is","was","are","be","as","it","its","from","this","that","they",
  "we","he","she","you","i","my","our","your","their","not","no","do",
  "did","has","have","had","been","will","would","could","should","may",
  "can","what","how","who","when","where","why","all","into","about",
]);

// Return the full phrase + every meaningful individual word, deduplicated, max 8 terms
function buildTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return [...new Set([query.trim(), ...words])].slice(0, 8);
}

// Client-side relevance: title matches outweigh body matches; phrase match outweighs word match
function score(result: SearchResult, terms: string[], fullPhrase: string): number {
  const title = result.title.toLowerCase();
  const body = (result.excerpt ?? "").toLowerCase();
  const fp = fullPhrase.toLowerCase();
  let s = 0;
  if (title.includes(fp)) s += 20;
  if (body.includes(fp)) s += 8;
  for (const t of terms) {
    if (title.includes(t)) s += 5;
    if (body.includes(t)) s += 2;
  }
  return s;
}

interface DrupalArticleNode {
  id: string;
  attributes: {
    title: string;
    drupal_internal__nid: number;
    created: string;
    field_article_desc: { processed?: string; value?: string } | null;
    field_article_author?: string | null;
  };
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  const terms = buildTerms(query);
  const params = new URLSearchParams();

  // Outer AND: published status must hold
  params.set("filter[andGroup][group][conjunction]", "AND");
  params.set("filter[pub][condition][path]", "status");
  params.set("filter[pub][condition][operator]", "=");
  params.set("filter[pub][condition][value]", "1");
  params.set("filter[pub][condition][memberOf]", "andGroup");

  // Inner OR: any term matched in any field counts as a hit
  params.set("filter[orGroup][group][conjunction]", "OR");
  params.set("filter[orGroup][group][memberOf]", "andGroup");

  for (const [i, term] of terms.entries()) {
    const k = `t${i}`;
    params.set(`filter[${k}_ti][condition][path]`, "title");
    params.set(`filter[${k}_ti][condition][operator]`, "CONTAINS");
    params.set(`filter[${k}_ti][condition][value]`, term);
    params.set(`filter[${k}_ti][condition][memberOf]`, "orGroup");

    params.set(`filter[${k}_bo][condition][path]`, "field_article_desc.value");
    params.set(`filter[${k}_bo][condition][operator]`, "CONTAINS");
    params.set(`filter[${k}_bo][condition][value]`, term);
    params.set(`filter[${k}_bo][condition][memberOf]`, "orGroup");

    params.set(`filter[${k}_au][condition][path]`, "field_article_author");
    params.set(`filter[${k}_au][condition][operator]`, "CONTAINS");
    params.set(`filter[${k}_au][condition][value]`, term);
    params.set(`filter[${k}_au][condition][memberOf]`, "orGroup");
  }

  params.set(
    "fields[node--article]",
    "title,drupal_internal__nid,field_article_desc,field_article_author,created",
  );
  params.set("page[limit]", "20");

  try {
    const res = await fetch(`${DRUPAL_BASE}/jsonapi/node/article?${params}`, {
      headers: { Accept: "application/vnd.api+json" },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const json = await res.json();
    const results: SearchResult[] = (json.data ?? []).map(
      (node: DrupalArticleNode): SearchResult => {
        const raw =
          node.attributes.field_article_desc?.processed ??
          node.attributes.field_article_desc?.value ??
          null;
        return {
          id: node.id,
          type: "article",
          title: node.attributes.title,
          excerpt: raw ? stripHtmlAndTruncate(raw, 150) : undefined,
          href: `/articles/${node.attributes.drupal_internal__nid}`,
          dateIso: node.attributes.created,
        };
      },
    );

    // Sort by relevance: title matches first, then body matches
    return results.sort((a, b) => score(b, terms, query) - score(a, terms, query));
  } catch {
    return [];
  }
}
