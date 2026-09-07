import { getLandingPageComponents } from "@/lib/drupal-landing-page";
import ParagraphRenderer from "@/components/paragraphs/ParagraphRenderer";

const LANDING_PAGE_UUID =
  process.env.LANDING_PAGE_UUID ?? "193369ad-3aae-4c04-b101-25fd68cbd68d";

export default async function HomePage() {
  const paragraphs = await getLandingPageComponents(LANDING_PAGE_UUID);

  return (
    <>
      {paragraphs.map((paragraph) => (
        <ParagraphRenderer key={paragraph.id} paragraph={paragraph} />
      ))}
    </>
  );
}
