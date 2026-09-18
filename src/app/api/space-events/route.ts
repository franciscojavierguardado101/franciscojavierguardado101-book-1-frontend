import { type NextRequest } from "next/server";

const DRUPAL_BASE =
  process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

interface DrupalApiConfig {
  api_base_url: string;
  api_key: string;
  cache_max_age: number;
}

// Fetch API config from Drupal CMS — this is the single source of truth
// for the API endpoint and key. Swap providers by updating Drupal config only.
async function fetchApiConfig(): Promise<DrupalApiConfig> {
  const res = await fetch(`${DRUPAL_BASE}/api/space-calendar/config`, {
    next: { revalidate: 300 }, // re-read CMS config every 5 min
  });
  if (!res.ok) throw new Error("Could not load API config from CMS");
  return res.json();
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const eventType = (searchParams.get("type") ?? "FLR").toUpperCase();
  const startDate = searchParams.get("startDate") ?? toDateString(new Date());
  const endDate = searchParams.get("endDate") ?? startDate;

  try {
    const config = await fetchApiConfig();
    const { api_base_url, api_key, cache_max_age } = config;

    const url =
      `${api_base_url}${eventType}` +
      `?startDate=${startDate}&endDate=${endDate}&api_key=${api_key}`;

    const res = await fetch(url, {
      next: { revalidate: cache_max_age ?? 3600 },
    });

    if (!res.ok) {
      return Response.json({ events: [], eventType, error: `API returned ${res.status}` });
    }

    const data = await res.json();
    return Response.json({
      events: Array.isArray(data) ? data : [],
      eventType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ events: [], eventType, error: message }, { status: 500 });
  }
}
