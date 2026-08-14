import { parseMarkdown, type MdBlock } from "@/components/Markdown";

// Layout-aware article body: an ordered list of blocks stored as JSON in
// posts.body_blocks (jsonb). Markdown (body_md) physically cannot express
// layout — width, alignment, columns — so builder v2 saves both: the JSON
// here (what the site renders) and a flattened Markdown mirror (fallback for
// old posts, search and export). Posts saved before builder v2 have
// body_blocks = null and keep rendering through the Markdown path.

export type PostBlockWidth = "normal" | "wide" | "full";
export type PostBlockAlign = "left" | "center" | "right";
export type PostSpacerSize = "s" | "m" | "l";

interface Layout {
  /** Column width on the article page; default "normal" (the classic centered column). */
  width?: PostBlockWidth;
  /** Text/content alignment inside the block; default "left". */
  align?: PostBlockAlign;
}

export type PostBlock = Layout &
  (
    | { kind: "p" | "h2" | "h3" | "quote"; text: string }
    | { kind: "ul"; items: string[] }
    | { kind: "img"; url: string; alt: string; caption?: string }
    | { kind: "button"; label: string; href: string }
    | { kind: "divider" }
    | { kind: "spacer"; size: PostSpacerSize }
    /** 2–3 side-by-side columns (stacked on mobile). Children may not nest
     *  further columns/spacers; child width is ignored (the row sets it). */
    | { kind: "columns"; columns: PostBlock[][] }
  );

export const POST_WIDTHS: PostBlockWidth[] = ["normal", "wide", "full"];
export const POST_ALIGNS: PostBlockAlign[] = ["left", "center", "right"];
export const POST_SPACER_SIZES: PostSpacerSize[] = ["s", "m", "l"];

/** Block kinds allowed inside a column. */
export const COLUMN_CHILD_KINDS = ["p", "h2", "h3", "ul", "quote", "img", "button"] as const;

const TEXT_MAX = 8000;
const ITEM_MAX = 500;
const ITEMS_MAX = 100;
const BLOCKS_MAX = 120;
const COLUMN_BLOCKS_MAX = 30;
const URL_MAX = 600;

const isSafeUrl = (value: string): boolean =>
  /^https?:\/\//.test(value) || value.startsWith("/");

function str(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max ? value : null;
}

function layout(raw: Record<string, unknown>): Layout {
  const out: Layout = {};
  if (POST_WIDTHS.includes(raw.width as PostBlockWidth)) out.width = raw.width as PostBlockWidth;
  if (POST_ALIGNS.includes(raw.align as PostBlockAlign)) out.align = raw.align as PostBlockAlign;
  return out;
}

/** Rebuilds one block from untrusted data (whitelist copy — unknown keys and
 *  kinds are dropped, unsafe URLs reject the block). Returns null if invalid. */
function sanitizeBlock(value: unknown, insideColumn: boolean): PostBlock | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const base = insideColumn ? {} : layout(raw);
  // Alignment is meaningful inside a column too; width is not.
  if (insideColumn && POST_ALIGNS.includes(raw.align as PostBlockAlign)) {
    (base as Layout).align = raw.align as PostBlockAlign;
  }

  switch (raw.kind) {
    case "p":
    case "h2":
    case "h3":
    case "quote": {
      const text = str(raw.text, TEXT_MAX);
      return text === null ? null : { ...base, kind: raw.kind, text };
    }
    case "ul": {
      if (!Array.isArray(raw.items) || raw.items.length > ITEMS_MAX) return null;
      const items: string[] = [];
      for (const item of raw.items) {
        const text = str(item, ITEM_MAX);
        if (text === null) return null;
        items.push(text);
      }
      return { ...base, kind: "ul", items };
    }
    case "img": {
      const url = str(raw.url, URL_MAX);
      const alt = str(raw.alt, 300);
      if (url === null || alt === null || !isSafeUrl(url)) return null;
      const caption = str(raw.caption ?? "", ITEM_MAX);
      return { ...base, kind: "img", url, alt, ...(caption ? { caption } : {}) };
    }
    case "button": {
      const label = str(raw.label, 200);
      const href = str(raw.href, URL_MAX);
      if (label === null || href === null || !isSafeUrl(href)) return null;
      return { ...base, kind: "button", label, href };
    }
    case "divider":
      return insideColumn ? null : { ...base, kind: "divider" };
    case "spacer":
      return !insideColumn && POST_SPACER_SIZES.includes(raw.size as PostSpacerSize)
        ? { kind: "spacer", size: raw.size as PostSpacerSize }
        : null;
    case "columns": {
      if (insideColumn) return null;
      if (!Array.isArray(raw.columns) || raw.columns.length < 2 || raw.columns.length > 3) {
        return null;
      }
      const columns: PostBlock[][] = [];
      for (const col of raw.columns) {
        if (!Array.isArray(col) || col.length > COLUMN_BLOCKS_MAX) return null;
        const children: PostBlock[] = [];
        for (const child of col) {
          const block = sanitizeBlock(child, true);
          if (!block) return null;
          children.push(block);
        }
        columns.push(children);
      }
      return { ...base, kind: "columns", columns };
    }
    default:
      return null;
  }
}

/** Validates untrusted data (request body or DB jsonb) into typed blocks.
 *  Strict: one bad block rejects the whole body — the builder always produces
 *  valid data, so a failure means tampering or corruption, not user error. */
export function sanitizePostBlocks(value: unknown): PostBlock[] | null {
  if (!Array.isArray(value) || value.length > BLOCKS_MAX) return null;
  const blocks: PostBlock[] = [];
  for (const item of value) {
    const block = sanitizeBlock(item, false);
    if (!block) return null;
    blocks.push(block);
  }
  return blocks;
}

/** JSON string (form field) → validated blocks; null = invalid. */
export function parsePostBlocksJson(raw: string): PostBlock[] | null {
  if (raw.length > 300_000) return null;
  try {
    return sanitizePostBlocks(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Legacy body_md → blocks, for editing pre-builder-v2 posts. */
export function postBlocksFromMarkdown(source: string): PostBlock[] {
  return parseMarkdown(source).map((block: MdBlock): PostBlock => ({ ...block }));
}

function blockToMarkdown(block: PostBlock): string {
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
      return `![${block.alt}](${block.url})${block.caption ? `\n\n${block.caption}` : ""}`;
    case "button":
      return `[${block.label}](${block.href})`;
    case "divider":
    case "spacer":
      return "";
    case "columns":
      return block.columns.flat().map(blockToMarkdown).join("\n\n");
    default:
      return block.text;
  }
}

/** Flattened Markdown mirror of the blocks (layout is lost by design) —
 *  stored in body_md so search, export and the old renderer keep working. */
export function postBlocksToMarkdown(blocks: PostBlock[]): string {
  return blocks
    .map(blockToMarkdown)
    .filter((chunk) => chunk.trim())
    .join("\n\n");
}
