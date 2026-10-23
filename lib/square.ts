import "server-only";

const SQUARE_VERSION = "2026-07-15";

export function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function getSquareScopes() {
  return (process.env.SQUARE_SCOPES || "MERCHANT_PROFILE_READ EMPLOYEES_READ TIMECARDS_READ TIMECARDS_WRITE")
    .split(/[\s,]+/).filter(Boolean);
}

export function squareIsConfigured() {
  return Boolean(process.env.SQUARE_APPLICATION_ID && process.env.SQUARE_APPLICATION_SECRET && process.env.SQUARE_REDIRECT_URI);
}

export type SquareBreak = { id?: string; start_at: string; end_at?: string };
export type SquareTimecard = {
  id: string;
  team_member_id: string;
  location_id: string;
  start_at: string;
  end_at?: string;
  status: "OPEN" | "CLOSED";
  version: number;
  breaks?: SquareBreak[];
  wage?: Record<string, unknown>;
  declared_cash_tip_money?: Record<string, unknown>;
};

type SquareError = { category?: string; code?: string; detail?: string };

export class SquareRequestError extends Error {
  constructor(public readonly status: number, public readonly errors: SquareError[]) {
    super(errors[0]?.detail || `Square request failed (${status})`);
  }
}

async function squareFetch<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getSquareBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION,
      ...init.headers,
    },
  });
  const body = await response.json() as T & { errors?: SquareError[] };
  if (!response.ok || body.errors?.length) throw new SquareRequestError(response.status, body.errors || []);
  return body;
}

export function getSquareAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.SQUARE_APPLICATION_ID || "",
    scope: getSquareScopes().join(" "),
    state,
    session: "false",
  });
  return `${getSquareBaseUrl()}/oauth2/authorize?${params}`;
}

export async function exchangeSquareAuthorizationCode(code: string) {
  const response = await fetch(`${getSquareBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Square-Version": SQUARE_VERSION },
    body: JSON.stringify({
      client_id: process.env.SQUARE_APPLICATION_ID,
      client_secret: process.env.SQUARE_APPLICATION_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.SQUARE_REDIRECT_URI,
    }),
  });
  const result = await response.json() as {
    access_token?: string; refresh_token?: string; merchant_id?: string; expires_at?: string; scopes?: string[];
    errors?: SquareError[];
  };
  if (!response.ok || !result.access_token || !result.refresh_token || !result.merchant_id) {
    throw new SquareRequestError(response.status, result.errors || [{ detail: "Square token exchange failed" }]);
  }
  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    merchantId: result.merchant_id,
    expiresAt: result.expires_at ? new Date(result.expires_at) : null,
    scopes: result.scopes || [],
  };
}

export async function findOpenTimecard(accessToken: string, teamMemberId: string, locationId: string) {
  const result = await squareFetch<{ timecards?: SquareTimecard[] }>(accessToken, "/v2/labor/timecards/search", {
    method: "POST",
    body: JSON.stringify({ query: { filter: { status: "OPEN", team_member_ids: [teamMemberId], location_ids: [locationId] } } }),
  });
  if ((result.timecards?.length || 0) > 1) throw new Error("MULTIPLE_OPEN_TIMECARDS");
  return result.timecards?.[0] ?? null;
}

export function validateClockOutCandidate(timecard: SquareTimecard, expectedTeamMemberId: string, expectedLocationId: string, expectedVersion?: number) {
  if (timecard.status !== "OPEN" || timecard.end_at) throw new Error("TIMECARD_NOT_OPEN");
  if (timecard.team_member_id !== expectedTeamMemberId) throw new Error("TEAM_MEMBER_MISMATCH");
  if (timecard.location_id !== expectedLocationId) throw new Error("LOCATION_MISMATCH");
  if (expectedVersion !== undefined && timecard.version !== expectedVersion) throw new Error("STALE_TIMECARD_VERSION");
  if (timecard.breaks?.some((item) => !item.end_at)) throw new Error("OPEN_BREAK");
}

export async function closeTimecard(accessToken: string, timecard: SquareTimecard, idempotencyKey: string, endAt = new Date()) {
  const writable = {
    team_member_id: timecard.team_member_id,
    location_id: timecard.location_id,
    start_at: timecard.start_at,
    end_at: endAt.toISOString(),
    version: timecard.version,
    ...(timecard.wage ? { wage: timecard.wage } : {}),
    ...(timecard.breaks ? { breaks: timecard.breaks } : {}),
    ...(timecard.declared_cash_tip_money ? { declared_cash_tip_money: timecard.declared_cash_tip_money } : {}),
  };
  const result = await squareFetch<{ timecard: SquareTimecard }>(accessToken, `/v2/labor/timecards/${encodeURIComponent(timecard.id)}`, {
    method: "PUT",
    body: JSON.stringify({ idempotency_key: idempotencyKey, timecard: writable }),
  });
  if (result.timecard.status !== "CLOSED") throw new Error("SQUARE_DID_NOT_CLOSE_TIMECARD");
  return result.timecard;
}
