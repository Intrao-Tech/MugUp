import { Suspense } from "react";
import type { FormSpec, Locale } from "@/content/types";
import { submitLead } from "@/app/actions/leads";
import { FormStatusBanner } from "@/components/FormStatusBanner";
import { Button } from "@/components/ui/Button";

interface FormRendererProps {
  form: FormSpec;
  /** "booking" | "contact" — stored on the lead row. */
  formKind: "booking" | "contact";
  locale: Locale;
  /** When Supabase is not configured the form renders with submit disabled. */
  enabled: boolean;
  notWiredNote: string;
  sentText: string;
  errorText: string;
}

export function FormRenderer({
  form,
  formKind,
  locale,
  enabled,
  notWiredNote,
  sentText,
  errorText,
}: FormRendererProps) {
  const inputCls =
    "mt-1.5 w-full rounded-lg border border-ink-300 bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";
  return (
    <form action={enabled ? submitLead : undefined} aria-label={form.title} className="mx-auto max-w-2xl space-y-5 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
      <h3 className="text-h3 text-ink">{form.title}</h3>
      {form.intro && <p>{form.intro}</p>}
      <Suspense fallback={null}>
        <FormStatusBanner sentText={sentText} errorText={errorText} />
      </Suspense>
      <input type="hidden" name="form" value={formKind} />
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`hp-${formKind}`}>Website</label>
        <input id={`hp-${formKind}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {form.fields.map((field) => {
        const id = `f-${formKind}-${field.name}`;
        const label = (
          <label htmlFor={id} className="block text-sm font-bold text-ink">
            {field.label}
            {field.required && <span aria-hidden="true"> *</span>}
          </label>
        );
        return (
          <div key={field.name}>
            {field.type === "checkbox" ? (
              <label htmlFor={id} className="flex items-start gap-3 text-sm">
                <input
                  id={id}
                  name={field.name}
                  type="checkbox"
                  required={field.required}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-ink-300 accent-teal-600"
                />
                <span>{field.label}</span>
              </label>
            ) : field.type === "textarea" ? (
              <>
                {label}
                <textarea id={id} name={field.name} rows={5} required={field.required} className={inputCls} />
              </>
            ) : field.type === "select" ? (
              <>
                {label}
                <select id={id} name={field.name} required={field.required} className={inputCls}>
                  <option value="" />
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                {label}
                <input
                  id={id}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  className={inputCls}
                />
              </>
            )}
            {field.hint && <p className="mt-1.5 text-sm text-muted">{field.hint}</p>}
          </div>
        );
      })}
      <Button type="submit" disabled={!enabled} size="lg" className="w-full sm:w-auto">
        {form.submitLabel}
      </Button>
      {!enabled && <p className="text-sm text-muted">{notWiredNote}</p>}
    </form>
  );
}
