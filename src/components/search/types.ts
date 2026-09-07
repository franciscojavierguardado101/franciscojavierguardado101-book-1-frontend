export interface SearchResult {
  id: string;
  type: "article";
  title: string;
  excerpt?: string;
  href: string;
  dateIso?: string;
}

export interface SearchResponse {
  results: SearchResult[];
}
