"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { checklistTemplates, locations, organizationMembers, organizations } from "@/db/schema";

const inputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(50),
  timezone: z.string().trim().min(3).max(80),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function createOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const input = inputSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const [organization] = await db.insert(organizations).values({ ...input, createdByUserId: session.user.id }).returning({ id: organizations.id });
  try {
    await db.batch([
      db.insert(organizationMembers).values({ organizationId: organization.id, userId: session.user.id, role: "owner", displayName: session.user.name || session.user.email }),
      db.insert(locations).values({ organizationId: organization.id, name: "Main location", timezone: input.timezone }),
      db.insert(checklistTemplates).values({ organizationId: organization.id, name: "Closing checklist", createdByUserId: session.user.id }),
    ]);
  } catch (error) {
    await db.delete(organizations).where((await import("drizzle-orm")).eq(organizations.id, organization.id));
    throw error;
  }
  redirect(`/admin?organization=${organization.id}`);
}
