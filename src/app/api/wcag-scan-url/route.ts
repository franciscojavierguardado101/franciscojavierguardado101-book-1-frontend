import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

export const maxDuration = 60;

const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const PRIVATE_IP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|fc00:|fe80:)/i;

function validateUrl(raw: string): { ok: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "Invalid URL format." };
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: "Only http:// and https:// URLs are allowed." };
  }
  if (BLOCKED_HOSTNAMES.has(parsed.hostname)) {
    return { ok: false, reason: "Scanning localhost or loopback addresses is not allowed." };
  }
  if (PRIVATE_IP.test(parsed.hostname)) {
    return { ok: false, reason: "Scanning private/internal IP ranges is not allowed." };
  }
  return { ok: true };
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const url = (body.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "url is required." }, { status: 400 });
  }

  const validation = validateUrl(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 422 });
  }

  let browser;
  try {
    // On Vercel use @sparticuz/chromium (serverless-optimised binary).
    // On Docker/OKE the PLAYWRIGHT_BROWSERS_PATH env var points to pre-installed browsers.
    let executablePath: string | undefined;
    let launchArgs: string[] = [];
    if (process.env.VERCEL) {
      const sparticuz = (await import("@sparticuz/chromium")).default;
      executablePath = await sparticuz.executablePath();
      launchArgs = sparticuz.args;
    }

    browser = await chromium.launch({
      headless: true,
      executablePath,
      args: launchArgs,
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (compatible; WCAG-Checker/1.0; +https://franciscojavierguardado.com)",
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a", "wcag2aa",
        "wcag21a", "wcag21aa",
        "wcag22aa",
        "section508",
        "best-practice",
      ])
      .analyze();

    await browser.close();

    return NextResponse.json({
      mode: "url",
      scannedUrl: url,
      timestamp: new Date().toISOString(),
      violations:   results.violations,
      incomplete:   results.incomplete,
      passes:       results.passes.map(({ id, impact, description, help, helpUrl, tags }) => ({
        id, impact, description, help, helpUrl, tags, nodes: [],
      })),
      inapplicable: results.inapplicable.length,
      testEngine:   results.testEngine,
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Scan failed: ${message}` },
      { status: 500 }
    );
  }
}
