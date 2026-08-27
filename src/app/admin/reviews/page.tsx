import {
  REVIEW_AUDIENCE_LABELS,
  REVIEW_AUDIENCES,
  type ReviewRow,
  type ReviewStatus,
} from "@/lib/db-types";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PROGRAMME_SUGGESTIONS } from "@/lib/programmes";
import { addReview, deleteReview, setReviewStatus, updateReviewMeta } from "../actions";
import { BTN_PRIMARY, BTN_SECONDARY, buildQuery, CARD, FilterChip, H1, H2, INPUT, Notice } from "../ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const SOURCE_LABEL: Record<ReviewRow["source"], string> = {
  website: "Site form",
  google: "Google",
  other: "Other",
};

// The card reads as a record; changing anything is behind explicit controls
// (status buttons, "Edit details", "Delete") so nothing looks half-editable.
function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <article className={`${CARD} p-4`}>
      <p className="text-eyebrow uppercase text-muted">
        {STATUS_LABEL[review.status]} · {SOURCE_LABEL[review.source]} ·{" "}
        {new Date(review.created_at).toLocaleDateString("en-GB")}
        {review.rating && <> · {"★".repeat(review.rating)}</>}
        {review.featured && (
          <span className="ml-2 rounded-sm border border-line bg-surface px-2 py-0.5 text-eyebrow uppercase text-ink">FEATURED</span>
        )}
      </p>
      {(review.programme || review.audience) && (
        <p className="mt-1 text-xs text-muted">
          {[review.programme, review.audience && REVIEW_AUDIENCE_LABELS[review.audience]]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      <blockquote className="mt-2 text-sm">“{review.quote}”</blockquote>
      <p className="mt-2 text-sm font-bold">
        — {review.author_name}
        {review.author_tag && <span className="text-muted"> · {review.author_tag}</span>}
      </p>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {(["approved", "rejected", "pending"] as ReviewStatus[])
          .filter((s) => s !== review.status)
          .map((s) => (
            <form key={s} action={setReviewStatus}>
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="status" value={s} />
              <button type="submit" className={BTN_SECONDARY}>
                {s === "approved" ? "Approve" : s === "rejected" ? "Reject" : "Back to pending"}
              </button>
            </form>
          ))}
      </div>

      <details className="mt-3 border-t border-line pt-2 text-sm">
        <summary className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary-hover">
          Edit details (programme, audience, featured)
        </summary>
        <form
          action={updateReviewMeta}
          className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]"
        >
          <input type="hidden" name="id" value={review.id} />
          <input
            name="programme"
            list="programme-suggestions"
            placeholder="Programme (e.g. GCSE)"
            defaultValue={review.programme}
            className={INPUT}
            aria-label="Programme"
          />
          <select
            name="audience"
            defaultValue={review.audience ?? ""}
            className={INPUT}
            aria-label="Audience"
          >
            <option value="">Audience…</option>
            {REVIEW_AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {REVIEW_AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 whitespace-nowrap">
            <input type="checkbox" name="featured" defaultChecked={review.featured} />
            Featured
          </label>
          <button type="submit" className={BTN_SECONDARY}>
            Save
          </button>
        </form>
      </details>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-red-700 hover:underline">Delete…</summary>
        <form action={deleteReview} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="id" value={review.id} />
          <span className="text-body">This removes the review permanently.</span>
          <button type="submit" className="border border-red-700 px-3 py-1 text-red-700">
            Yes, delete
          </button>
        </form>
      </details>
    </article>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string; show?: string }>;
}) {
  await requireProfile("reviews.moderate");
  const params = await searchParams;
  const { error, saved, deleted } = params;
  const show = params.show === "approved" || params.show === "rejected" ? params.show : undefined;

  const data = await getData();
  const reviews = await data.reviews.listAll();
  const pending = reviews.filter((r) => r.status === "pending");
  const moderated = reviews.filter((r) => r.status !== "pending");
  const rest = show ? moderated.filter((r) => r.status === show) : moderated;
  const countOf = (s: ReviewStatus) => moderated.filter((r) => r.status === s).length;

  return (
    <div>
      <h1 className={H1}>Reviews</h1>
      <p className="mt-1 text-base text-body">
        Only approved reviews may ever appear on the site; approved + Featured ones become the
        homepage testimonials.
      </p>
      <datalist id="programme-suggestions">
        {PROGRAMME_SUGGESTIONS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      {saved && (
        <Notice tone="success">Saved.</Notice>
      )}
      {deleted && <Notice tone="success">Review deleted.</Notice>}
      {error && (
        <Notice tone="error">
          {error === "input" ? "Author and quote are required." : "Could not save — try again."}
        </Notice>
      )}

      <section className="mt-6">
        <h2 className={H2}>Awaiting moderation ({pending.length})</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {pending.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {pending.length === 0 && <p className="text-sm text-muted">Nothing pending.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className={H2}>Add a review</h2>
        <p className="mt-1 text-base text-body">
          For importing real reviews the studio received elsewhere — e.g. copy one from Google and
          pick “Google” as the source. Visitors can also submit reviews themselves through the
          site's “Leave a review” page; those appear above as “Site form”.
        </p>
        <form action={addReview} className="mt-3 max-w-lg space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="source" className="block text-sm font-bold text-ink">
                Source
              </label>
              <select id="source" name="source" className={INPUT}>
                <option value="google">Google</option>
                <option value="other">Other</option>
                <option value="website">Site form</option>
              </select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-bold text-ink">
                Rating (optional)
              </label>
              <select id="rating" name="rating" className={INPUT}>
                <option value="">—</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-programme" className="block text-sm font-bold text-ink">
                Programme / area
              </label>
              <input
                id="add-programme"
                name="programme"
                list="programme-suggestions"
                placeholder="e.g. GCSE, IELTS, Spanish"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="add-audience" className="block text-sm font-bold text-ink">
                Audience
              </label>
              <select id="add-audience" name="audience" className={INPUT}>
                <option value="">—</option>
                {REVIEW_AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {REVIEW_AUDIENCE_LABELS[a]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="author_name" className="block text-sm font-bold text-ink">
              Author *
            </label>
            <input
              id="author_name"
              name="author_name"
              required
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="author_tag" className="block text-sm font-bold text-ink">
              Tag (e.g. “Parent of GCSE Student”)
            </label>
            <input
              id="author_tag"
              name="author_tag"
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="quote" className="block text-sm font-bold text-ink">
              Quote *
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={4}
              required
              className={INPUT}
            />
          </div>
          <button type="submit" className={BTN_PRIMARY}>
            Add as pending
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className={H2}>All reviews ({moderated.length})</h2>
        <p className="mt-1 text-base text-body">
          Every review that has been moderated. Approve/reject changes where it can appear;
          “Edit details” manages the marketing fields; “Delete” removes it for good.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
          <FilterChip
            label={`All (${moderated.length})`}
            href={`/admin/reviews${buildQuery(params, { show: undefined })}`}
            active={!show}
          />
          <FilterChip
            label={`Approved (${countOf("approved")})`}
            href={`/admin/reviews${buildQuery(params, { show: "approved" })}`}
            active={show === "approved"}
          />
          <FilterChip
            label={`Rejected (${countOf("rejected")})`}
            href={`/admin/reviews${buildQuery(params, { show: "rejected" })}`}
            active={show === "rejected"}
          />
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {rest.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {rest.length === 0 && <p className="text-sm text-muted">Nothing here yet.</p>}
        </div>
      </section>
    </div>
  );
}
