/**
 * A single JSON-LD block. Rendered server-side into the document so crawlers
 * that do not run JavaScript still see the graph.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is ours, built from constants — no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
