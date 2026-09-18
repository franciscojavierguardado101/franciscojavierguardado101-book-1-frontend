import type { DescriptiveContentData } from "./types";

interface Props {
  data: DescriptiveContentData;
}

export default function DescriptiveContent({ data }: Props) {
  const { title, description } = data;

  if (!title && !description) return null;

  return (
    <section style={{ padding: "64px 0" }}>
      <div className="page-width">
        <div style={{ maxWidth: 720 }}>
          {title && (
            <h2
              style={{
                fontFamily: "var(--font-header)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                letterSpacing: "0.04em",
                color: "#fff",
                marginBottom: description ? 24 : 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
          )}

          {description && (
            <div
              className="descriptive-content__body"
              dangerouslySetInnerHTML={{ __html: description }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                lineHeight: 1.75,
                color: "var(--color-muted)",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
