import type { CustomRoleRow, ProfileRow } from "@/lib/db-types";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_PRESETS,
  type BuiltInRole,
} from "@/lib/permissions";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import {
  addCustomRole,
  deleteCustomRole,
  deleteTeamUser,
  inviteTeamUser,
  sendPasswordResetEmail,
  updateTeamUser,
} from "../actions";
import { Notice } from "../ui";
import { RolePermissionsFields } from "./RolePermissionsFields";

export const dynamic = "force-dynamic";

const BUILT_IN_ROLES = Object.keys(ROLE_PRESETS) as BuiltInRole[];

const ERRORS: Record<string, string> = {
  input: "Check the fields: a valid email, a name and a role are required.",
  invite:
    "Could not send the invite — the email may already be in use, or email sending is not configured.",
  save: "Could not save — try again.",
  "self-lockout": "You cannot remove team management from your own account.",
  "self-delete": "You cannot delete your own account.",
  "role-input": "Give the role a name (built-in role names are reserved).",
  "role-save": "Could not save the role — the name may already exist.",
  "role-in-use": "This role is still assigned to a team member — reassign them first.",
};

/** Mailpit hint only makes sense on the local Supabase stack. */
const isLocalStack = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("127.0.0.1");

/** <option> list: built-in presets + custom roles (+ the current value if it
 *  belongs to a since-deleted custom role, so the select stays truthful). */
function RoleOptions({ customRoles, current }: { customRoles: CustomRoleRow[]; current?: string }) {
  const known = [...BUILT_IN_ROLES, ...customRoles.map((r) => r.slug)];
  return (
    <>
      {BUILT_IN_ROLES.map((role) => (
        <option key={role} value={role}>
          {ROLE_DESCRIPTIONS[role]}
        </option>
      ))}
      {customRoles.map((role) => (
        <option key={role.slug} value={role.slug}>
          {role.name} — custom role
        </option>
      ))}
      {current && !known.includes(current) && <option value={current}>{current}</option>}
    </>
  );
}

function UserCard({
  profile,
  isSelf,
  customRoles,
}: {
  profile: ProfileRow;
  isSelf: boolean;
  customRoles: CustomRoleRow[];
}) {
  const displayName = profile.full_name || profile.email;
  const known = [...BUILT_IN_ROLES, ...customRoles.map((r) => r.slug)];
  const roleOptions = [
    ...BUILT_IN_ROLES.map((role) => ({ value: role, label: ROLE_DESCRIPTIONS[role] })),
    ...customRoles.map((role) => ({ value: role.slug, label: `${role.name} — custom role` })),
    ...(known.includes(profile.role) ? [] : [{ value: profile.role, label: profile.role }]),
  ];
  const presets: Record<string, typeof profile.permissions> = {
    ...ROLE_PRESETS,
    ...Object.fromEntries(customRoles.map((role) => [role.slug, role.permissions])),
  };
  return (
    <article className="border border-neutral-300 bg-white p-4">
      <h3 className="font-semibold">
        {profile.full_name || "(no name)"}
        {isSelf && <span className="ml-2 text-xs text-neutral-500">you</span>}
      </h3>
      <p className="text-sm text-neutral-600">{profile.email}</p>
      <form action={updateTeamUser} className="mt-3 space-y-2 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <RolePermissionsFields
          roleOptions={roleOptions}
          presets={presets}
          initialRole={profile.role}
          initialPermissions={profile.permissions}
        />
        <button type="submit" className="border border-neutral-900 px-3 py-1">
          Save
        </button>
      </form>

      <form action={sendPasswordResetEmail} className="mt-3 border-t border-neutral-200 pt-3 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <button type="submit" className="border border-neutral-400 px-3 py-1 hover:border-neutral-900">
          Send password reset email
        </button>
        <p className="mt-1 text-xs text-neutral-500">
          {displayName} gets a link to choose a new password — nothing to write down or hand over.
        </p>
      </form>

      {!isSelf && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-red-700 hover:underline">
            Remove {displayName}…
          </summary>
          <form action={deleteTeamUser} className="mt-2 flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={profile.id} />
            <span className="text-neutral-600">
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
  const [profiles, customRoles] = await Promise.all([
    data.team.listProfiles(),
    data.team.listCustomRoles(),
  ]);
  const inputCls = "mt-1 w-full border border-neutral-400 px-3 py-2";

  return (
    <div>
      <h1 className="text-2xl font-bold">Team</h1>
      {params.saved && <Notice tone="success">Saved.</Notice>}
      {params.invited && (
        <Notice tone="success">
          Invite sent — the team member sets their own password via the emailed link.
          {isLocalStack && " (Local test stack: the email arrives in Mailpit, port 54324.)"}
        </Notice>
      )}
      {params["reset-sent"] && (
        <Notice tone="success">
          Password reset email sent.
          {isLocalStack && " (Local test stack: the email arrives in Mailpit, port 54324.)"}
        </Notice>
      )}
      {params.removed && <Notice tone="success">Account removed.</Notice>}
      {params["role-saved"] && <Notice tone="success">Role created.</Notice>}
      {params["role-deleted"] && <Notice tone="success">Role deleted.</Notice>}
      {error && <Notice tone="error">{ERRORS[error] ?? "Something went wrong."}</Notice>}

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Invite a team member</h2>
        <form action={inviteTeamUser} className="mt-3 max-w-lg space-y-3 border border-neutral-300 bg-white p-4">
          <p className="text-sm text-neutral-500">
            They receive an email with a secure link and choose their own password — you never
            have to share one.
          </p>
          <div>
            <label htmlFor="inv-name" className="block text-sm font-medium">
              Full name *
            </label>
            <input id="inv-name" name="full_name" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="inv-email" className="block text-sm font-medium">
              Email *
            </label>
            <input id="inv-email" name="email" type="email" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="inv-role" className="block text-sm font-medium">
              Role *
            </label>
            <select id="inv-role" name="role" className={inputCls}>
              <RoleOptions customRoles={customRoles} />
            </select>
          </div>
          <button type="submit" className="border border-neutral-900 bg-neutral-900 px-4 py-2 font-medium text-white">
            Send invite
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Current team</h2>
        <p className="mt-1 text-sm text-neutral-500">
          A role is a preset; the checkboxes are what actually grants access, so any account can
          be fine-tuned per module.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              isSelf={profile.id === me.id}
              customRoles={customRoles}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Roles</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Three built-in roles ship with the panel; add your own presets for recurring
          combinations. Picking a role pre-fills the permissions — they can still be adjusted
          per person afterwards.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {BUILT_IN_ROLES.map((role) => (
              <div key={role} className="border border-neutral-200 bg-white p-3 text-sm">
                <p className="font-medium">
                  {ROLE_DESCRIPTIONS[role]}
                  <span className="ml-2 text-xs font-normal text-neutral-400">built-in</span>
                </p>
              </div>
            ))}
            {customRoles.map((role) => (
              <div key={role.slug} className="border border-neutral-300 bg-white p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{role.name}</p>
                  <form action={deleteCustomRole}>
                    <input type="hidden" name="slug" value={role.slug} />
                    <button type="submit" className="text-red-700 underline">
                      Delete
                    </button>
                  </form>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {role.permissions.length
                    ? role.permissions.map((perm) => PERMISSION_LABELS[perm]).join(" · ")
                    : "No access granted"}
                </p>
              </div>
            ))}
          </div>

          <form action={addCustomRole} className="space-y-3 self-start border border-neutral-300 bg-white p-4">
            <h3 className="font-semibold">Create a custom role</h3>
            <div>
              <label htmlFor="role-name" className="block text-sm font-medium">
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
              <legend className="font-medium">Permissions in this role</legend>
              {PERMISSIONS.map((perm) => (
                <label key={perm} className="mt-1 flex items-center gap-2">
                  <input type="checkbox" name="permissions" value={perm} />
                  {PERMISSION_LABELS[perm]}
                </label>
              ))}
            </fieldset>
            <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
              Create role
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
