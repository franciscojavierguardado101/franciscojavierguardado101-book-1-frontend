import { NextResponse } from "next/server";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export async function GET() {
  try {
    const upstream = await fetch(`${DRUPAL_BASE}/nasa-fireball-data.csv`, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch CSV" }, { status: upstream.status });
    }

    const csv = await upstream.text();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nasa-fireball-data.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 500 });
  }
}
