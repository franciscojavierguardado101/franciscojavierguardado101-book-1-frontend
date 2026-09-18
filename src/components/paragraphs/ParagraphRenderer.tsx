import type { ParagraphData } from "@/lib/drupal-landing-page";
import { CarouselHero } from "@/components/paragraphs/carousel-hero";
import ViewEmbed from "@/components/paragraphs/view-embed/ViewEmbed";
import { MosaicPhotos } from "@/components/paragraphs/mosaic-photos";
import { FeatureSpot } from "@/components/paragraphs/feature-spot";
import { SpaceCalendar } from "@/components/paragraphs/space-calendar";
import { DescriptiveContent } from "@/components/paragraphs/descriptive-content";

export default function ParagraphRenderer({ paragraph }: { paragraph: ParagraphData }) {
  switch (paragraph.type) {
    case "paragraph--carousel_hero":
      return <CarouselHero cards={paragraph.cards} />;

    case "paragraph--view_embed":
      return <ViewEmbed viewName={paragraph.viewName} displayId={paragraph.displayId} />;

    case "paragraph--rich_text":
      return paragraph.text
        ? <div dangerouslySetInnerHTML={{ __html: paragraph.text }} />
        : null;

    case "paragraph--mosaic_photos":
      return <MosaicPhotos id={paragraph.id} heading={paragraph.heading} cards={paragraph.cards} />;

    case "paragraph--feature_spot":
      return <FeatureSpot data={paragraph.data} />;

    case "paragraph--space_calendar":
      return <SpaceCalendar heading={paragraph.heading} />;

    case "paragraph--descriptive_content":
      return <DescriptiveContent data={paragraph.data} />;
  }
}
