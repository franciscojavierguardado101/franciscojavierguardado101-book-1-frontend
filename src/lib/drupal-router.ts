const DRUPAL_BASE =
  process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export type KnownNodeType = "landing_page" | "calendar_event";

export interface ResolvedNode {
  type: KnownNodeType;
  uuid: string;
}

const KNOWN_TYPES = new Set<KnownNodeType>(["landing_page", "calendar_event"]);

// Resolves a frontend path like "/calendar" to the Drupal node type + UUID.
// Uses the CMS-side /api/resolve-path endpoint (backed by Drupal's AliasManager).
export async function resolveDrupalNode(path: string): Promise<ResolvedNode | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE}/api/resolve-path?path=${encodeURIComponent(path)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const data = await res.json() as { type?: string; uuid?: string };
    if (!data.uuid || !data.type) return null;
    if (!KNOWN_TYPES.has(data.type as KnownNodeType)) return null;

    return { type: data.type as KnownNodeType, uuid: data.uuid };
  } catch {
    return null;
  }
}
