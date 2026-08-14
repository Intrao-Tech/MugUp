import { renderInline } from "@/components/Markdown";
import type { PostBlock, PostBlockAlign, PostBlockWidth } from "@/lib/post-blocks";

// Renders a layout-aware article body (posts.body_blocks). Purely
// presentational — no server imports — so the admin builder reuses it as the
// live preview and WYSIWYG stays honest. Each top-level block carries its own
// width wrapper, which is why the article page must NOT constrain the body
// container: "full" blocks run edge to edge.

const WIDTH_CLS: Record<PostBlockWidth, string> = {
  normal: "mx-auto w-full max-w-3xl px-4",
  wide: "mx-auto w-full max-w-5xl px-4",
  full: "w-full",
};

const ALIGN_CLS: Record<PostBlockAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const JUSTIFY_CLS: Record<PostBlockAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const SPACER_CLS = { s: "h-4", m: "h-10", l: "h-20" } as const;

/** One block's content, without the width wrapper (shared by top level and columns). */
function BlockContent({ block }: { block: PostBlock }) {
  const align = block.align ?? "left";
  switch (block.kind) {
    case "h2":
      return <h2 className={`text-2xl font-bold ${ALIGN_CLS[align]}`}>{renderInline(block.text)}</h2>;
    case "h3":
      return (
        <h3 className={`text-xl font-semibold ${ALIGN_CLS[align]}`}>{renderInline(block.text)}</h3>
      );
    case "ul": {
      // A centered/right list keeps its bullets readable: the list itself is
      // left-aligned and the whole box shifts.
      const list = (
        <ul className="list-disc space-y-1 pl-5 text-left text-neutral-700">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      return align === "left" ? list : <div className={`flex ${JUSTIFY_CLS[align]}`}>{list}</div>;
    }
    case "quote":
      return (
        <blockquote
          className={`border-l-4 border-neutral-300 pl-4 text-neutral-600 italic ${ALIGN_CLS[align]}`}
        >
          {renderInline(block.text)}
        </blockquote>
      );
    case "img": {
      const image = <img src={block.url} alt={block.alt} loading="lazy" className="w-full" />;
      return (
        <figure>
          {align === "left" ? image : <div className={`flex ${JUSTIFY_CLS[align]}`}>{image}</div>}
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-neutral-500">
              {renderInline(block.caption)}
            </figcaption>
          )}
        </figure>
      );
    }
    case "button": {
      const external = block.href.startsWith("http");
      return (
        <div className={`flex ${JUSTIFY_CLS[align]}`}>
          <a
            href={block.href}
            className="inline-block border border-neutral-900 bg-neutral-900 px-6 py-2 font-medium text-white"
            {...(external ? { rel: "noopener" } : {})}
          >
            {block.label}
          </a>
        </div>
      );
    }
    case "divider":
      return <hr className="border-neutral-200" />;
    case "spacer":
      return <div aria-hidden="true" className={SPACER_CLS[block.size]} />;
    case "columns":
      return (
        <div
          className={`grid gap-6 ${block.columns.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
        >
          {block.columns.map((column, i) => (
            <div key={i} className="space-y-4">
              {column.map((child, j) => (
                <BlockContent key={j} block={child} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return <p className={`text-neutral-700 ${ALIGN_CLS[align]}`}>{renderInline(block.text)}</p>;
  }
}

export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <div key={i} className={WIDTH_CLS[block.width ?? "normal"]}>
          <BlockContent block={block} />
        </div>
      ))}
    </div>
  );
}
