"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { canAcceptSubmissions, getData } from "@/lib/data";
import { formText, honeypotTripped } from "@/lib/form-data";
import { isPartnershipSubject, normaliseLeadSource } from "@/lib/lead-source";
import { notifyNewLead } from "@/lib/notify";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

/**
 * Shared submit handler for the two public enquiry forms (Book Assessment /
 * Contact). Writes go through the backend's privileged port — visitors never
 * get direct database or storage access.
 */
export async function submitLead(formData: FormData): Promise<void> {
  const formKind = formData.get("form") === "contact" ? "contact" : "booking";
  const locale = formData.get("locale") === "ua" ? "ua" : "en";
  const backUrl = `/${locale}/${formKind === "contact" ? "contact" : "book-assessment"}`;

  if (honeypotTripped(formData)) redirect(`${backUrl}?sent=1`);
  if (!canAcceptSubmissions()) redirect(`${backUrl}?error=1`);

  const fullName = formText(formData, "fullName", 200);
  const email = formText(formData, "email", 200);
  if (!fullName || !email || !email.includes("@")) redirect(`${backUrl}?error=1`);

  const data = await getData();
  let filePath: string | null = null;

  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    const extension = attachment.name.split(".").pop()?.toLowerCase() ?? "";
    if (attachment.size > MAX_FILE_BYTES || !ALLOWED_EXTENSIONS.includes(extension)) {
      redirect(`${backUrl}?error=1`);
    }
    const safeName = attachment.name.replace(/[^\w.-]+/g, "_").slice(-100);
    const path = `${formKind}/${randomUUID()}/${safeName}`;
    const { error: uploadError } = await data.files.uploadLeadFile(path, attachment);
    if (uploadError) redirect(`${backUrl}?error=1`);
    filePath = path;
  }

  const phone = formText(formData, "phone", 50);
  const subject = formText(formData, "subject", 200);
  const message = formText(formData, "message", 5000);
  // A Contact submission about partnership is its own enquiry type.
  const form = formKind === "contact" && isPartnershipSubject(subject) ? "partnership" : formKind;

  const { error } = await data.leads.submit({
    form,
    locale,
    fullName,
    email,
    phone,
    whoFor: formText(formData, "whoFor", 100),
    pathwayInterest: formText(formData, "pathwayInterest", 100),
    preferredFormat: formText(formData, "preferredFormat", 100),
    subject,
    message,
    filePath,
    source: normaliseLeadSource(formText(formData, "source", 100)),
  });
  if (!error) {
    await notifyNewLead({
      form,
      locale,
      fullName,
      email,
      phone,
      subject,
      message,
      hasFile: Boolean(filePath),
    });
  }
  redirect(`${backUrl}${error ? "?error=1" : "?sent=1"}`);
}
