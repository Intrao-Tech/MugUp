// Single source of truth for site-wide constants used in SEO, JSON-LD and the footer.

export const SITE_URL = "https://mugupstudio.com";
export const SITE_NAME = "Mug.Up Language Studio";

/**
 * Origin of the PUBLIC site for links rendered inside the admin panel
 * (which lives on its own host). Locally that's http://localhost:3000.
 */
export function publicSiteOrigin(): string {
  const host = process.env.PUBLIC_HOST;
  if (!host) return SITE_URL;
  return host.includes("localhost") ? `http://${host}` : `https://${host}`;
}

/** Origin of the admin panel — used for invite-email redirect links. */
export function adminSiteOrigin(): string {
  const host = process.env.ADMIN_HOST;
  if (!host) return "http://localhost:3000";
  return host.includes("localhost") ? `http://${host}` : `https://${host}`;
}

export const ORGANIZATION = {
  legalName: "Mug.Up Language Studio Ltd",
  address: {
    streetAddress: "66–68 St Loyes St",
    addressLocality: "Bedford",
    postalCode: "MK40 1EZ",
    addressCountry: "GB",
  },
  /** Human-readable address line for the footer. */
  addressLine: "66–68 St Loyes St, Bedford MK40 1EZ",
  founder: "Ievgeniia Angerchik",
  ukrainianSiteUrl: "https://mugup.com.ua",
  sameAs: [
    "https://www.instagram.com/mug.up.britain",
    "https://www.instagram.com/mug.up.global",
    "https://www.tiktok.com/@mug.up.global",
    "https://t.me/mugupLang",
    "https://www.facebook.com/share/163Nd9or3T/",
    "https://www.facebook.com/profile.php?id=61573460977118",
  ],
} as const;

/**
 * Social links, split the way the TZ footer specifies. Only links confirmed
 * real (live mugup.com.ua footer or client-doc handles) — no placeholder
 * homepage links. LinkedIn / YouTube / Eventbrite return once the client
 * provides the exact URLs.
 */
export const SOCIALS = {
  britain: [
    { label: "Instagram", href: "https://www.instagram.com/mug.up.britain" },
    // Dedicated Mug.Up Britain page (client, 21 Aug 2026).
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61573460977118" },
  ],
  global: [
    { label: "Instagram", href: "https://www.instagram.com/mug.up.global" },
    { label: "Facebook", href: "https://www.facebook.com/share/163Nd9or3T/" },
  ],
  shared: [
    { label: "TikTok", href: "https://www.tiktok.com/@mug.up.global" },
    { label: "Telegram", href: "https://t.me/mugupLang" },
    // New WhatsApp Business account (decoded from the client's QR, 14 Aug 2026).
    { label: "WhatsApp", href: "https://wa.me/message/PR7BAKHTTTFWK1" },
  ],
} as const;
