import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// Stub until the client's legal text is ready; noindexed on purpose.
const COPY: Record<Locale, { title: string; body: string }> = {
  en: {
    title: "Privacy Policy",
    body: "The privacy policy is being prepared and will be published before launch.",
  },
  ua: {
    title: "Політика конфіденційності",
    body: "Політика конфіденційності готується і буде опублікована до запуску сайту.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/privacy-policy",
    { title: `${COPY[locale].title} | Mug.Up`, description: COPY[locale].body },
    { noindex: true },
  );
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{COPY[locale].title}</h1>
      <p className="mt-4 text-neutral-700">{COPY[locale].body}</p>
    </div>
  );
}
