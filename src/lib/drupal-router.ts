const DRUPAL_BASE =
  process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export interface ResolvedNode {
  type: string;
  uuid: string;
}

// Resolves a frontend path like "/calendar" to the Drupal node type + UUID.
// Uses the CMS-side /api/resolve-path endpoint (backed by Drupal's AliasManager).
// Accepts any published node type — no whitelist needed.
export async function resolveDrupalNode(path: string): Promise<ResolvedNode | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE}/api/resolve-path?path=${encodeURIComponent(path)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const data = await res.json() as { type?: string; uuid?: string };
    if (!data.uuid || !data.type) return null;

    return { type: data.type, uuid: data.uuid };
  } catch {
    return null;
  }
}
