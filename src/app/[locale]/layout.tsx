import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommon } from "@/content";
import { HTML_LANG, LOCALES, type Locale } from "@/content/types";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";
import { fontVariables } from "@/lib/fonts";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}


const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  legalName: ORGANIZATION.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  address: {
    "@type": "PostalAddress",
    ...ORGANIZATION.address,
  },
  founder: { "@type": "Person", name: ORGANIZATION.founder },
  sameAs: ORGANIZATION.sameAs,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = getCommon(typedLocale);
  return (
    <html lang={HTML_LANG[typedLocale]} className={fontVariables}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:font-bold focus:text-ink"
        >
          {dict.ui.skipToContent}
        </a>
        <JsonLd data={organizationJsonLd} />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <Header locale={typedLocale} dict={dict} />
        <main id="content" className="flex-1">{children}</main>
        <Footer locale={typedLocale} dict={dict} />
      </body>
    </html>
  );
}
