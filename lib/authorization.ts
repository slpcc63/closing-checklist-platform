import "server-only";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { organizationMembers } from "@/db/schema";
import { auth } from "@/lib/auth";

type OrganizationRole = "owner" | "admin" | "manager" | "employee";

export async function requireOrganizationRole(
  organizationId: string,
  allowedRoles: OrganizationRole[],
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const [membership] = await getDb()
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, session.user.id),
    ))
    .limit(1);

  if (!membership || !allowedRoles.includes(membership.role)) redirect("/admin");
  return { user: session.user, role: membership.role };
}
