import type { ArticleData, ArticleBgColor, ArticleMediaData, ArticleMediaType, ArticleListItem } from "@/components/article/types";
import { stripHtmlAndTruncate } from "@/lib/format-date";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

const INCLUDE = [
  "field_article_media",
  "field_article_media.field_media_image",
  "field_article_media.field_media_video_file",
].join(",");

interface JsonApiResource { type: string; id: string }

function findIncluded<T extends JsonApiResource>(
  included: JsonApiResource[],
  type: string,
  id: string
): T | undefined {
  return included.find((r) => r.type === type && r.id === id) as T | undefined;
}

function resolveMedia(
  mediaRef: JsonApiResource,
  included: JsonApiResource[]
): ArticleMediaData | null {
  const media = findIncluded<{
    type: string;
    id: string;
    attributes: Record<string, unknown>;
    relationships: Record<string, { data: JsonApiResource | null }>;
  }>(included, mediaRef.type, mediaRef.id);

  if (!media) return null;

  if (media.type === "media--image") {
    const fileRef = media.relationships.field_media_image?.data;
    if (!fileRef) return null;
    const file = findIncluded<{ type: string; id: string; attributes: { uri: { url: string }; filename: string } }>(
      included, fileRef.type, fileRef.id
    );
    if (!file) return null;
    return {
      type: "image",
      url: `${DRUPAL_BASE}${file.attributes.uri.url}`,
      alt: file.attributes.filename,
    };
  }

  if (media.type === "media--remote_video") {
    const rawUrl = media.attributes.field_media_oembed_video as string | undefined;
    if (!rawUrl) return null;
    return { type: "remote_video", url: rawUrl };
  }

  if (media.type === "media--video") {
    const fileRef = media.relationships.field_media_video_file?.data;
    if (!fileRef) return null;
    const file = findIncluded<{ type: string; id: string; attributes: { uri: { url: string } } }>(
      included, fileRef.type, fileRef.id
    );
    if (!file) return null;
    return { type: "video", url: `${DRUPAL_BASE}${file.attributes.uri.url}` };
  }

  return null;
}

export async function getArticleByNid(nid: number): Promise<ArticleData | null> {
  const url = `${DRUPAL_BASE}/jsonapi/node/article?filter[drupal_internal__nid]=${nid}&include=${INCLUDE}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const node = json.data?.[0];
  if (!node) return null;

  const included: JsonApiResource[] = json.included ?? [];
  const attrs = node.attributes;

  const mediaRef: JsonApiResource | null = node.relationships?.field_article_media?.data ?? null;
  const media = mediaRef ? resolveMedia(mediaRef, included) : null;

  return {
    nid,
    title: attrs.title,
    description: attrs.field_article_desc?.processed ?? attrs.field_article_desc?.value ?? null,
    author: attrs.field_article_author ?? null,
    bgColor: (attrs.field_article_bg_color ?? "article_black") as ArticleBgColor,
    media,
  };
}

const LIST_INCLUDE = [
  "field_article_media",
  "field_article_media.field_media_image",
].join(",");

export async function getArticleList(): Promise<ArticleListItem[]> {
  const url = `${DRUPAL_BASE}/jsonapi/node/article?sort=-created&include=${LIST_INCLUDE}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];

  const json = await res.json();
  const included: JsonApiResource[] = json.included ?? [];

  return (json.data ?? []).map((node: {
    attributes: {
      drupal_internal__nid: number;
      title: string;
      created: string;
      field_article_desc: { processed?: string; value?: string } | null;
    };
    relationships: {
      field_article_media: { data: JsonApiResource | null };
    };
  }): ArticleListItem => {
    const attrs = node.attributes;

    const rawDesc = attrs.field_article_desc?.processed ?? attrs.field_article_desc?.value ?? null;
    const excerpt = rawDesc ? stripHtmlAndTruncate(rawDesc, 170) : null;

    const mediaRef = node.relationships?.field_article_media?.data;
    let imageUrl: string | null = null;
    let imageAlt: string | null = null;

    if (mediaRef?.type === "media--image") {
      const media = findIncluded<{
        type: string; id: string;
        relationships: { field_media_image: { data: JsonApiResource } };
      }>(included, mediaRef.type, mediaRef.id);

      if (media) {
        const fileRef = media.relationships.field_media_image?.data;
        const file = fileRef
          ? findIncluded<{ type: string; id: string; attributes: { uri: { url: string }; filename: string } }>(
              included, fileRef.type, fileRef.id
            )
          : undefined;
        if (file) {
          imageUrl = `${DRUPAL_BASE}${file.attributes.uri.url}`;
          imageAlt = file.attributes.filename;
        }
      }
    }

    return {
      nid: attrs.drupal_internal__nid,
      title: attrs.title,
      excerpt,
      dateIso: attrs.created,
      imageUrl,
      imageAlt,
    };
  });
}

export async function getAllArticleNids(): Promise<number[]> {
  const url = `${DRUPAL_BASE}/jsonapi/node/article?fields[node--article]=drupal_internal__nid`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data ?? []).map((n: { attributes: { drupal_internal__nid: number } }) => n.attributes.drupal_internal__nid);
}
