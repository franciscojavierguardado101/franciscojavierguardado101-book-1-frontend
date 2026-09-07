import { VIEW_REGISTRY } from "@/lib/view-registry";

interface ViewEmbedProps {
  viewName: string;
  displayId: string;
}

export default async function ViewEmbed({ viewName, displayId }: ViewEmbedProps) {
  const render = VIEW_REGISTRY[viewName];
  if (!render) return null;
  return <>{await render(displayId)}</>;
}
