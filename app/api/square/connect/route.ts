import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { organizationMembers } from "@/db/schema";
import { createSquareOAuthState, stateCookieValue } from "@/lib/square-oauth-state";
import { getSquareAuthorizationUrl, squareIsConfigured } from "@/lib/square";

export async function GET(request: NextRequest) {
  if (!squareIsConfigured()) return NextResponse.json({ error: "Square is not configured" }, { status: 503 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.redirect(new URL("/sign-in", request.url));
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  const [membership] = await getDb().select({ role: organizationMembers.role }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, session.user.id), inArray(organizationMembers.role, ["owner", "admin"]))).limit(1);
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const state = createSquareOAuthState(organizationId, session.user.id);
  const response = NextResponse.redirect(getSquareAuthorizationUrl(state));
  response.cookies.set("square_oauth_state", stateCookieValue(state), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
