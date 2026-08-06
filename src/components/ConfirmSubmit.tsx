"use client";

/** Submit button that asks for confirmation first (destructive actions). */
export function ConfirmSubmit({
  label,
  confirmText,
  className,
}: {
  label: string;
  confirmText: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
