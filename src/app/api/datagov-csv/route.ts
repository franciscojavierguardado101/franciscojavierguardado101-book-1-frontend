import { NextResponse } from "next/server";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export async function GET() {
  try {
    // Fetch all available data (no limit) for the full CSV export.
    const upstream = await fetch(
      `${DRUPAL_BASE}/api/datagov-chart?limit=100&chart_type=line`,
      { cache: "no-store" }
    );

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: upstream.status });
    }

    const json = await upstream.json() as {
      data: { date: string; label: string; unemployment: number | null; cpi: number | null }[];
    };

    const rows = [
      "Date,Month,Unemployment Rate (%),CPI-U All Items (1982-84=100)",
      ...(json.data ?? []).map((d) =>
        [
          d.date,
          d.label,
          d.unemployment ?? "",
          d.cpi ?? "",
        ].join(",")
      ),
    ].join("\n");

    return new NextResponse(rows, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="bls-unemployment-cpi.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 });
  }
}
