import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { CodeBlock } from "./app/_components/docs/CodeBlock";

/**
 * How every .mdx file renders.
 *
 * Markdown gives us the structure and this gives it the site's voice — the
 * same type scale, hairlines and ember the marketing page uses, so the docs do
 * not read as a different product.
 *
 * Headings carry the id `rehype-slug` gave them and hang an anchor in the
 * margin, so any line in the docs is linkable.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="display mt-2 mb-5 text-[clamp(1.9rem,4vw,2.6rem)]">{children}</h1>
    ),
    h2: ({ id, children }) => (
      <h2 id={id} className="group mt-11 mb-3 scroll-mt-24 text-[20px] font-semibold tracking-[-0.01em] text-bone">
        <Anchor id={id} />
        {children}
      </h2>
    ),
    h3: ({ id, children }) => (
      <h3 id={id} className="group mt-8 mb-2.5 scroll-mt-24 text-[15.5px] font-semibold text-bone">
        <Anchor id={id} />
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-4 text-[14.5px] leading-[1.72] text-dim">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[14.5px] leading-[1.7] text-dim marker:text-mute">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[14.5px] leading-[1.7] text-dim marker:font-mono marker:text-mute">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
    a: ({ href = "", children }) => {
      const external = href.startsWith("http");
      return external ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-ember underline decoration-ember-deep underline-offset-[3px] transition-colors hover:decoration-ember"
        >
          {children}
        </a>
      ) : (
        <Link
          href={href}
          className="text-ember underline decoration-ember-deep underline-offset-[3px] transition-colors hover:decoration-ember"
        >
          {children}
        </Link>
      );
    },
    // Inline code only: a fenced block arrives inside `pre`, which replaces it.
    code: ({ children, ...props }) =>
      "data-language" in props ? (
        <code {...props}>{children}</code>
      ) : (
        <code className="rounded-[4px] bg-raise px-[5px] py-[2px] font-mono text-[12.5px] text-slate">
          {children}
        </code>
      ),
    pre: CodeBlock,
    table: ({ children }) => (
      <div className="mt-5 overflow-x-auto rounded-[6px] border border-line">
        <table className="w-full border-collapse text-left text-[13.5px]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-raise/50">{children}</thead>,
    th: ({ children }) => (
      <th className="border-b border-line px-3.5 py-2.5 font-narrow text-[10px] font-semibold tracking-[0.16em] text-mute uppercase">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-line-soft px-3.5 py-2.5 align-top text-dim last:border-0">
        {children}
      </td>
    ),
    hr: () => <div className="rule my-10" />,
    blockquote: ({ children }) => (
      <blockquote className="mt-5 border-l-2 border-ember-deep pl-4 text-[14.5px] leading-[1.7] text-text">
        {children}
      </blockquote>
    ),
    ...components,
  };
}

function Anchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="absolute -ml-5 text-ember-deep opacity-0 transition-opacity group-hover:opacity-100"
    >
      #
    </a>
  );
}
