"use client";

import { useMemo, useRef, useState } from "react";
import { blocksToMarkdown, parseMarkdown, type MdBlock } from "@/components/Markdown";
import { uploadPostImage } from "../actions";

// Block-based post constructor. Builder state serializes to the same Markdown
// the database stores (hidden body_md input), so the renderer, the storage
// format and the raw-Markdown fallback all stay unchanged.

type BuilderBlock = MdBlock & { uid: number };

const BLOCK_LABEL: Record<MdBlock["kind"], string> = {
  p: "Text",
  h2: "Heading",
  h3: "Subheading",
  ul: "List",
  quote: "Quote",
  img: "Image",
};

let nextUid = 1;

function withUids(blocks: MdBlock[]): BuilderBlock[] {
  return blocks.map((block) => ({ ...block, uid: nextUid++ }));
}

function emptyBlock(kind: MdBlock["kind"]): MdBlock {
  switch (kind) {
    case "ul":
      return { kind: "ul", items: [""] };
    case "img":
      return { kind: "img", alt: "", url: "" };
    default:
      return { kind, text: "" } as MdBlock;
  }
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<BuilderBlock, { kind: "img" }>;
  onChange: (patch: Partial<{ alt: string; url: string }>) => void;
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
        <img src={block.url} alt={block.alt} className="max-h-48 border border-neutral-200" />
      ) : (
        <p className="text-sm text-neutral-500">No image yet — upload one below.</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => handleFile(event.target.files?.[0])}
          disabled={uploading}
        />
        {uploading && <span className="text-neutral-500">Uploading…</span>}
      </div>
      {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
      <input
        type="text"
        value={block.alt}
        onChange={(event) => onChange({ alt: event.target.value })}
        placeholder="Image description (alt text — important for SEO)"
        className="w-full border border-neutral-300 px-2 py-1 text-sm"
      />
    </div>
  );
}

export function PostBuilder({ initialMarkdown }: { initialMarkdown: string }) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    withUids(initialMarkdown.trim() ? parseMarkdown(initialMarkdown) : [emptyBlock("p")]),
  );
  const [showRaw, setShowRaw] = useState(false);

  const markdown = useMemo(() => blocksToMarkdown(blocks), [blocks]);

  const update = (uid: number, patch: Partial<BuilderBlock>) =>
    setBlocks((prev) =>
      prev.map((block) => (block.uid === uid ? ({ ...block, ...patch } as BuilderBlock) : block)),
    );
  const remove = (uid: number) => setBlocks((prev) => prev.filter((block) => block.uid !== uid));
  const move = (uid: number, delta: -1 | 1) =>
    setBlocks((prev) => {
      const index = prev.findIndex((block) => block.uid === uid);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const add = (kind: MdBlock["kind"]) =>
    setBlocks((prev) => [...prev, ...withUids([emptyBlock(kind)])]);

  const textareaCls = "w-full border border-neutral-300 px-2 py-1 text-sm";

  return (
    <div className="space-y-3">
      {/* Serialized content the server action actually receives. */}
      <input type="hidden" name="body_md" value={markdown} />

      {blocks.map((block, index) => (
        <div key={block.uid} className="border border-neutral-300 bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium uppercase tracking-wide">{BLOCK_LABEL[block.kind]}</span>
            <span className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => move(block.uid, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(block.uid, 1)}
                disabled={index === blocks.length - 1}
                aria-label="Move down"
                className="border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(block.uid)}
                aria-label="Remove block"
                className="border border-red-300 px-2 py-0.5 text-red-700"
              >
                ✕
              </button>
            </span>
          </div>

          {block.kind === "img" ? (
            <ImageBlockEditor
              block={block as Extract<BuilderBlock, { kind: "img" }>}
              onChange={(patch) => update(block.uid, patch)}
            />
          ) : block.kind === "ul" ? (
            <textarea
              value={block.items.join("\n")}
              onChange={(event) => update(block.uid, { items: event.target.value.split("\n") })}
              rows={Math.max(3, block.items.length)}
              placeholder={"One list item per line"}
              className={textareaCls}
            />
          ) : (
            <textarea
              value={block.text}
              onChange={(event) => update(block.uid, { text: event.target.value })}
              rows={block.kind === "p" ? 4 : 2}
              placeholder={
                block.kind === "quote"
                  ? "Quote text"
                  : block.kind === "p"
                    ? "Paragraph text (**bold** and [links](https://…) supported)"
                    : "Heading text"
              }
              className={textareaCls}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 text-sm">
        {(Object.keys(BLOCK_LABEL) as MdBlock["kind"][]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => add(kind)}
            className="border border-neutral-400 px-3 py-1 hover:border-neutral-900"
          >
            + {BLOCK_LABEL[kind]}
          </button>
        ))}
      </div>

      <details
        className="text-sm"
        open={showRaw}
        onToggle={(event) => setShowRaw((event.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-neutral-500">
          Raw Markdown (what will be saved)
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto border border-neutral-200 bg-neutral-50 p-2 text-xs whitespace-pre-wrap">
          {markdown || "(empty)"}
        </pre>
      </details>
    </div>
  );
}
