import type { ReviewRow, ReviewStatus } from "@/lib/db-types";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { addReview, setReviewStatus } from "../actions";
import { Notice } from "../ui";

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

function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <article className="border border-neutral-300 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {STATUS_LABEL[review.status]} · {SOURCE_LABEL[review.source]} ·{" "}
        {new Date(review.created_at).toLocaleDateString("en-GB")}
        {review.rating && <> · {"★".repeat(review.rating)}</>}
      </p>
      <blockquote className="mt-2 text-sm">“{review.quote}”</blockquote>
      <p className="mt-2 text-sm font-medium">
        — {review.author_name}
        {review.author_tag && <span className="text-neutral-500"> · {review.author_tag}</span>}
      </p>
      <div className="mt-3 flex gap-2 text-sm">
        {(["approved", "rejected", "pending"] as ReviewStatus[])
          .filter((s) => s !== review.status)
          .map((s) => (
            <form key={s} action={setReviewStatus}>
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="status" value={s} />
              <button type="submit" className="border border-neutral-400 px-3 py-1 hover:underline">
                {s === "approved" ? "Approve" : s === "rejected" ? "Reject" : "Back to pending"}
              </button>
            </form>
          ))}
      </div>
    </article>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireProfile("reviews.moderate");
  const { error, saved } = await searchParams;

  const data = await getData();
  const reviews = await data.reviews.listAll();
  const pending = reviews.filter((r) => r.status === "pending");
  const rest = reviews.filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Only approved reviews may ever appear on the site.
      </p>
      {saved && (
        <Notice tone="success">Saved.</Notice>
      )}
      {error && (
        <Notice tone="error">
          {error === "input" ? "Author and quote are required." : "Could not save — try again."}
        </Notice>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Awaiting moderation ({pending.length})</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {pending.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {pending.length === 0 && <p className="text-sm text-neutral-500">Nothing pending.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Add a review</h2>
        <p className="mt-1 text-sm text-neutral-500">
          For importing real reviews the studio received elsewhere — e.g. copy one from Google and
          pick “Google” as the source. Visitors can also submit reviews themselves through the
          site's “Leave a review” page; those appear above as “Site form”.
        </p>
        <form action={addReview} className="mt-3 max-w-lg space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="source" className="block text-sm font-medium">
                Source
              </label>
              <select id="source" name="source" className="mt-1 w-full border border-neutral-400 px-3 py-2">
                <option value="google">Google</option>
                <option value="other">Other</option>
                <option value="website">Site form</option>
              </select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium">
                Rating (optional)
              </label>
              <select id="rating" name="rating" className="mt-1 w-full border border-neutral-400 px-3 py-2">
                <option value="">—</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium">
              Author *
            </label>
            <input
              id="author_name"
              name="author_name"
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="author_tag" className="block text-sm font-medium">
              Tag (e.g. “Parent of GCSE Student”)
            </label>
            <input
              id="author_tag"
              name="author_tag"
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="quote" className="block text-sm font-medium">
              Quote *
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={4}
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <button type="submit" className="border border-neutral-900 px-4 py-2">
            Add as pending
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">History</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {rest.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {rest.length === 0 && <p className="text-sm text-neutral-500">No moderated reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
