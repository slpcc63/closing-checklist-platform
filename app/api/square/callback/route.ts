import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { organizationMembers, squareConnections } from "@/db/schema";
import { exchangeSquareAuthorizationCode } from "@/lib/square";
import { stateCookieMatches, verifySquareOAuthState } from "@/lib/square-oauth-state";
import { encryptSecret } from "@/lib/token-crypto";

function finish(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.delete("square_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("error")) return finish(request, "/?square=authorization_failed");
  const code = request.nextUrl.searchParams.get("code");
  const rawState = request.nextUrl.searchParams.get("state");
  const state = rawState ? verifySquareOAuthState(rawState) : null;
  if (!code || !rawState || !state || !stateCookieMatches(rawState, request.cookies.get("square_oauth_state")?.value)) return finish(request, "/?square=state_invalid");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.id !== state.userId) return finish(request, "/sign-in");
  const [membership] = await getDb().select({ role: organizationMembers.role }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, state.organizationId), eq(organizationMembers.userId, session.user.id), inArray(organizationMembers.role, ["owner", "admin"]))).limit(1);
  if (!membership) return finish(request, "/?square=forbidden");
  try {
    const token = await exchangeSquareAuthorizationCode(code);
    await getDb().insert(squareConnections).values({
      organizationId: state.organizationId,
      merchantId: token.merchantId,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
      accessTokenEncrypted: encryptSecret(token.accessToken),
      refreshTokenEncrypted: encryptSecret(token.refreshToken),
      authorizedScopes: token.scopes,
      expiresAt: token.expiresAt,
      connectedByUserId: session.user.id,
    }).onConflictDoUpdate({ target: squareConnections.organizationId, set: {
      merchantId: token.merchantId,
      accessTokenEncrypted: encryptSecret(token.accessToken),
      refreshTokenEncrypted: encryptSecret(token.refreshToken),
      authorizedScopes: token.scopes,
      expiresAt: token.expiresAt,
      connectedByUserId: session.user.id,
      updatedAt: new Date(),
    }});
    return finish(request, "/?square=connected");
  } catch { return finish(request, "/?square=exchange_failed"); }
}
