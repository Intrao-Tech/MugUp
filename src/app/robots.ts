import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // No /admin entry on purpose: robots.txt is public and would advertise
    // the path. Admin lives on a separate host, is noindexed via X-Robots-Tag
    // and metadata, and 404s on this host entirely.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
