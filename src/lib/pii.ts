// Display-level masking for accounts without the "leads.pii" permission.
// (RLS still gates whole rows; these helpers keep the pipeline workable —
// status, owner, next action — without exposing learner contact data.)

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 1)}•••@${domain.slice(0, 1)}•••`;
}

export function maskPhone(phone: string | null): string | null {
  if (!phone) return phone;
  return `••• ${phone.slice(-2)}`;
}
