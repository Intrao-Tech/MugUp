import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// Stub target for the landing's "Explore Our Integration Network" button;
// noindexed and out of the sitemap until the client provides the network content
// (same pattern as the legal stubs).
const COPY: Record<Locale, { title: string; body: string }> = {
  en: {
    title: "Our Integration Network",
    body: "Information about our integration network is being prepared and will be published soon.",
  },
  ua: {
    title: "Наша інтеграційна мережа",
    body: "Інформація про нашу інтеграційну мережу готується і незабаром буде опублікована.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/pathways/global-integration/network",
    { title: `${COPY[locale].title} | Mug.Up`, description: COPY[locale].body },
    { noindex: true },
  );
}

export default async function IntegrationNetworkPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{COPY[locale].title}</h1>
      <p className="mt-4 text-neutral-700">{COPY[locale].body}</p>
    </div>
  );
}
