/**
 * Renders a JSON-LD structured-data block. "<" is escaped so a value can
 * never break out of the <script> element (matters once post content comes
 * from the database).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
