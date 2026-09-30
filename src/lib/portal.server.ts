/**
 * Server-only core for the examination portal.
 *
 * Everything that touches exam data goes through here so that role checks,
 * account-status checks and audit logging cannot be bypassed by the browser.
 * This file is never bundled into client code (`*.server.ts` is blocked).
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeLoginId, studentEmailFor } from "@/lib/login-id";

export { supabaseAdmin, normalizeLoginId, studentEmailFor };

export type Role = "admin" | "teacher" | "student";

export interface Actor {
  id: string;
  role: Role;
  full_name: string;
  login_id: string | null;
  email: string | null;
  status: "active" | "disabled" | "archived";
  force_password_change: boolean;
  class_id: string | null;
  roll_number: string | null;
}

/** User-facing error that is safe to show verbatim. */
export class PortalError extends Error {}

export async function getActor(userId: string): Promise<Actor> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, full_name, login_id, email, status, force_password_change, class_id, roll_number")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) throw new PortalError("Your session has expired. Please sign in again.");
  if (data.status !== "active") throw new PortalError("Your account is disabled. Contact your teacher.");
  return data as Actor;
}

export async function requireStaff(userId: string): Promise<Actor> {
  const actor = await getActor(userId);
  if (actor.role !== "admin" && actor.role !== "teacher") {
    throw new PortalError("You are not allowed to perform this action.");
  }
  return actor;
}

export async function requireStudent(userId: string): Promise<Actor> {
  const actor = await getActor(userId);
  if (actor.role !== "student") {
    throw new PortalError("You are not allowed to perform this action.");
  }
  return actor;
}

export interface AuditEntry {
  userId?: string | null;
  actorLabel?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

export async function audit(entry: AuditEntry): Promise<void> {
  await supabaseAdmin.from("audit_logs").insert({
    user_id: entry.userId ?? null,
    actor_label: entry.actorLabel ?? null,
    action: entry.action,
    resource: entry.resource ?? null,
    resource_id: entry.resourceId ?? null,
    meta: (entry.meta ?? {}) as any,
    ip_address: entry.ip ?? null,
    user_agent: entry.userAgent ?? null,
  });
}

/** Cryptographically strong temporary password, readable enough to hand over on paper. */
export function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return `${out.slice(0, 5)}-${out.slice(5, 10)}-${out.slice(10)}`;
}

/** Deterministic shuffle helper (Fisher-Yates with crypto randomness). */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    const j = r[0]! % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

/** A single question frozen into an attempt. Never leaves the server with `correct`. */
export interface AttemptQuestion {
  tqId: string;
  mcqId: string;
  version: number;
  marks: number;
  negative: number;
  question: string;
  explanation: string | null;
  chapter: string | null;
  difficulty: string;
  options: { key: OptionKey; text: string }[];
  correct: OptionKey;
}

export function stripAnswers(questions: AttemptQuestion[]) {
  return questions.map(({ correct: _correct, explanation: _explanation, ...rest }) => rest);
}

export interface ScoreResult {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  maxScore: number;
  percentage: number;
}

/**
 * Authoritative scoring. Runs only on the server; the browser never submits a score.
 */
export function scoreAttempt(
  questions: AttemptQuestion[],
  answers: Map<string, OptionKey | null>,
  negativeMarking: boolean,
): ScoreResult {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let score = 0;
  let maxScore = 0;

  for (const q of questions) {
    maxScore += q.marks;
    const picked = answers.get(q.tqId) ?? null;
    if (!picked) {
      unanswered += 1;
    } else if (picked === q.correct) {
      correct += 1;
      score += q.marks;
    } else {
      incorrect += 1;
      if (negativeMarking) score -= q.negative;
    }
  }

  const rounded = Math.round(score * 100) / 100;
  const percentage = maxScore > 0 ? Math.round((Math.max(rounded, 0) / maxScore) * 10000) / 100 : 0;

  return {
    total: questions.length,
    correct,
    incorrect,
    unanswered,
    score: rounded,
    maxScore: Math.round(maxScore * 100) / 100,
    percentage,
  };
}
