import { type NextRequest } from "next/server";

const ISS_POSITION_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const ISS_CREW_URL = "https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "position";

  if (type === "crew") {
    try {
      const res = await fetch(ISS_CREW_URL, { next: { revalidate: 3600 } });
      if (!res.ok) {
        return Response.json(
          { error: `Crew API returned ${res.status}`, crew: [] },
          { status: res.status },
        );
      }
      const data = await res.json();
      const crew = (data.people ?? []).map((p: { name: string }) => ({
        name: p.name,
        craft: "ISS",
      }));
      return Response.json({ crew, total: crew.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return Response.json({ error: message, crew: [] }, { status: 500 });
    }
  }

  try {
    const res = await fetch(ISS_POSITION_URL, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(
        { error: `ISS API returned ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    return Response.json({
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: Math.round(data.altitude * 10) / 10,
      velocity: Math.round(data.velocity),
      visibility: data.visibility,
      footprint: Math.round(data.footprint),
      timestamp: data.timestamp,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
