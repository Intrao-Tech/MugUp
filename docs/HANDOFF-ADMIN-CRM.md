# Admin CRM upgrade — COMPLETED (archive)

This document used to be the page-by-page UI work list for the August 2026
admin/CRM round. **Everything in it has been built, extended and verified**
— keeping the old plan around would only mislead, so it is archived.

Where the truth lives now:

- **As-built spec** (modules, data model, permissions, flows):
  [`docs/SPEC.md`](SPEC.md) §7–§8.
- **History of every feedback round** and what changed in each:
  [`docs/requirements/updates-2026-08/CLIENT-FEEDBACK-LOG.md`](requirements/updates-2026-08/CLIENT-FEEDBACK-LOG.md).
- **Email/notifications setup**: [`docs/EMAIL-SETUP.md`](EMAIL-SETUP.md).
- **Run + test logins**: `README.md`.

Delivered beyond the original list (later rounds): layout post builder
(drag & drop, columns, widths, live preview), in-admin notification centre
with per-member subscriptions and clickable per-item read state, custom
roles, invite/reset via generated temporary passwords with a forced
first-login password change, idle session timeout (admin-configurable),
activity-log date filters + stats, contextual CRM fields (Lost reason only
for Lost, no next-action for closed/lost).
