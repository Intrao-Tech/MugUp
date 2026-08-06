import { Suspense } from "react";
import type { FormSpec, Locale } from "@/content/types";
import { submitLead } from "@/app/actions/leads";
import { FormStatusBanner } from "@/components/FormStatusBanner";

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
  const inputCls = "mt-1 w-full border border-neutral-400 px-3 py-2";
  return (
    <form action={enabled ? submitLead : undefined} aria-label={form.title} className="mx-auto max-w-2xl space-y-4">
      <h3 className="text-xl font-semibold">{form.title}</h3>
      {form.intro && <p className="text-neutral-700">{form.intro}</p>}
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
          <label htmlFor={id} className="block text-sm font-medium">
            {field.label}
            {field.required && <span aria-hidden="true"> *</span>}
          </label>
        );
        return (
          <div key={field.name}>
            {field.type === "checkbox" ? (
              <label htmlFor={id} className="flex items-start gap-2 text-sm">
                <input id={id} name={field.name} type="checkbox" required={field.required} />
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
            {field.hint && <p className="mt-1 text-xs text-neutral-500">{field.hint}</p>}
          </div>
        );
      })}
      <button
        type="submit"
        disabled={!enabled}
        className="border border-neutral-900 px-5 py-2 font-medium disabled:opacity-50"
      >
        {form.submitLabel}
      </button>
      {!enabled && <p className="text-sm text-neutral-500">{notWiredNote}</p>}
    </form>
  );
}
