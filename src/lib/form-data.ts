/** Trimmed, length-capped text field value; null when absent or empty. */
export function formText(formData: FormData, name: string, max = 500): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/** True when a bot filled the invisible "website" field on a public form. */
export function honeypotTripped(formData: FormData): boolean {
  return Boolean(formText(formData, "website"));
}

/** Integer rating 1–5 from a select, or null for "no rating"/garbage. */
export function formRating(formData: FormData): number | null {
  const value = Number(formData.get("rating"));
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}
