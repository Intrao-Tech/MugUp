import type { SVGProps } from "react";

/**
 * The complete icon set. Inline SVG, `currentColor`, 24-unit grid, always
 * decorative (aria-hidden) — pair with visible text. Add here, never inline
 * SVG paths in components.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconQuote(props: IconProps) {
  return (
    <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
      <path d="M7.2 6C4.9 6 3 7.9 3 10.3c0 2.3 1.8 4.2 4.1 4.3-.5 1.7-1.7 3-3.4 3.6v2C7.9 19.4 10.7 16 10.7 11.6 10.7 8.5 9.2 6 7.2 6zm10 0c-2.3 0-4.2 1.9-4.2 4.3 0 2.3 1.8 4.2 4.1 4.3-.5 1.7-1.7 3-3.4 3.6v2c4.2-.8 7-4.2 7-8.6C20.7 8.5 19.2 6 17.2 6z" />
    </svg>
  );
}
