// Role model: a role is a display preset; enforcement always uses the
// per-user permission flags, so any account can be fine-tuned per module.

export const PERMISSIONS = [
  "leads.view",
  "leads.manage",
  "files.view",
  "reviews.moderate",
  "posts.edit",
  "posts.publish",
  "users.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type Role = "admin" | "manager" | "editor";

export const ROLE_PRESETS: Record<Role, Permission[]> = {
  // Full access, including team account management.
  admin: [...PERMISSIONS],
  // Studio administrator: enquiries and uploaded files; no publishing.
  manager: ["leads.view", "leads.manage", "files.view"],
  // Content/marketing: Insights and review moderation; no access to leads
  // (they contain personal data — GDPR minimisation).
  editor: ["posts.edit", "posts.publish", "reviews.moderate"],
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "leads.view": "See enquiries from the site forms",
  "leads.manage": "Work with enquiries: change status, add notes",
  "files.view": "Open files visitors attached to enquiries",
  "reviews.moderate": "Approve, reject and add reviews",
  "posts.edit": "Write and edit articles (Insights)",
  "posts.publish": "Publish articles to the live site",
  "users.manage": "Manage the team: accounts, roles, passwords",
};

/** Plain-language summary of each preset, shown wherever a role is picked. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Admin — full access to everything, including the team",
  manager: "Manager — enquiries and attached files, no publishing",
  editor: "Editor — articles and reviews, no access to enquiries",
};

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}
