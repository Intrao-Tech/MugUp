import type { ReactNode } from "react";

// Minimal, dependency-free renderer for the Markdown subset the admin editor
// supports: ## / ### headings, "- " lists, "> " quotes, ![alt](url) images,
// blank-line paragraphs, **bold**, [text](url). Everything renders through
// React (auto-escaped), so post content from the database can never inject
// HTML. The same parser feeds the admin post builder.

const INLINE_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^\s)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_RE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) {
      const href = link[2];
      const external = href.startsWith("http");
      if (!external && !href.startsWith("/")) return <span key={i}>{link[1]}</span>;
      return (
        <a key={i} href={href} className="underline" {...(external ? { rel: "noopener" } : {})}>
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export type MdBlock =
  | { kind: "h2" | "h3" | "p" | "quote"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "img"; alt: string; url: string };

const IMAGE_LINE_RE = /^!\[([^\]]*)\]\((\S+)\)$/;

export function parseMarkdown(source: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ kind: "ul", items: list });
    list = [];
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ kind: "quote", text: quote.join(" ") });
    quote = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    const image = line.match(IMAGE_LINE_RE);
    if (!line) {
      flushAll();
    } else if (image) {
      flushAll();
      const url = image[2];
      if (url.startsWith("http") || url.startsWith("/")) {
        blocks.push({ kind: "img", alt: image[1], url });
      }
    } else if (line.startsWith("### ")) {
      flushAll();
      blocks.push({ kind: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flushAll();
      blocks.push({ kind: "h2", text: line.slice(3) });
    } else if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      quote.push(line.slice(2));
    } else if (line.startsWith("- ")) {
      flushParagraph();
      flushQuote();
      list.push(line.slice(2));
    } else {
      flushList();
      flushQuote();
      paragraph.push(line);
    }
  }
  flushAll();
  return blocks;
}

/** Serialize builder blocks back to the stored Markdown. */
export function blocksToMarkdown(blocks: MdBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case "h2":
          return `## ${block.text}`;
        case "h3":
          return `### ${block.text}`;
        case "ul":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "quote":
          return `> ${block.text}`;
        case "img":
          return `![${block.alt}](${block.url})`;
        default:
          return block.text;
      }
    })
    .filter((chunk) => chunk.trim())
    .join("\n\n");
}

export function Markdown({ source }: { source: string }) {
  return (
    <>
      {parseMarkdown(source).map((block, i) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2 key={i} className="mt-6 text-2xl font-bold">
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-4 text-xl font-semibold">
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-neutral-700">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-neutral-300 pl-4 text-neutral-600 italic"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "img":
            return (
              <img key={i} src={block.url} alt={block.alt} loading="lazy" className="w-full" />
            );
          default:
            return (
              <p key={i} className="text-neutral-700">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </>
  );
}
