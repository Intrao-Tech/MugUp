"use client";

import { useRef, useState } from "react";
import { uploadPostImage } from "../actions";

// Featured-image picker for PostForm: uploads through the same action as the
// builder's image blocks, stores the public URL in a hidden input and forces
// an alt text (accessibility + image SEO) once an image is set.
export function HeroImageField({
  initialUrl,
  initialAlt,
}: {
  initialUrl: string | null;
  initialAlt: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadPostImage(formData);
    setUploading(false);
    if (result.url) setUrl(result.url);
    else setError(result.error ?? "Upload failed.");
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="hero_image_url" value={url} />
      {url ? (
        <img src={url} alt={initialAlt} className="max-h-40 border border-line" />
      ) : (
        <p className="text-sm text-muted">No featured image yet.</p>
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
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Remove image
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <input
        type="text"
        name="hero_image_alt"
        defaultValue={initialAlt}
        placeholder="Image description (alt text — required when an image is set)"
        className="w-full rounded-lg border border-ink-300 bg-surface px-2 py-1 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
