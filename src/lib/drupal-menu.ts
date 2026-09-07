const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterNavItem {
  id: string;
  label: string;
  href: string;
}

export interface FooterMenuSection {
  id: string;
  label: string;
  items: FooterNavItem[];
}

export async function getFooterMenu(): Promise<FooterMenuSection[]> {
  // id is the top-level JSON:API resource id (e.g. "menu_link_content:UUID"),
  // which is what attributes.parent references for child items.
  interface RawItem {
    id: string;
    attributes: {
      title: string;
      url: string;
      enabled: boolean;
      weight: number;
      parent: string;
    };
  }

  try {
    const res = await fetch(`${DRUPAL_BASE}/jsonapi/menu_items/footer`, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const all: RawItem[] = (json.data ?? [])
      .filter((item: RawItem) => item.attributes.enabled)
      .sort((a: RawItem, b: RawItem) => a.attributes.weight - b.attributes.weight);

    const topLevel = all.filter((item) => !item.attributes.parent);
    const children = all.filter((item) => !!item.attributes.parent);

    if (topLevel.length === 0) {
      return [{
        id: "flat",
        label: "",
        items: all.map((i) => ({ id: i.id, label: i.attributes.title, href: i.attributes.url })),
      }];
    }

    return topLevel.map((parent): FooterMenuSection => ({
      id: parent.id,
      label: parent.attributes.title,
      items: children
        .filter((child) => child.attributes.parent === parent.id)
        .map((child): FooterNavItem => ({ id: child.id, label: child.attributes.title, href: child.attributes.url })),
    }));
  } catch {
    return [];
  }
}

export async function getMainMenu(): Promise<NavItem[]> {
  try {
    const res = await fetch(`${DRUPAL_BASE}/jsonapi/menu_items/main`, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    return (json.data ?? [])
      .filter((item: { attributes: { enabled: boolean } }) => item.attributes.enabled)
      .sort(
        (a: { attributes: { weight: number } }, b: { attributes: { weight: number } }) =>
          a.attributes.weight - b.attributes.weight
      )
      .map((item: { attributes: { title: string; url: string } }): NavItem => ({
        label: item.attributes.title,
        href: item.attributes.url,
      }));
  } catch {
    return [];
  }
}
