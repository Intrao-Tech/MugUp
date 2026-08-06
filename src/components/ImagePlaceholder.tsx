// Grey square with an X — the agreed stand-in for every image the client has
// not supplied yet. No AI-generated imagery anywhere on the site.
export function ImagePlaceholder({
  alt,
  className = "",
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-neutral-300 bg-neutral-200 ${className}`}
    >
      <svg
        viewBox="0 0 100 75"
        className="absolute inset-0 h-full w-full stroke-neutral-400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="75" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="75" strokeWidth="1" />
      </svg>
      <span className="relative bg-neutral-200 px-2 text-xs text-neutral-500">{alt}</span>
    </div>
  );
}
