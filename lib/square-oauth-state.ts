import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

type OAuthState = { organizationId: string; userId: string; nonce: string; expiresAt: number };

function secret() {
  const value = process.env.SQUARE_OAUTH_STATE_SECRET;
  if (!value) throw new Error("SQUARE_OAUTH_STATE_SECRET is not configured");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSquareOAuthState(organizationId: string, userId: string) {
  const state: OAuthState = { organizationId, userId, nonce: randomUUID(), expiresAt: Date.now() + 10 * 60_000 };
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySquareOAuthState(value: string): OAuthState | null {
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
    return parsed.organizationId && parsed.userId && parsed.nonce && parsed.expiresAt > Date.now() ? parsed : null;
  } catch { return null; }
}

export function stateCookieValue(value: string) {
  return createHmac("sha256", secret()).update(`cookie:${value}`).digest("base64url");
}

export function stateCookieMatches(value: string, cookie: string | undefined) {
  if (!cookie) return false;
  const expected = Buffer.from(stateCookieValue(value));
  const supplied = Buffer.from(cookie);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
