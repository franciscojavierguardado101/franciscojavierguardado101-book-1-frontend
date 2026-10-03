import { type NextRequest } from "next/server";

const NASA_SEARCH = "https://images-api.nasa.gov/search";
const NASA_ASSET = "https://images-api.nasa.gov/asset";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");

  if (action === "asset") {
    const id = searchParams.get("id") ?? "";
    try {
      const res = await fetch(`${NASA_ASSET}/${encodeURIComponent(id)}`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) return Response.json({ error: `Asset API returned ${res.status}` }, { status: res.status });
      const data = await res.json();
      const hrefs: string[] = (data.collection?.items ?? []).map((i: { href: string }) => i.href);
      const mp4 =
        hrefs.find((h) => h.endsWith("~medium.mp4")) ??
        hrefs.find((h) => h.endsWith("~mobile.mp4")) ??
        hrefs.find((h) => h.endsWith(".mp4")) ??
        null;
      return Response.json({ videoUrl: mp4 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  const q = searchParams.get("q") ?? "space";
  const page = searchParams.get("page") ?? "1";
  const pageSize = "12";

  try {
    const url = `${NASA_SEARCH}?q=${encodeURIComponent(q)}&media_type=video&page=${page}&page_size=${pageSize}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return Response.json({ error: `NASA API returned ${res.status}`, items: [] }, { status: res.status });

    const data = await res.json();
    const raw = data.collection?.items ?? [];
    const total: number = data.collection?.metadata?.total_hits ?? 0;

    const items = raw.map((item: {
      data: Array<{ nasa_id: string; title: string; description?: string; date_created?: string; keywords?: string[] }>;
      links?: Array<{ href: string; rel: string }>;
    }) => {
      const d = item.data[0];
      const thumbRaw = item.links?.find((l) => l.rel === "preview")?.href ?? "";
      const thumbnail = thumbRaw && !thumbRaw.endsWith(".jpg") ? `${thumbRaw}.jpg` : thumbRaw;
      return {
        nasaId: d.nasa_id,
        title: d.title,
        description: d.description ?? "",
        dateCreated: d.date_created ?? "",
        thumbnail,
        keywords: d.keywords ?? [],
      };
    });

    return Response.json({ items, total, page: Number(page) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message, items: [] }, { status: 500 });
  }
}
