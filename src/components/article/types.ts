export type ArticleBgColor = "article_black" | "article_white";

export interface ArticleListItem {
  nid: number;
  title: string;
  excerpt: string | null;
  dateIso: string;
  imageUrl: string | null;
  imageAlt: string | null;
}

export type ArticleMediaType = "image" | "remote_video" | "video";

export interface ArticleMediaData {
  type: ArticleMediaType;
  url: string;
  alt?: string;
}

export interface ArticleData {
  nid: number;
  title: string;
  description: string | null;
  author: string | null;
  bgColor: ArticleBgColor;
  media: ArticleMediaData | null;
}
