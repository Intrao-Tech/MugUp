"use client";

import { useState } from "react";
import { PERMISSION_LABELS, PERMISSIONS, type Permission } from "@/lib/permissions";

// The point of a role preset: picking one instantly re-ticks the permission
// checkboxes to that preset (previously the select changed nothing visible,
// which made it look decorative). The boxes stay individually adjustable —
// what is submitted and enforced is always the checkboxes.

export function RolePermissionsFields({
  roleOptions,
  presets,
  initialRole,
  initialPermissions,
}: {
  roleOptions: { value: string; label: string }[];
  /** role slug -> its permission preset (built-in + custom roles). */
  presets: Record<string, Permission[]>;
  initialRole: string;
  initialPermissions: Permission[];
}) {
  const [role, setRole] = useState(initialRole);
  const [perms, setPerms] = useState<Permission[]>(initialPermissions);

  const applyRole = (slug: string) => {
    setRole(slug);
    const preset = presets[slug];
    if (preset) setPerms(preset);
  };
  const toggle = (perm: Permission) =>
    setPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

  return (
    <>
      <label className="block">
        <span className="font-medium">Role preset</span>
        <select
          name="role"
          value={role}
          onChange={(event) => applyRole(event.target.value)}
          className="mt-1 w-full border border-neutral-300 p-1"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="mt-0.5 block text-xs text-neutral-500">
          Picking a preset re-ticks the boxes below; adjust them freely afterwards.
        </span>
      </label>
      <fieldset>
        <legend className="font-medium">Permissions</legend>
        {PERMISSIONS.map((perm) => (
          <label key={perm} className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              name="permissions"
              value={perm}
              checked={perms.includes(perm)}
              onChange={() => toggle(perm)}
            />
            {PERMISSION_LABELS[perm]}
          </label>
        ))}
      </fieldset>
    </>
  );
}
