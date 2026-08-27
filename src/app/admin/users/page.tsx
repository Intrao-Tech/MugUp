import type { NotificationEvent, ProfileRow, RoleRow } from "@/lib/db-types";
import { PERMISSION_LABELS, PERMISSIONS } from "@/lib/permissions";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { isEmailConfigured } from "@/lib/email";
import {
  addRole,
  deleteTeamUser,
  inviteTeamUser,
  sendPasswordResetEmail,
  updateTeamUser,
} from "../actions";
import { BTN_PRIMARY, BTN_SECONDARY, CARD, H1, H2, INPUT, Notice } from "../ui";
import { RoleEditor } from "./RoleEditor";
import { RolePermissionsFields } from "./RolePermissionsFields";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  input: "Check the fields: a valid email, a name and a role are required.",
  invite:
    "Could not send the invite — the email may already be in use, or email sending is not configured.",
  save: "Could not save — try again.",
  "self-lockout": "That change would remove team management from your own account.",
  "admin-lockout": "The Admin role must keep “Manage users” — otherwise nobody can manage the panel.",
  "self-delete": "You cannot delete your own account.",
  "role-input": "Give the role a name.",
  "role-save": "Could not save the role — the name may already exist.",
  "role-in-use": "This role is still assigned to a team member — reassign them first.",
};

/** Where did the email actually go? With a real transport configured it went
 *  to the real inbox; otherwise the local stack catches it in Mailpit. */
const mailpitHint = () =>
  !isEmailConfigured() && (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("127.0.0.1")
    ? " (Local test stack without email configured: the email lands in Mailpit, http://localhost:54324.)"
    : "";

function UserCard({
  profile,
  isSelf,
  roles,
}: {
  profile: ProfileRow;
  isSelf: boolean;
  roles: RoleRow[];
}) {
  const displayName = profile.full_name || profile.email;
  const roleOptions = roles.map((role) => ({ value: role.slug, label: role.name }));
  // A role deleted after assignment still shows truthfully in the select.
  const options = roleOptions.some((o) => o.value === profile.role)
    ? roleOptions
    : [...roleOptions, { value: profile.role, label: profile.role }];
  const presets = Object.fromEntries(roles.map((role) => [role.slug, role.permissions]));
  return (
    <article className={`${CARD} p-4`}>
      <h3 className="font-bold text-ink">
        {profile.full_name || "(no name)"}
        {isSelf && <span className="ml-2 text-xs text-muted">you</span>}
      </h3>
      <p className="text-sm text-body">{profile.email}</p>
      <form action={updateTeamUser} className="mt-3 space-y-2 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <RolePermissionsFields
          roleOptions={options}
          presets={presets}
          initialRole={profile.role}
          initialPermissions={profile.permissions}
        />
        <button type="submit" className={BTN_SECONDARY}>
          Save
        </button>
      </form>

      <form action={sendPasswordResetEmail} className="mt-3 border-t border-line pt-3 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <button type="submit" className={BTN_SECONDARY}>
          Send password reset email
        </button>
        <p className="mt-1 text-xs text-muted">
          Use when {displayName} has forgotten their password: they get an email to regain
          access and must set a new password of their own at the next sign-in.
        </p>
      </form>

      {!isSelf && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-red-700 hover:underline">
            Remove {displayName}…
          </summary>
          <form action={deleteTeamUser} className="mt-2 flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={profile.id} />
            <span className="text-body">
              Deletes the account and its sign-in permanently.
            </span>
            <button type="submit" className="border border-red-700 px-3 py-1 text-red-700">
              Yes, remove
            </button>
          </form>
        </details>
      )}
    </article>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const me = await requireProfile("users.manage");
  const params = await searchParams;
  const { error } = params;

  const data = await getData();
  const [profiles, roles, roleEventRows] = await Promise.all([
    data.team.listProfiles(),
    data.team.listRoles(),
    data.notifications.listRoleEvents(),
  ]);
  const roleEvents: Record<string, NotificationEvent[]> = Object.fromEntries(
    roleEventRows.map((row) => [row.role_slug, row.events]),
  );
  const editableRoles = roles.map((role) => ({
    slug: role.slug,
    name: role.name,
    permissions: role.permissions,
    builtIn: role.built_in,
    memberCount: profiles.filter((p) => p.role === role.slug).length,
  }));
  const inputCls = INPUT;

  return (
    <div>
      <h1 className={H1}>Team</h1>
      {params.saved && <Notice tone="success">Saved.</Notice>}
      {params.invited && (
        <Notice tone="success">
          Invite sent — the email contains everything they need to sign in, and the panel makes
          them set their own password on first entry.
          {mailpitHint()}
        </Notice>
      )}
      {params["reset-sent"] && (
        <Notice tone="success">
          Password reset email sent.
          {mailpitHint()}
        </Notice>
      )}
      {params.removed && <Notice tone="success">Account removed.</Notice>}
      {params["role-saved"] && <Notice tone="success">Role saved.</Notice>}
      {params["role-deleted"] && <Notice tone="success">Role deleted.</Notice>}
      {error && <Notice tone="error">{ERRORS[error] ?? "Something went wrong."}</Notice>}

      <section className="mt-6">
        <h2 className={H2}>Invite a team member</h2>
        <form action={inviteTeamUser} className={`${CARD} mt-3 max-w-lg space-y-3 p-4`}>
          <p className="text-sm text-muted">
            They receive an email with everything needed to sign in and are required to set
            their own password on first entry — you never have to share or write one down.
          </p>
          <div>
            <label htmlFor="inv-name" className="block text-sm font-bold text-ink">
              Full name *
            </label>
            <input id="inv-name" name="full_name" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="inv-email" className="block text-sm font-bold text-ink">
              Email *
            </label>
            <input id="inv-email" name="email" type="email" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="inv-role" className="block text-sm font-bold text-ink">
              Role *
            </label>
            <select id="inv-role" name="role" className={inputCls}>
              {roles.map((role) => (
                <option key={role.slug} value={role.slug}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={BTN_PRIMARY}>
            Send invite
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className={H2}>Roles</h2>
        <p className="mt-1 text-base text-body">
          Pick a role to edit what it can do and which notifications it receives. Saving applies
          the permission set to every member holding the role; individual accounts can still be
          fine-tuned below afterwards.
        </p>
        <div className="mt-4">
          <RoleEditor roles={editableRoles} roleEvents={roleEvents} />
        </div>

        <details className="mt-4 max-w-lg">
          <summary className="cursor-pointer text-sm font-bold text-primary underline underline-offset-4 hover:text-primary-hover">
            + Create a new role
          </summary>
          <form action={addRole} className={`${CARD} mt-3 space-y-3 p-4`}>
            <div>
              <label htmlFor="role-name" className="block text-sm font-bold text-ink">
                Role name *
              </label>
              <input
                id="role-name"
                name="name"
                required
                maxLength={60}
                placeholder="e.g. Content + Enquiries"
                className={inputCls}
              />
            </div>
            <fieldset className="text-sm">
              <legend className="font-bold text-ink">Permissions in this role</legend>
              {PERMISSIONS.map((perm) => (
                <label key={perm} className="mt-1 flex items-center gap-2">
                  <input type="checkbox" name="permissions" value={perm} />
                  {PERMISSION_LABELS[perm]}
                </label>
              ))}
            </fieldset>
            <p className="text-xs text-muted">
              Notifications for the new role are configured in the editor above after creation.
            </p>
            <button type="submit" className={BTN_PRIMARY}>
              Create role
            </button>
          </form>
        </details>
      </section>

      <section className="mt-10">
        <h2 className={H2}>Current team</h2>
        <p className="mt-1 text-base text-body">
          A role is a preset; the checkboxes are what actually grants access, so any account can
          be fine-tuned per module.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              isSelf={profile.id === me.id}
              roles={roles}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
