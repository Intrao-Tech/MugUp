"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { PostBody } from "@/components/PostBody";
import {
  MAX_COLUMNS,
  postBlocksFromMarkdown,
  postBlocksToMarkdown,
  type PostBlock,
  type PostBlockAlign,
  type PostBlockWidth,
  type PostSpacerSize,
} from "@/lib/post-blocks";
import { uploadPostImage } from "../actions";
import { BTN_SECONDARY } from "../ui";

// Layout-aware post constructor (builder v2). State serializes to TWO hidden
// inputs: body_blocks (JSON — what the site renders: widths, alignment,
// columns, buttons, captions) and body_md (flattened Markdown mirror for old
// posts, search and export). The live preview below the blocks renders the
// article through the SAME PostBody component the public site uses.

type InnerKind = "p" | "h2" | "h3" | "ul" | "quote" | "img" | "button";
type TopKind = InnerKind | "divider" | "spacer" | "columns";

/** A block inside a column (no nested columns, no width). */
type BInner = { uid: number; align?: PostBlockAlign } & (
  | { kind: "p" | "h2" | "h3" | "quote"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "img"; url: string; alt: string; caption?: string }
  | { kind: "button"; label: string; href: string }
);

type BBlock = { uid: number; width?: PostBlockWidth; align?: PostBlockAlign } & (
  | { kind: "p" | "h2" | "h3" | "quote"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "img"; url: string; alt: string; caption?: string }
  | { kind: "button"; label: string; href: string }
  | { kind: "divider" }
  | { kind: "spacer"; size: PostSpacerSize }
  | { kind: "columns"; columns: BInner[][] }
);

const KIND_LABEL: Record<TopKind, string> = {
  p: "Text",
  h2: "Heading",
  h3: "Subheading",
  ul: "List",
  quote: "Quote",
  img: "Image",
  button: "Button",
  divider: "Divider line",
  spacer: "Empty space",
  columns: "Columns",
};

const INNER_KINDS: InnerKind[] = ["p", "h2", "h3", "ul", "quote", "img", "button"];

const WIDTH_LABEL: Record<PostBlockWidth, string> = {
  normal: "Standard",
  wide: "Wide",
  full: "Full width",
};

const ALIGN_LABEL: Record<PostBlockAlign, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};

let nextUid = 1;
const uid = () => nextUid++;

function emptyInner(kind: InnerKind): BInner {
  switch (kind) {
    case "ul":
      return { uid: uid(), kind, items: [""] };
    case "img":
      return { uid: uid(), kind, url: "", alt: "" };
    case "button":
      return { uid: uid(), kind, label: "", href: "" };
    default:
      return { uid: uid(), kind, text: "" };
  }
}

function emptyBlock(kind: TopKind): BBlock {
  switch (kind) {
    case "divider":
      return { uid: uid(), kind };
    case "spacer":
      return { uid: uid(), kind, size: "m" };
    case "columns":
      // Rows start at 2; the count (2–6) is changed in the row's toolbar.
      return { uid: uid(), kind, columns: [[emptyInner("p")], [emptyInner("p")]] };
    default:
      return emptyInner(kind);
  }
}

/* ---------- (de)serialization ---------- */

function stripInner(block: BInner): PostBlock {
  const { uid: _uid, ...rest } = block;
  return rest as PostBlock;
}

function strip(blocks: BBlock[]): PostBlock[] {
  return blocks.map((block) => {
    if (block.kind === "columns") {
      const { uid: _uid, columns, ...rest } = block;
      return { ...rest, kind: "columns", columns: columns.map((col) => col.map(stripInner)) };
    }
    const { uid: _uid, ...rest } = block;
    return rest as PostBlock;
  });
}

function withUids(blocks: PostBlock[]): BBlock[] {
  return blocks.map((block) => {
    if (block.kind === "columns") {
      return {
        ...block,
        uid: uid(),
        columns: block.columns.map((col) => col.map((child) => ({ ...child, uid: uid() }) as BInner)),
      };
    }
    return { ...block, uid: uid() } as BBlock;
  });
}

function cloneBlock(block: BBlock): BBlock {
  return withUids(strip([block]))[0];
}

/* ---------- small editors ---------- */

const inputCls =
  "w-full rounded-lg border border-ink-300 bg-surface px-2 py-1 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";
const btnCls =
  "rounded-sm border border-line bg-surface px-2 py-0.5 text-body hover:border-ink hover:text-ink disabled:opacity-30";

function ImageEditor({
  block,
  onChange,
}: {
  block: { url: string; alt: string; caption?: string };
  onChange: (patch: Partial<{ url: string; alt: string; caption: string }>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadPostImage(formData);
    setUploading(false);
    if (result.url) onChange({ url: result.url });
    else setUploadError(result.error ?? "Upload failed.");
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div className="space-y-2">
      {block.url ? (
        <img src={block.url} alt={block.alt} className="max-h-48 border border-line" />
      ) : (
        <p className="text-sm text-muted">No image yet — upload one below.</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => handleFile(event.target.files?.[0])}
          disabled={uploading}
        />
        {uploading && <span className="text-muted">Uploading…</span>}
      </div>
      {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
      <input
        type="text"
        value={block.alt}
        onChange={(event) => onChange({ alt: event.target.value })}
        placeholder="Image description (alt text — important for SEO)"
        className={inputCls}
      />
      <input
        type="text"
        value={block.caption ?? ""}
        onChange={(event) => onChange({ caption: event.target.value })}
        placeholder="Caption shown under the image (optional)"
        className={inputCls}
      />
    </div>
  );
}

/** Content editor for one block (top-level or inside a column). */
function BlockEditor({
  block,
  onChange,
}: {
  block: BInner | BBlock;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  switch (block.kind) {
    case "img":
      return <ImageEditor block={block} onChange={onChange} />;
    case "button":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Button text, e.g. Book an assessment"
            className={inputCls}
          />
          <input
            type="text"
            value={block.href}
            onChange={(event) => onChange({ href: event.target.value })}
            placeholder="Link: /en/contact or https://…"
            className={inputCls}
          />
        </div>
      );
    case "ul":
      return (
        <textarea
          value={block.items.join("\n")}
          onChange={(event) => onChange({ items: event.target.value.split("\n") })}
          rows={Math.max(3, block.items.length)}
          placeholder="One list item per line"
          className={inputCls}
        />
      );
    case "p":
    case "h2":
    case "h3":
    case "quote":
      return (
        <textarea
          value={block.text}
          onChange={(event) => onChange({ text: event.target.value })}
          rows={block.kind === "p" ? 4 : 2}
          placeholder={
            block.kind === "quote"
              ? "Quote text"
              : block.kind === "p"
                ? "Paragraph text (**bold** and [links](https://…) supported)"
                : "Heading text"
          }
          className={inputCls}
        />
      );
    default:
      return null;
  }
}

/** The block-type buttons, shared by the insert lines and the always-visible
 *  "Add a block" bar at the bottom. A single "+ Columns" button — the row
 *  starts at 2 and the count (2–6) is changed right in the row's toolbar. */
function KindPalette({ onInsert }: { onInsert: (kind: TopKind) => void }) {
  return (
    <>
      {(Object.keys(KIND_LABEL) as TopKind[]).map((kind) => (
        <button key={kind} type="button" onClick={() => onInsert(kind)} className={btnCls}>
          + {KIND_LABEL[kind]}
        </button>
      ))}
    </>
  );
}

/** "+ Add a block here" — appears between blocks and at the end, so content
 *  can be inserted at any point, not only appended. Doubles as the drop zone
 *  while a block is being dragged. */
function InsertPoint({
  open,
  onToggle,
  onInsert,
  dragActive,
  onDropBlock,
}: {
  open: boolean;
  onToggle: () => void;
  onInsert: (kind: TopKind) => void;
  dragActive: boolean;
  onDropBlock: () => void;
}) {
  return (
    <div
      className={`py-1 ${dragActive ? "outline-dashed outline-1 outline-primary" : ""}`}
      onDragOver={(event) => {
        if (dragActive) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropBlock();
      }}
    >
      {open ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-canvas p-2 text-sm">
          <KindPalette onInsert={onInsert} />
          <button
            type="button"
            onClick={onToggle}
            className="ml-auto text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            close
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="group flex w-full items-center gap-2 text-xs text-muted hover:text-ink"
        >
          <span className="h-px flex-1 bg-line group-hover:bg-ink-300" />
          + add a block here
          <span className="h-px flex-1 bg-line group-hover:bg-ink-300" />
        </button>
      )}
    </div>
  );
}

/* ---------- the builder ---------- */

export function PostBuilder({
  initialMarkdown,
  initialBlocks,
}: {
  initialMarkdown: string;
  initialBlocks: PostBlock[] | null;
}) {
  const [blocks, setBlocks] = useState<BBlock[]>(() =>
    withUids(
      initialBlocks ??
        (initialMarkdown.trim() ? postBlocksFromMarkdown(initialMarkdown) : [{ kind: "p", text: "" }]),
    ),
  );
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);

  const clean = useMemo(() => strip(blocks), [blocks]);
  const json = useMemo(() => JSON.stringify(clean), [clean]);
  const markdown = useMemo(() => postBlocksToMarkdown(clean), [clean]);

  /* top-level operations */
  const update = (id: number, patch: Record<string, unknown>) =>
    setBlocks((prev) => prev.map((b) => (b.uid === id ? ({ ...b, ...patch } as BBlock) : b)));
  const remove = (id: number) => setBlocks((prev) => prev.filter((b) => b.uid !== id));
  const move = (id: number, delta: -1 | 1) =>
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.uid === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const duplicate = (id: number) =>
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.uid === id);
      if (index < 0) return prev;
      return [...prev.slice(0, index + 1), cloneBlock(prev[index]), ...prev.slice(index + 1)];
    });
  const insert = (index: number, kind: TopKind) => {
    setBlocks((prev) => [...prev.slice(0, index), emptyBlock(kind), ...prev.slice(index)]);
    setInsertAt(null);
  };
  /** Drag & drop: move a block so it sits at the given insertion slot. */
  const moveTo = (id: number, insertIndex: number) =>
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.uid === id);
      if (from < 0) return prev;
      const item = prev[from];
      const rest = prev.filter((b) => b.uid !== id);
      const target = insertIndex > from ? insertIndex - 1 : insertIndex;
      return [...rest.slice(0, target), item, ...rest.slice(target)];
    });
  const isInner = (b: BBlock) => (INNER_KINDS as string[]).includes(b.kind);
  /** Hand-built columns: this block + the next one become a 2-column row. */
  const pairWithNext = (id: number) =>
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.uid === id);
      if (i < 0 || i + 1 >= prev.length) return prev;
      const a = prev[i];
      const b = prev[i + 1];
      if (!isInner(a) || !isInner(b)) return prev;
      const merged: BBlock = {
        uid: uid(),
        kind: "columns",
        width: "wide",
        columns: [[a as unknown as BInner], [b as unknown as BInner]],
      };
      return [...prev.slice(0, i), merged, ...prev.slice(i + 2)];
    });
  /** The inverse: a columns row falls apart into sequential full-width blocks. */
  const unstack = (id: number) =>
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.uid === id);
      const block = prev[i];
      if (!block || block.kind !== "columns") return prev;
      const children = block.columns.flat().map((child) => ({ ...child }) as BBlock);
      return [...prev.slice(0, i), ...children, ...prev.slice(i + 1)];
    });

  /* operations inside a columns block */
  const updateColumns = (id: number, fn: (columns: BInner[][]) => BInner[][]) =>
    setBlocks((prev) =>
      prev.map((b) => (b.uid === id && b.kind === "columns" ? { ...b, columns: fn(b.columns) } : b)),
    );
  const updateChild = (id: number, col: number, childUid: number, patch: Record<string, unknown>) =>
    updateColumns(id, (columns) =>
      columns.map((column, i) =>
        i === col
          ? column.map((c) => (c.uid === childUid ? ({ ...c, ...patch } as BInner) : c))
          : column,
      ),
    );
  const removeChild = (id: number, col: number, childUid: number) =>
    updateColumns(id, (columns) =>
      columns.map((column, i) => (i === col ? column.filter((c) => c.uid !== childUid) : column)),
    );
  const moveChild = (id: number, col: number, childUid: number, delta: -1 | 1) =>
    updateColumns(id, (columns) =>
      columns.map((column, i) => {
        if (i !== col) return column;
        const index = column.findIndex((c) => c.uid === childUid);
        const target = index + delta;
        if (index < 0 || target < 0 || target >= column.length) return column;
        const next = [...column];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      }),
    );
  const addChild = (id: number, col: number, kind: InnerKind) =>
    updateColumns(id, (columns) =>
      columns.map((column, i) => (i === col ? [...column, emptyInner(kind)] : column)),
    );
  const setColumnCount = (id: number, count: number) =>
    updateColumns(id, (columns) => {
      const target = Math.max(2, Math.min(MAX_COLUMNS, Math.floor(count)));
      if (columns.length === target) return columns;
      // Shrinking merges the removed columns' content into the new last one.
      if (target < columns.length) {
        const kept = columns.slice(0, target);
        return kept.map((column, i) =>
          i === target - 1 ? [...column, ...columns.slice(target).flat()] : column,
        );
      }
      return [
        ...columns,
        ...Array.from({ length: target - columns.length }, () => [emptyInner("p")]),
      ];
    });
  /** Hand-composition: this block joins the columns row BELOW as a new column. */
  const appendToNextColumns = (id: number) =>
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.uid === id);
      const block = prev[i];
      const next = prev[i + 1];
      if (!block || !isInner(block) || next?.kind !== "columns") return prev;
      if (next.columns.length >= MAX_COLUMNS) return prev;
      const grown: BBlock = {
        ...next,
        columns: [...next.columns, [block as unknown as BInner]],
      };
      return [...prev.slice(0, i), grown, ...prev.slice(i + 2)];
    });

  const layoutControls = (block: BBlock) => (
    <>
      {block.kind !== "spacer" && (
        <label className="flex items-center gap-1">
          Width
          <select
            value={block.width ?? "normal"}
            onChange={(event) => update(block.uid, { width: event.target.value })}
            className="rounded-lg border border-ink-300 bg-surface px-1 py-0.5 text-ink"
          >
            {(Object.keys(WIDTH_LABEL) as PostBlockWidth[]).map((w) => (
              <option key={w} value={w}>
                {WIDTH_LABEL[w]}
              </option>
            ))}
          </select>
        </label>
      )}
      {!["divider", "spacer", "columns"].includes(block.kind) && (
        <label className="flex items-center gap-1">
          Align
          <select
            value={block.align ?? "left"}
            onChange={(event) => update(block.uid, { align: event.target.value })}
            className="rounded-lg border border-ink-300 bg-surface px-1 py-0.5 text-ink"
          >
            {(Object.keys(ALIGN_LABEL) as PostBlockAlign[]).map((a) => (
              <option key={a} value={a}>
                {ALIGN_LABEL[a]}
              </option>
            ))}
          </select>
        </label>
      )}
      {block.kind === "spacer" && (
        <label className="flex items-center gap-1">
          Size
          <select
            value={block.size}
            onChange={(event) => update(block.uid, { size: event.target.value })}
            className="rounded-lg border border-ink-300 bg-surface px-1 py-0.5 text-ink"
          >
            <option value="s">Small</option>
            <option value="m">Medium</option>
            <option value="l">Large</option>
          </select>
        </label>
      )}
      {block.kind === "columns" && (
        <label className="flex items-center gap-1">
          Columns
          <select
            value={block.columns.length}
            onChange={(event) => setColumnCount(block.uid, Number(event.target.value))}
            className="rounded-lg border border-ink-300 bg-surface px-1 py-0.5 text-ink"
          >
            {Array.from({ length: MAX_COLUMNS - 1 }, (_, i) => i + 2).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );

  return (
    <div className="space-y-1">
      {/* Serialized content the server action actually receives. */}
      <input type="hidden" name="body_blocks" value={json} />
      <input type="hidden" name="body_md" value={markdown} />

      <InsertPoint
        open={insertAt === 0}
        onToggle={() => setInsertAt(insertAt === 0 ? null : 0)}
        onInsert={(kind) => insert(0, kind)}
        dragActive={dragId !== null}
        onDropBlock={() => dragId !== null && moveTo(dragId, 0)}
      />

      {blocks.map((block, index) => (
        <div key={block.uid}>
          <div
            className={`rounded-card border bg-surface p-3 ${dragId === block.uid ? "border-primary opacity-60" : "border-ink"}`}
            onDragOver={(event) => {
              if (dragId !== null && dragId !== block.uid) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragId !== null) moveTo(dragId, index);
            }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <span
                draggable
                onDragStart={(event) => {
                  setDragId(block.uid);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragId(null)}
                title="Drag to any position (or onto a “+ add a block here” line)"
                className="cursor-grab select-none text-base leading-none text-muted hover:text-ink"
              >
                ⠿
              </span>
              <span className="font-bold uppercase tracking-wide">{KIND_LABEL[block.kind]}</span>
              {layoutControls(block)}
              <span className="ml-auto flex gap-1">
                {isInner(block) && index + 1 < blocks.length && isInner(blocks[index + 1]) && (
                  <button
                    type="button"
                    onClick={() => pairWithNext(block.uid)}
                    title="Put this block and the next one side by side (2 columns)"
                    className={btnCls}
                  >
                    ◫ with next
                  </button>
                )}
                {isInner(block) &&
                  blocks[index + 1]?.kind === "columns" &&
                  (blocks[index + 1] as Extract<BBlock, { kind: "columns" }>).columns.length <
                    MAX_COLUMNS && (
                    <button
                      type="button"
                      onClick={() => appendToNextColumns(block.uid)}
                      title="Move this block into the columns row below as its own new column"
                      className={btnCls}
                    >
                      ↳ into columns
                    </button>
                  )}
                {block.kind === "columns" && (
                  <button
                    type="button"
                    onClick={() => unstack(block.uid)}
                    title="Break the columns apart into normal full-width blocks"
                    className={btnCls}
                  >
                    Unstack
                  </button>
                )}
                <button type="button" onClick={() => move(block.uid, -1)} disabled={index === 0} aria-label="Move up" className={btnCls}>
                  ↑
                </button>
                <button type="button" onClick={() => move(block.uid, 1)} disabled={index === blocks.length - 1} aria-label="Move down" className={btnCls}>
                  ↓
                </button>
                <button type="button" onClick={() => duplicate(block.uid)} aria-label="Duplicate block" title="Duplicate" className={btnCls}>
                  ⧉
                </button>
                <button type="button" onClick={() => remove(block.uid)} aria-label="Remove block" className="rounded-sm border border-red-300 bg-surface px-2 py-0.5 text-red-700 hover:border-red-700">
                  ✕
                </button>
              </span>
            </div>

            {block.kind === "columns" ? (
              <div
                className="post-columns grid gap-3"
                style={{ "--cols": block.columns.length } as CSSProperties}
              >
                {block.columns.map((column, col) => (
                  <div key={col} className="space-y-2 rounded-lg border border-dashed border-line bg-canvas p-2">
                    {column.map((child, childIndex) => (
                      <div key={child.uid} className="rounded-lg border border-line bg-surface p-2">
                        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted">
                          <span className="uppercase tracking-wide">{KIND_LABEL[child.kind]}</span>
                          <label className="flex items-center gap-1">
                            <select
                              value={child.align ?? "left"}
                              onChange={(event) => updateChild(block.uid, col, child.uid, { align: event.target.value })}
                              className="rounded-lg border border-ink-300 bg-surface px-1 py-0.5 text-ink"
                              aria-label="Align"
                            >
                              {(Object.keys(ALIGN_LABEL) as PostBlockAlign[]).map((a) => (
                                <option key={a} value={a}>
                                  {ALIGN_LABEL[a]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <span className="ml-auto flex gap-1">
                            <button type="button" onClick={() => moveChild(block.uid, col, child.uid, -1)} disabled={childIndex === 0} aria-label="Move up" className={btnCls}>
                              ↑
                            </button>
                            <button type="button" onClick={() => moveChild(block.uid, col, child.uid, 1)} disabled={childIndex === column.length - 1} aria-label="Move down" className={btnCls}>
                              ↓
                            </button>
                            <button type="button" onClick={() => removeChild(block.uid, col, child.uid)} aria-label="Remove" className="rounded-sm border border-red-300 bg-surface px-1.5 py-0.5 text-red-700 hover:border-red-700">
                              ✕
                            </button>
                          </span>
                        </div>
                        <BlockEditor block={child} onChange={(patch) => updateChild(block.uid, col, child.uid, patch)} />
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1 text-xs">
                      {INNER_KINDS.map((kind) => (
                        <button key={kind} type="button" onClick={() => addChild(block.uid, col, kind)} className={btnCls}>
                          + {KIND_LABEL[kind]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : block.kind === "divider" ? (
              <hr className="border-line" />
            ) : block.kind === "spacer" ? (
              <p className="text-sm text-muted">Empty vertical space on the page.</p>
            ) : (
              <BlockEditor block={block} onChange={(patch) => update(block.uid, patch)} />
            )}
          </div>

          <InsertPoint
            open={insertAt === index + 1}
            onToggle={() => setInsertAt(insertAt === index + 1 ? null : index + 1)}
            onInsert={(kind) => insert(index + 1, kind)}
            dragActive={dragId !== null}
            onDropBlock={() => dragId !== null && moveTo(dragId, index + 1)}
          />
        </div>
      ))}

      {/* Always-visible add bar: no need to discover the between-block lines. */}
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-canvas p-2 text-sm">
        <span className="text-eyebrow uppercase text-muted">
          Add a block
        </span>
        <KindPalette onInsert={(kind) => insert(blocks.length, kind)} />
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className={BTN_SECONDARY}
        >
          {showPreview ? "Hide preview" : "Preview the article"}
        </button>
        {showPreview && (
          <div className="mt-2 rounded-card border border-ink bg-surface py-6">
            <p className="mb-4 px-4 text-center text-eyebrow uppercase text-muted">
              Preview — exactly how the article body will render on the site
            </p>
            <PostBody blocks={clean} />
          </div>
        )}
      </div>
    </div>
  );
}
