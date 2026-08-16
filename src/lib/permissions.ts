// Role model: a role is a display preset; enforcement always uses the
// per-user permission flags, so any account can be fine-tuned per module.

export const PERMISSIONS = [
  "leads.view",
  "leads.manage",
  "leads.export",
  "leads.pii",
  "posts.edit",
  "posts.publish",
  "reviews.moderate",
  "analytics.view",
  "users.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** The fixed presets that ship with the panel. */
export type BuiltInRole = "admin" | "manager" | "editor";

/** A profile's role: a slug from the `roles` table (built-in or custom).
 *  ROLE_PRESETS/ROLE_DESCRIPTIONS below are the built-ins' seed values and a
 *  fallback for a database that predates the table — the DB rows are the
 *  live source of truth (editable in Team → Roles). */
export type Role = string;

export const ROLE_PRESETS: Record<BuiltInRole, Permission[]> = {
  // Full access, including team account management.
  admin: [...PERMISSIONS],
  // Studio administrator: the enquiry pipeline end to end.
  manager: ["leads.view", "leads.manage", "leads.export", "leads.pii", "analytics.view"],
  // Content/marketing: Insights and review moderation; no access to leads
  // (they contain personal data — GDPR minimisation).
  editor: ["posts.edit", "posts.publish", "reviews.moderate"],
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "leads.view": "View enquiries",
  "leads.manage": "Edit enquiries: status, owner, next action, notes",
  "leads.export": "Export enquiries to CSV",
  "leads.pii": "View learner personal data: contacts, messages, attached files",
  "posts.edit": "Manage content: write and edit articles (Insights)",
  "posts.publish": "Publish content to the live site (incl. scheduling)",
  "reviews.moderate": "Manage reviews: approve, reject, add, feature",
  "analytics.view": "View analytics: the enquiries dashboard",
  "users.manage": "Manage users: accounts, roles, permissions",
};

/** Plain-language summary of each built-in preset. */
export const ROLE_DESCRIPTIONS: Record<BuiltInRole, string> = {
  admin: "Admin — full access to everything, including the team",
  manager: "Manager — enquiries, personal data, exports and the dashboard",
  editor: "Editor — articles and reviews, no access to enquiries",
};

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}
