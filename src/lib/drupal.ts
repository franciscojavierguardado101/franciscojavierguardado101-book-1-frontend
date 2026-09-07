import type { CarouselCardData, ArtPosition, ButtonColor } from "@/components/paragraphs/carousel-hero";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

const LANDING_PAGE_UUID = "193369ad-3aae-4c04-b101-25fd68cbd68d";

const INCLUDE = [
  "field_components",
  "field_components.field_create_card",
  "field_components.field_create_card.field_carousel_hero_hero_image",
  "field_components.field_create_card.field_carousel_hero_hero_image.field_media_image",
].join(",");

interface JsonApiFile {
  type: "file--file";
  id: string;
  attributes: { uri: { url: string } };
}

interface JsonApiMedia {
  type: "media--image";
  id: string;
  relationships: {
    field_media_image: { data: { type: string; id: string } };
  };
}

interface JsonApiCarouselCard {
  type: "paragraph--carousel";
  id: string;
  attributes: {
    field_carousel_hero_art_pos: ArtPosition;
    field_carousel_hero_color: ButtonColor;
    field_carousel_hero_title: string;
    field_carousel_hero_top_caption: string | null;
    field_carousel_hero_low_caption: string | null;
    field_carousel_hero_link: { uri: string; resolvable_uri: string; title: string } | null;
  };
  relationships: {
    field_carousel_hero_hero_image: { data: { type: string; id: string } | null };
  };
}

function findIncluded<T extends { type: string; id: string }>(
  included: { type: string; id: string }[],
  type: string,
  id: string
): T | undefined {
  return included.find((r) => r.type === type && r.id === id) as T | undefined;
}

export async function getLandingPageCarouselCards(): Promise<CarouselCardData[]> {
  const url = `${DRUPAL_BASE}/jsonapi/node/landing_page/${LANDING_PAGE_UUID}?include=${INCLUDE}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  const included: { type: string; id: string }[] = json.included ?? [];

  const carouselHeroParagraph = included.find((r) => r.type === "paragraph--carousel_hero");
  if (!carouselHeroParagraph) return [];

  const cardRefs: { type: string; id: string }[] =
    (carouselHeroParagraph as unknown as { relationships: { field_create_card: { data: { type: string; id: string }[] } } })
      .relationships.field_create_card.data;

  return cardRefs.map((ref, i): CarouselCardData => {
    const card = findIncluded<JsonApiCarouselCard>(included, "paragraph--carousel", ref.id);
    if (!card) {
      return { id: ref.id, image: "/placeholder-hero-1.jpg", artPosition: "carousel_hero_lower_left", title: "" };
    }

    const mediaRef = card.relationships.field_carousel_hero_hero_image.data;
    let imageUrl = "/placeholder-hero-1.jpg";

    if (mediaRef) {
      const media = findIncluded<JsonApiMedia>(included, mediaRef.type, mediaRef.id);
      if (media) {
        const fileRef = media.relationships.field_media_image.data;
        const file = findIncluded<JsonApiFile>(included, fileRef.type, fileRef.id);
        if (file) {
          imageUrl = `${DRUPAL_BASE}${file.attributes.uri.url}`;
        }
      }
    }

    const link = card.attributes.field_carousel_hero_link;

    return {
      id: card.id,
      image: imageUrl,
      artPosition: card.attributes.field_carousel_hero_art_pos,
      buttonColor: card.attributes.field_carousel_hero_color,
      title: card.attributes.field_carousel_hero_title,
      topCaption: card.attributes.field_carousel_hero_top_caption ?? undefined,
      lowCaption: card.attributes.field_carousel_hero_low_caption ?? undefined,
      linkHref: link?.resolvable_uri ?? link?.uri ?? undefined,
      linkLabel: link?.title ?? undefined,
    };
  });
}
