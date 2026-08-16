/** Join class names, skipping falsy values. Deliberately tiny — no clsx dependency. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
