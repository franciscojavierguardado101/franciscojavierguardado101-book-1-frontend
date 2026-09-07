import { type NextRequest } from "next/server";
import { searchContent } from "@/lib/drupal-search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const results = await searchContent(q);
  return Response.json({ results });
}
