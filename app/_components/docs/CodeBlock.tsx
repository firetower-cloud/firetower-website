import type { ReactNode } from "react";
import { Copy } from "../Copy";

/**
 * A fenced code block: language label, copy button, highlighted body.
 *
 * The highlighting is already done — `rehype-pretty-code` ran Shiki at build
 * time and handed us coloured spans, so nothing here ships to the browser
 * except the copy button.
 *
 * Getting the raw text back for that button is the awkward part. The obvious
 * route is a rehype plugin that stashes the source on the node, but Turbopack
 * only accepts serializable plugin options, so there is nowhere to put the
 * function that would do it. Walking the rendered children is the way round
 * that, and it costs nothing at build time.
 */
function toText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return toText(props?.children);
  }
  return "";
}

export function CodeBlock({
  children,
  ...props
}: {
  children?: ReactNode;
  "data-language"?: string;
}) {
  const language = props["data-language"];
  const source = toText(children);

  return (
    <div className="panel mt-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-raise/40 px-3 py-1.5">
        <span className="eyebrow">{language ?? "text"}</span>
        <Copy text={source} />
      </div>
      <pre
        {...props}
        className="overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-[1.7] [scrollbar-width:thin] [&_code]:bg-transparent"
      >
        {children}
      </pre>
    </div>
  );
}
