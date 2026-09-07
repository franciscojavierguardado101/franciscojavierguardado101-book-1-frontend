import type { CarouselCardData, ArtPosition, ButtonColor } from "@/components/paragraphs/carousel-hero";
import type { MosaicPhotoCardData } from "@/components/paragraphs/mosaic-photos";
import type { FeatureSpotData, FeatureSpotPosition, FeatureSpotBgColor } from "@/components/paragraphs/feature-spot";

const DRUPAL_BASE = process.env.DRUPAL_BASE_URL ?? "https://francisco-guardado-book-1.ddev.site:33300";

// ─── Paragraph discriminated union ───────────────────────────────────────────

export type ParagraphCarouselHero = {
  type: "paragraph--carousel_hero";
  id: string;
  cards: CarouselCardData[];
};

export type ParagraphViewEmbed = {
  type: "paragraph--view_embed";
  id: string;
  viewName: string;
  displayId: string;
};

export type ParagraphRichText = {
  type: "paragraph--rich_text";
  id: string;
  text: string | null;
};

export type ParagraphMosaicPhotos = {
  type: "paragraph--mosaic_photos";
  id: string;
  heading?: string;
  cards: MosaicPhotoCardData[];
};

export type ParagraphFeatureSpot = {
  type: "paragraph--feature_spot";
  id: string;
  data: FeatureSpotData;
};

export type ParagraphData =
  | ParagraphCarouselHero
  | ParagraphViewEmbed
  | ParagraphRichText
  | ParagraphMosaicPhotos
  | ParagraphFeatureSpot;

// ─── JSON:API helpers ─────────────────────────────────────────────────────────

interface AnyResource { type: string; id: string }

function findIncluded<T extends AnyResource>(
  included: AnyResource[],
  type: string,
  id: string,
): T | undefined {
  return included.find((r) => r.type === type && r.id === id) as T | undefined;
}

// Base includes — always safe regardless of which paragraphs are on the node.
const INCLUDE_BASE = [
  "field_components",
  "field_components.field_create_card",
  "field_components.field_create_card.field_carousel_hero_hero_image",
  "field_components.field_create_card.field_carousel_hero_hero_image.field_media_image",
].join(",");

// Extended includes for mosaic_photos. Only requested in second pass when needed.
const INCLUDE_MOSAIC = [
  "field_components.field_mosaic_photo_photo",
  "field_components.field_mosaic_photo_photo.field_mpc_media",
  "field_components.field_mosaic_photo_photo.field_mpc_media.field_media_image",
].join(",");

// Extended includes for feature_spot. Only requested in second pass when needed.
const INCLUDE_FEATURE_SPOT = [
  "field_components.field_feat_spot_image",
  "field_components.field_feat_spot_image.field_media_image",
].join(",");

// ─── Main fetcher ─────────────────────────────────────────────────────────────

export async function getLandingPageComponents(
  nodeUuid: string,
): Promise<ParagraphData[]> {
  // First pass: base includes (always works)
  const baseUrl = `${DRUPAL_BASE}/jsonapi/node/landing_page/${nodeUuid}?include=${INCLUDE_BASE}`;
  const baseRes = await fetch(baseUrl, {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 60 },
  });

  if (!baseRes.ok) return [];

  const baseJson = await baseRes.json();
  const paragraphRefs: AnyResource[] =
    baseJson.data?.relationships?.field_components?.data ?? [];

  const hasMosaic = paragraphRefs.some((r) => r.type === "paragraph--mosaic_photos");
  const hasFeatureSpot = paragraphRefs.some((r) => r.type === "paragraph--feature_spot");

  // Second pass: re-fetch with extended includes only when needed.
  let included: AnyResource[] = baseJson.included ?? [];
  if (hasMosaic || hasFeatureSpot) {
    const extras: string[] = [INCLUDE_BASE];
    if (hasMosaic) extras.push(INCLUDE_MOSAIC);
    if (hasFeatureSpot) extras.push(INCLUDE_FEATURE_SPOT);
    const fullUrl = `${DRUPAL_BASE}/jsonapi/node/landing_page/${nodeUuid}?include=${extras.join(",")}`;
    const fullRes = await fetch(fullUrl, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 60 },
    });
    if (fullRes.ok) {
      const fullJson = await fullRes.json();
      included = fullJson.included ?? [];
    }
  }

  return paragraphRefs.flatMap((ref): ParagraphData[] => {
    switch (ref.type) {
      case "paragraph--carousel_hero": return [parseCarouselHero(ref.id, included)];
      case "paragraph--view_embed": {
        const p = parseViewEmbed(ref.id, included);
        return p ? [p] : [];
      }
      case "paragraph--rich_text": return [parseRichText(ref.id, included)];
      case "paragraph--mosaic_photos": return [parseMosaicPhotos(ref.id, included)];
      case "paragraph--feature_spot": {
        const p = parseFeatureSpot(ref.id, included);
        return p ? [p] : [];
      }
      default: return [];
    }
  });
}

// ─── Paragraph parsers ────────────────────────────────────────────────────────

function parseCarouselHero(id: string, included: AnyResource[]): ParagraphCarouselHero {
  type ApiHero = AnyResource & {
    relationships: { field_create_card: { data: AnyResource[] } };
  };
  type ApiCard = AnyResource & {
    attributes: {
      field_carousel_hero_art_pos: ArtPosition;
      field_carousel_hero_color: ButtonColor;
      field_carousel_hero_title: string;
      field_carousel_hero_top_caption: string | null;
      field_carousel_hero_low_caption: string | null;
      field_carousel_hero_link: { uri: string; resolvable_uri: string; title: string } | null;
    };
    relationships: { field_carousel_hero_hero_image: { data: AnyResource | null } };
  };
  type ApiMedia = AnyResource & {
    relationships: { field_media_image: { data: AnyResource } };
  };
  type ApiFile = AnyResource & {
    attributes: { uri: { url: string } };
  };

  const hero = findIncluded<ApiHero>(included, "paragraph--carousel_hero", id);
  if (!hero) return { type: "paragraph--carousel_hero", id, cards: [] };

  const cards: CarouselCardData[] = hero.relationships.field_create_card.data.map((ref) => {
    const card = findIncluded<ApiCard>(included, "paragraph--carousel", ref.id);
    if (!card) {
      return { id: ref.id, image: "/placeholder-hero-1.jpg", artPosition: "carousel_hero_lower_left" as ArtPosition, title: "" };
    }

    const mediaRef = card.relationships.field_carousel_hero_hero_image.data;
    let image = "/placeholder-hero-1.jpg";
    if (mediaRef) {
      const media = findIncluded<ApiMedia>(included, mediaRef.type, mediaRef.id);
      if (media) {
        const fileRef = media.relationships.field_media_image.data;
        const file = findIncluded<ApiFile>(included, fileRef.type, fileRef.id);
        if (file) image = `${DRUPAL_BASE}${file.attributes.uri.url}`;
      }
    }

    const link = card.attributes.field_carousel_hero_link;
    return {
      id: card.id,
      image,
      artPosition: card.attributes.field_carousel_hero_art_pos,
      buttonColor: card.attributes.field_carousel_hero_color,
      title: card.attributes.field_carousel_hero_title,
      topCaption: card.attributes.field_carousel_hero_top_caption ?? undefined,
      lowCaption: card.attributes.field_carousel_hero_low_caption ?? undefined,
      linkHref: link?.resolvable_uri ?? link?.uri ?? undefined,
      linkLabel: link?.title ?? undefined,
    };
  });

  return { type: "paragraph--carousel_hero", id, cards };
}

function parseViewEmbed(id: string, included: AnyResource[]): ParagraphViewEmbed | null {
  type ApiViewEmbed = AnyResource & {
    attributes: {
      field_view_reference: { view_name: string; display_id: string } | null;
    };
  };

  const para = findIncluded<ApiViewEmbed>(included, "paragraph--view_embed", id);
  if (!para?.attributes.field_view_reference) return null;

  return {
    type: "paragraph--view_embed",
    id,
    viewName: para.attributes.field_view_reference.view_name,
    displayId: para.attributes.field_view_reference.display_id,
  };
}

function parseRichText(id: string, included: AnyResource[]): ParagraphRichText {
  type ApiRichText = AnyResource & {
    attributes: { field_text: { processed?: string; value?: string } | null };
  };

  const para = findIncluded<ApiRichText>(included, "paragraph--rich_text", id);
  const text =
    para?.attributes.field_text?.processed ??
    para?.attributes.field_text?.value ??
    null;

  return { type: "paragraph--rich_text", id, text };
}

function parseMosaicPhotos(id: string, included: AnyResource[]): ParagraphMosaicPhotos {
  type ApiMosaicPhotos = AnyResource & {
    attributes: {
      field_mosaic_photos_heading: string | null;
    };
    relationships: {
      field_mosaic_photo_photo: { data: AnyResource[] };
    };
  };
  type ApiCard = AnyResource & {
    attributes: {
      field_mpc_title: string | null;
      field_mpc_caption: string | null;
      field_mpc_credit: string | null;
      // string_long → plain string; text_long → { processed, value }
      field_mpc_description: string | { processed?: string; value?: string } | null;
    };
    relationships: {
      field_mpc_media: { data: AnyResource | null };
    };
  };
  type ApiMediaImage = AnyResource & {
    relationships: {
      field_media_image: { data: AnyResource };
    };
  };
  type ApiFile = AnyResource & {
    attributes: { uri: { url: string }; filename?: string };
  };
  type ApiMediaRemoteVideo = AnyResource & {
    attributes: { field_media_oembed_video: string | null };
  };

  const para = findIncluded<ApiMosaicPhotos>(included, "paragraph--mosaic_photos", id);
  if (!para) return { type: "paragraph--mosaic_photos", id, cards: [] };

  const heading = para.attributes.field_mosaic_photos_heading ?? undefined;
  const cardRefs = para.relationships.field_mosaic_photo_photo.data;

  const cards: MosaicPhotoCardData[] = cardRefs.flatMap((ref): MosaicPhotoCardData[] => {
    const card = findIncluded<ApiCard>(included, "paragraph--mosaic_photos_card", ref.id);
    if (!card) return [];

    const mediaRef = card.relationships.field_mpc_media.data;
    let imageUrl = "";
    let mediaType: MosaicPhotoCardData["mediaType"] = "image";
    let videoUrl: string | undefined;

    if (mediaRef) {
      if (mediaRef.type === "media--image") {
        const media = findIncluded<ApiMediaImage>(included, "media--image", mediaRef.id);
        if (media) {
          const fileRef = media.relationships.field_media_image.data;
          const file = findIncluded<ApiFile>(included, fileRef.type, fileRef.id);
          if (file) imageUrl = `${DRUPAL_BASE}${file.attributes.uri.url}`;
        }
      } else if (mediaRef.type === "media--remote_video") {
        mediaType = "remote_video";
        const media = findIncluded<ApiMediaRemoteVideo>(included, "media--remote_video", mediaRef.id);
        videoUrl = media?.attributes.field_media_oembed_video ?? undefined;
        // Use a placeholder image for remote video until thumbnail support is added
        imageUrl = "";
      } else if (mediaRef.type === "media--video") {
        mediaType = "video";
        imageUrl = "";
      }
    }

    const descRaw = card.attributes.field_mpc_description;
    let description: string | undefined;
    if (typeof descRaw === 'string') {
      // string_long: plain text — convert double line-breaks to <p> blocks
      description = descRaw.trim()
        ? descRaw
            .split(/\r?\n\r?\n/)
            .map((p) => `<p>${p.trim().replace(/\r?\n/g, '<br>')}</p>`)
            .join('')
        : undefined;
    } else {
      description = descRaw?.processed ?? descRaw?.value ?? undefined;
    }

    return [
      {
        id: card.id,
        title: card.attributes.field_mpc_title ?? "",
        caption: card.attributes.field_mpc_caption ?? undefined,
        credit: card.attributes.field_mpc_credit ?? undefined,
        description,
        imageUrl,
        mediaType,
        videoUrl,
      },
    ];
  });

  return { type: "paragraph--mosaic_photos", id, heading, cards };
}

function parseFeatureSpot(id: string, included: AnyResource[]): ParagraphFeatureSpot | null {
  type ApiFeatureSpot = AnyResource & {
    attributes: {
      field_feat_spot_title: string | null;
      // string_long → plain string
      field_feat_spot_description: string | { processed?: string; value?: string } | null;
      field_feat_spot_link: { uri: string; resolvable_uri?: string; title: string } | null;
      field_feat_spot_position: FeatureSpotPosition | null;
      field_feat_spot_bg_color: FeatureSpotBgColor | null;
    };
    relationships: {
      field_feat_spot_image: { data: AnyResource | null };
    };
  };
  type ApiMedia = AnyResource & {
    relationships: { field_media_image: { data: AnyResource } };
  };
  type ApiFile = AnyResource & {
    attributes: { uri: { url: string }; filename?: string; alt?: string };
  };

  const para = findIncluded<ApiFeatureSpot>(included, "paragraph--feature_spot", id);
  if (!para) return null;

  const title = para.attributes.field_feat_spot_title ?? "";
  const position = para.attributes.field_feat_spot_position ?? "fs_up_right_side";
  const bgColor = para.attributes.field_feat_spot_bg_color ?? undefined;

  const descRaw = para.attributes.field_feat_spot_description;
  let description: string | undefined;
  if (typeof descRaw === "string") {
    description = descRaw.trim()
      ? descRaw
          .split(/\r?\n\r?\n/)
          .map((p) => `<p>${p.trim().replace(/\r?\n/g, "<br>")}</p>`)
          .join("")
      : undefined;
  } else {
    description = descRaw?.processed ?? descRaw?.value ?? undefined;
  }

  const link = para.attributes.field_feat_spot_link;
  const linkLabel = link?.title ?? undefined;
  let linkHref: string | undefined;
  if (link) {
    const raw = link.resolvable_uri ?? link.uri;
    // Drupal stores internal links as "internal:/path" — strip the scheme prefix.
    linkHref = raw.startsWith("internal:") ? raw.slice("internal:".length) : raw;
  }

  const mediaRef = para.relationships.field_feat_spot_image?.data;
  let imageUrl = "";
  let imageAlt: string | undefined;

  if (mediaRef) {
    const media = findIncluded<ApiMedia>(included, mediaRef.type, mediaRef.id);
    if (media) {
      const fileRef = media.relationships.field_media_image.data;
      const file = findIncluded<ApiFile>(included, fileRef.type, fileRef.id);
      if (file) {
        imageUrl = `${DRUPAL_BASE}${file.attributes.uri.url}`;
        imageAlt = (file.attributes as { alt?: string }).alt;
      }
    }
  }

  return {
    type: "paragraph--feature_spot",
    id,
    data: { id, title, description, linkHref, linkLabel, imageUrl, imageAlt, position, bgColor },
  };
}
