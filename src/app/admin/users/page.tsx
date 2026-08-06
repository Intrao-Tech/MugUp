import type { ProfileRow } from "@/lib/db-types";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_PRESETS,
  type Role,
} from "@/lib/permissions";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { createTeamUser, inviteTeamUser, issueTeamPassword, updateTeamUser } from "../actions";
import { Notice } from "../ui";

export const dynamic = "force-dynamic";

const ROLES = Object.keys(ROLE_PRESETS) as Role[];

const ERRORS: Record<string, string> = {
  input: "Check the fields: valid email, name, password of 6+ characters.",
  create: "Could not create the account — the email may already be in use.",
  invite: "Could not send the invite — the email may already be in use, or email sending is not configured.",
  save: "Could not save — try again.",
  "short-password": "The password must be at least 6 characters.",
  "self-lockout": "You cannot remove team management from your own account.",
};

function UserCard({ profile, isSelf }: { profile: ProfileRow; isSelf: boolean }) {
  return (
    <article className="border border-neutral-300 bg-white p-4">
      <h3 className="font-semibold">
        {profile.full_name || "(no name)"}
        {isSelf && <span className="ml-2 text-xs text-neutral-500">you</span>}
      </h3>
      <p className="text-sm text-neutral-600">{profile.email}</p>
      <form action={updateTeamUser} className="mt-3 space-y-2 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <label className="block">
          <span className="font-medium">Role preset</span>
          <select name="role" defaultValue={profile.role} className="mt-1 w-full border border-neutral-300 p-1">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_DESCRIPTIONS[role]}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="font-medium">Permissions</legend>
          {PERMISSIONS.map((perm) => (
            <label key={perm} className="mt-1 flex items-center gap-2">
              <input
                type="checkbox"
                name="permissions"
                value={perm}
                defaultChecked={profile.permissions.includes(perm)}
              />
              {PERMISSION_LABELS[perm]}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="border border-neutral-900 px-3 py-1">
          Save
        </button>
      </form>
      <form action={issueTeamPassword} className="mt-3 border-t border-neutral-200 pt-3 text-sm">
        <input type="hidden" name="id" value={profile.id} />
        <label htmlFor={`pw-${profile.id}`} className="block font-medium">
          Issue a new password
        </label>
        <p className="text-xs text-neutral-500">
          Type a new password and pass it to the team member privately; they can change it later
          on their “My account” page.
        </p>
        <div className="mt-1 flex gap-2">
          <input
            id={`pw-${profile.id}`}
            name="password"
            type="text"
            minLength={6}
            required
            placeholder="New password (6+ chars)"
            autoComplete="off"
            className="w-full border border-neutral-300 px-2 py-1"
          />
          <button type="submit" className="whitespace-nowrap border border-neutral-900 px-3 py-1">
            Set
          </button>
        </div>
      </form>
    </article>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    invited?: string;
    "password-issued"?: string;
  }>;
}) {
  const me = await requireProfile("users.manage");
  const { error, saved, invited, "password-issued": passwordIssued } = await searchParams;

  const data = await getData();
  const profiles = await data.team.listProfiles();

  return (
    <div>
      <h1 className="text-2xl font-bold">Team</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A role is a preset; the checkboxes are what actually grants access, so any account can be
        fine-tuned per module.
      </p>
      {saved && (
        <Notice tone="success">Saved.</Notice>
      )}
      {passwordIssued && (
        <Notice tone="success">
          New password set — pass it to the team member privately.
        </Notice>
      )}
      {invited && (
        <Notice tone="success">
          Invite sent — the team member sets their own password via the emailed link.
        </Notice>
      )}
      {error && (
        <Notice tone="error">
          {ERRORS[error] ?? "Something went wrong."}
        </Notice>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {profiles.map((profile) => (
          <UserCard key={profile.id} profile={profile} isSelf={profile.id === me.id} />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Invite a team member</h2>
        <p className="mt-1 text-sm text-neutral-500">
          The easiest way: they get an email with a link and set their own password. No
          self-registration exists. (Local stack: invite emails land in Mailpit at
          http://localhost:54324.)
        </p>
        <form action={inviteTeamUser} className="mt-3 max-w-lg space-y-3">
          <div>
            <label htmlFor="inv-name" className="block text-sm font-medium">
              Full name *
            </label>
            <input
              id="inv-name"
              name="full_name"
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="inv-email" className="block text-sm font-medium">
              Email *
            </label>
            <input
              id="inv-email"
              name="email"
              type="email"
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="inv-role" className="block text-sm font-medium">
              Role preset *
            </label>
            <select id="inv-role" name="role" className="mt-1 w-full border border-neutral-400 px-3 py-2">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_DESCRIPTIONS[role]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
            Send invite
          </button>
        </form>
      </section>

      <details className="mt-6 max-w-lg">
        <summary className="cursor-pointer text-sm font-medium text-neutral-600">
          Or create an account with a temporary password (no email needed)
        </summary>
        <form action={createTeamUser} className="mt-3 space-y-3">
          <div>
            <label htmlFor="new-name" className="block text-sm font-medium">
              Full name *
            </label>
            <input
              id="new-name"
              name="full_name"
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="new-email" className="block text-sm font-medium">
              Email *
            </label>
            <input
              id="new-email"
              name="email"
              type="email"
              required
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium">
              Temporary password * (6+ characters)
            </label>
            <input
              id="new-password"
              name="password"
              type="text"
              required
              minLength={6}
              autoComplete="off"
              className="mt-1 w-full border border-neutral-400 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="new-role" className="block text-sm font-medium">
              Role preset *
            </label>
            <select id="new-role" name="role" className="mt-1 w-full border border-neutral-400 px-3 py-2">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_DESCRIPTIONS[role]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
            Create account
          </button>
        </form>
      </details>
    </div>
  );
}
