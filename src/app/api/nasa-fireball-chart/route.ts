import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit     = searchParams.get("limit")      ?? "50";
  const chartType = searchParams.get("chart_type") ?? "bar";

  try {
    const upstream = await fetch(
      `${DRUPAL_BASE}/api/nasa-fireball-chart?limit=${limit}&chart_type=${chartType}`,
      { next: { revalidate: 300 } }
    );

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
