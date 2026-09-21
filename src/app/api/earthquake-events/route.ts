import { type NextRequest } from "next/server";

const USGS_BASE = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary";

const VALID_RANGES = new Set(["hour", "day", "week", "month"]);

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "day";
  const safeRange = VALID_RANGES.has(range) ? range : "day";

  try {
    const res = await fetch(`${USGS_BASE}/all_${safeRange}.geojson`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return Response.json(
        { count: 0, features: [], error: `USGS returned ${res.status}` },
        { status: res.status },
      );
    }

    const geojson = await res.json();

    const features = (geojson.features ?? []).map(
      (f: {
        id: string;
        properties: { mag: number; place: string; time: number; url: string };
        geometry: { coordinates: [number, number, number] };
      }) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        depth: Math.round(f.geometry.coordinates[2] * 10) / 10,
        url: f.properties.url,
      }),
    );

    return Response.json({ count: geojson.metadata?.count ?? features.length, features });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ count: 0, features: [], error: message }, { status: 500 });
  }
}
