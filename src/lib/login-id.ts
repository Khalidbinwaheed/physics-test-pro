/**
 * Student accounts are addressed by a teacher-issued Login ID (e.g. "PHY-001").
 * Auth internally needs an email address, so each Login ID maps deterministically
 * onto a reserved internal address. This mapping is shared by the login screen and
 * the server so both sides agree without any lookup that could leak account existence.
 */
export const STUDENT_EMAIL_DOMAIN = "students.physlab.local";

export function normalizeLoginId(loginId: string): string {
  return loginId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function studentEmailFor(loginId: string): string {
  return `${normalizeLoginId(loginId)}@${STUDENT_EMAIL_DOMAIN}`;
}

export function isValidLoginId(loginId: string): boolean {
  const normalized = normalizeLoginId(loginId);
  return normalized.length >= 3 && normalized.length <= 40;
}
