import { type NextRequest } from "next/server";

const DRUPAL_BASE =
  process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

const NEW_APOD_BASE = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

interface ApodConfig {
  gallery_count: number;
  cache_max_age: number;
}

async function timedFetch(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchApodConfig(): Promise<ApodConfig> {
  try {
    const res = await timedFetch(`${DRUPAL_BASE}/api/apod/config`, 4000);
    if (!res.ok) throw new Error("config fetch failed");
    const data = await res.json();
    return { gallery_count: data.gallery_count ?? 6, cache_max_age: data.cache_max_age ?? 3600 };
  } catch {
    return { gallery_count: 6, cache_max_age: 3600 };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("mode") ?? "today";

  try {
    // Skip config fetch for today mode — gallery_count only matters for random
    const perPage = mode === "random" ? String((await fetchApodConfig()).gallery_count) : "1";
    const url = `${NEW_APOD_BASE}?per_page=${perPage}`;

    const res = await timedFetch(url, 8000);

    if (!res.ok) {
      return Response.json({ error: `NASA API returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    if (mode === "random") {
      return Response.json(Array.isArray(data) ? data : [data]);
    }
    return Response.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
