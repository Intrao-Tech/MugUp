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
    <div className="border border-neutral-300 bg-white p-4">
      {/* Sibling form for Delete — nested forms are invalid HTML; the button
          inside the edit form targets it via the form= attribute. */}
      <form action={deleteRole} id={deleteFormId}>
        <input type="hidden" name="slug" value={role.slug} />
      </form>

      <form action={saveRole} className="space-y-4">
        <input type="hidden" name="slug" value={role.slug} />
        <div>
          <label htmlFor="role-edit-name" className="block text-sm font-medium">
            Role name
          </label>
          {role.builtIn ? (
            <>
              <p id="role-edit-name" className="mt-1 font-medium">
                {role.name} <span className="text-xs font-normal text-neutral-400">built-in</span>
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
              className="mt-1 w-full max-w-md border border-neutral-400 px-3 py-2"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="text-sm">
            <legend className="font-medium">What this role can do</legend>
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
            <legend className="font-medium">Notifications this role receives</legend>
            {NOTIFICATION_EVENTS.map((event) => {
              const required = NOTIFICATION_EVENT_PERMISSION[event];
              const allowed = perms.includes(required);
              return (
                <label
                  key={event}
                  className={`mt-1 flex items-center gap-2 ${allowed ? "" : "text-neutral-400"}`}
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
          <button type="submit" className="border border-neutral-900 bg-neutral-900 px-4 py-2 font-medium text-white">
            Save role
          </button>
          <p className="text-xs text-neutral-500">
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
            className={`border px-3 py-1 text-sm ${
              r.slug === selected
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white hover:border-neutral-900"
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
