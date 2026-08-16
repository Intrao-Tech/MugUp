import { Suspense } from "react";
import type { Metadata } from "next";
import { getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FormStatusBanner } from "@/components/FormStatusBanner";
import { submitReview } from "@/app/actions/reviews";
import { canAcceptSubmissions } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const COPY: Record<
  Locale,
  {
    title: string;
    metaTitle: string;
    metaDescription: string;
    intro: string;
    moderation: string;
    name: string;
    tag: string;
    tagHint: string;
    rating: string;
    ratingNone: string;
    review: string;
    consent: string;
    submit: string;
  }
> = {
  en: {
    title: "Leave a review",
    metaTitle: "Leave a Review | Mug.Up Language Studio",
    metaDescription:
      "Share your experience with Mug.Up Language Studio — your feedback helps other families choose the right educational support.",
    intro:
      "We would love to hear about your experience with Mug.Up. Your feedback helps other families and learners take their first step.",
    moderation: "Reviews are checked by our team before they appear anywhere on the site.",
    name: "Your name",
    tag: "Who are you? (optional)",
    tagHint: "e.g. “Parent of a GCSE student” or “IELTS student”",
    rating: "Rating (optional)",
    ratingNone: "No rating",
    review: "Your review",
    consent: "I agree that Mug.Up may publish this review on its website.",
    submit: "Send review",
  },
  ua: {
    title: "Залишити відгук",
    metaTitle: "Залишити відгук | Mug.Up Language Studio",
    metaDescription:
      "Поділіться враженнями від навчання в Mug.Up Language Studio — ваш відгук допоможе іншим родинам обрати підтримку в освіті.",
    intro:
      "Нам буде цінно почути про ваш досвід із Mug.Up. Ваш відгук допомагає іншим родинам та учням зробити перший крок.",
    moderation: "Перед публікацією на сайті відгуки перевіряє наша команда.",
    name: "Ваше ім'я",
    tag: "Хто ви? (необов'язково)",
    tagHint: "наприклад, «Мама учня GCSE» або «Студентка курсу IELTS»",
    rating: "Оцінка (необов'язково)",
    ratingNone: "Без оцінки",
    review: "Ваш відгук",
    consent: "Погоджуюся, що Mug.Up може опублікувати цей відгук на сайті.",
    submit: "Надіслати відгук",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale];
  return pageMetadata(locale, "/review", {
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export default async function ReviewPage({ params }: Props) {
  const { locale } = await params;
  const copy = COPY[locale];
  const dict = getCommon(locale);
  const enabled = canAcceptSubmissions();
  const inputCls =
    "mt-1.5 w-full rounded-lg border border-ink-300 bg-surface px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.ui.breadcrumbsHome, href: "/" }, { label: copy.title }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-display text-ink">{copy.title}</h1>
        <p className="mt-3 text-body">{copy.intro}</p>
        <p className="mt-1 text-sm text-muted">{copy.moderation}</p>
        <form action={enabled ? submitReview : undefined} className="mt-6 space-y-4">
          <Suspense fallback={null}>
            <FormStatusBanner sentText={dict.ui.formSent} errorText={dict.ui.formError} />
          </Suspense>
          <input type="hidden" name="locale" value={locale} />
          <div aria-hidden="true" className="hidden">
            <label htmlFor="hp-review">Website</label>
            <input id="hp-review" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium">
              {copy.name} *
            </label>
            <input id="authorName" name="authorName" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="authorTag" className="block text-sm font-medium">
              {copy.tag}
            </label>
            <input id="authorTag" name="authorTag" className={inputCls} />
            <p className="mt-1 text-sm text-muted">{copy.tagHint}</p>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium">
              {copy.rating}
            </label>
            <select id="rating" name="rating" className={inputCls}>
              <option value="">{copy.ratingNone}</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quote" className="block text-sm font-medium">
              {copy.review} *
            </label>
            <textarea id="quote" name="quote" rows={6} required className={inputCls} />
          </div>
          <label htmlFor="consent" className="flex items-start gap-2 text-sm">
            <input id="consent" name="consent" type="checkbox" required />
            <span>{copy.consent}</span>
          </label>
          <button
            type="submit"
            disabled={!enabled}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 py-2.5 font-bold text-on-primary hover:bg-primary-hover disabled:opacity-50"
          >
            {copy.submit}
          </button>
          {!enabled && <p className="text-sm text-muted">{dict.ui.formNotWired}</p>}
        </form>
      </div>
    </>
  );
}
