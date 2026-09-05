"use client";

import { useState } from "react";
import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_EVENT_PERMISSION,
  NOTIFICATION_EVENTS,
  type NotificationEvent,
} from "@/lib/db-types";
import { PERMISSION_LABELS, PERMISSIONS, type Permission } from "@/lib/permissions";
import { deleteRole, saveRole } from "../actions";
import { BTN_PRIMARY, CARD, INPUT } from "../ui";

// The role panel: pick a role, edit EVERYTHING about it in one form —
// permissions and the notifications the role receives. Saving re-applies the
// permission set to every member holding the role (a role IS its members'
// access). A notification event is only offered while the role has the
// permission to open its target; unticking the permission unticks the event.

export interface EditableRole {
  slug: string;
  name: string;
  permissions: Permission[];
  builtIn: boolean;
  memberCount: number;
}

function RoleForm({
  role,
  initialEvents,
}: {
  role: EditableRole;
  initialEvents: NotificationEvent[];
}) {
  const [name, setName] = useState(role.name);
  const [perms, setPerms] = useState<Permission[]>(role.permissions);
  const [events, setEvents] = useState<NotificationEvent[]>(initialEvents);

  const togglePerm = (perm: Permission) =>
    setPerms((prev) => {
      const next = prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm];
      // An event the role can no longer open goes away with the permission.
      setEvents((current) =>
        current.filter((event) => next.includes(NOTIFICATION_EVENT_PERMISSION[event])),
      );
      return next;
    });
  const toggleEvent = (event: NotificationEvent) =>
    setEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));

  const deleteFormId = `delete-role-${role.slug}`;

  return (
    <div className={`${CARD} p-4`}>
      {/* Sibling form for Delete — nested forms are invalid HTML; the button
          inside the edit form targets it via the form= attribute. */}
      <form action={deleteRole} id={deleteFormId}>
        <input type="hidden" name="slug" value={role.slug} />
      </form>

      <form action={saveRole} className="space-y-4">
        <input type="hidden" name="slug" value={role.slug} />
        <div>
          <label htmlFor="role-edit-name" className="block text-sm font-bold text-ink">
            Role name
          </label>
          {role.builtIn ? (
            <>
              <p id="role-edit-name" className="mt-1 font-bold text-ink">
                {role.name} <span className="text-xs font-normal text-muted">built-in</span>
              </p>
              <input type="hidden" name="name" value={role.name} />
            </>
          ) : (
            <input
              id="role-edit-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={60}
              className={`${INPUT} max-w-md`}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="text-sm">
            <legend className="font-bold text-ink">What this role can do</legend>
            {PERMISSIONS.map((perm) => (
              <label key={perm} className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="permissions"
                  value={perm}
                  checked={perms.includes(perm)}
                  onChange={() => togglePerm(perm)}
                />
                {PERMISSION_LABELS[perm]}
              </label>
            ))}
          </fieldset>

          <fieldset className="text-sm">
            <legend className="font-bold text-ink">Notifications this role receives</legend>
            {NOTIFICATION_EVENTS.map((event) => {
              const required = NOTIFICATION_EVENT_PERMISSION[event];
              const allowed = perms.includes(required);
              return (
                <label
                  key={event}
                  className={`mt-1 flex items-center gap-2 ${allowed ? "" : "text-muted"}`}
                >
                  <input
                    type="checkbox"
                    name="events"
                    value={event}
                    checked={events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    disabled={!allowed}
                  />
                  {NOTIFICATION_EVENT_LABELS[event]}
                  {!allowed && (
                    <span className="text-xs">(needs “{PERMISSION_LABELS[required]}”)</span>
                  )}
                </label>
              );
            })}
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={BTN_PRIMARY}>
            Save role
          </button>
          <p className="text-xs text-muted">
            {role.memberCount > 0
              ? `Applies immediately to the ${role.memberCount} member${role.memberCount === 1 ? "" : "s"} with this role.`
              : "No members hold this role yet."}
          </p>
          {!role.builtIn && role.memberCount === 0 && (
            <button type="submit" form={deleteFormId} className="ml-auto text-sm text-red-700 underline">
              Delete role
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function RoleEditor({
  roles,
  roleEvents,
}: {
  roles: EditableRole[];
  roleEvents: Record<string, NotificationEvent[]>;
}) {
  const [selected, setSelected] = useState(roles[0]?.slug ?? "");
  const role = roles.find((r) => r.slug === selected);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {roles.map((r) => (
          <button
            key={r.slug}
            type="button"
            onClick={() => setSelected(r.slug)}
            className={`rounded-sm border px-3 py-1 text-sm transition-colors ${
              r.slug === selected
                ? "border-ink bg-ink text-surface"
                : "border-line bg-surface text-body hover:border-ink hover:text-ink"
            }`}
          >
            {r.builtIn ? r.name.split(" — ")[0] : r.name}
            {r.memberCount > 0 && <span className="ml-1 opacity-60">({r.memberCount})</span>}
          </button>
        ))}
      </div>
      {/* key: switching roles resets the form state to that role's data. */}
      {role && <RoleForm key={role.slug} role={role} initialEvents={roleEvents[role.slug] ?? []} />}
    </div>
  );
}
