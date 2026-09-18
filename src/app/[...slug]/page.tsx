import { notFound } from "next/navigation";
import { resolveDrupalNode } from "@/lib/drupal-router";
import { getNodeComponents } from "@/lib/drupal-landing-page";
import ParagraphRenderer from "@/components/paragraphs/ParagraphRenderer";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DrupalPage({ params }: Props) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const node = await resolveDrupalNode(path);
  if (!node) return notFound();

  const paragraphs = await getNodeComponents(node.type, node.uuid);
  if (!paragraphs.length) return notFound();

  return (
    <>
      {paragraphs.map((paragraph) => (
        <ParagraphRenderer key={paragraph.id} paragraph={paragraph} />
      ))}
    </>
  );
}
