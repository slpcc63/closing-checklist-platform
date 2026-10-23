"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { checklistTemplates, templateItems } from "@/db/schema";
import { requireOrganizationRole } from "@/lib/authorization";

const itemInput = z.object({
  organizationId: z.string().uuid(),
  templateId: z.string().uuid(),
  station: z.string().trim().min(2).max(80),
  timeBlock: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(240),
  dayOfWeek: z.union([z.literal(""), z.coerce.number().int().min(0).max(6)]),
  required: z.boolean(),
});

async function verifyTemplate(organizationId: string, templateId: string) {
  const [template] = await getDb().select({ id: checklistTemplates.id })
    .from(checklistTemplates)
    .where(and(eq(checklistTemplates.id, templateId), eq(checklistTemplates.organizationId, organizationId)))
    .limit(1);
  if (!template) throw new Error("Checklist template not found");
}

export async function addTemplateItem(formData: FormData) {
  const input = itemInput.parse({
    ...Object.fromEntries(formData),
    required: formData.get("required") === "on",
  });
  await requireOrganizationRole(input.organizationId, ["owner", "admin", "manager"]);
  await verifyTemplate(input.organizationId, input.templateId);

  const db = getDb();
  const [result] = await db.select({ value: max(templateItems.sortOrder) })
    .from(templateItems)
    .where(eq(templateItems.templateId, input.templateId));
  await db.insert(templateItems).values({
    templateId: input.templateId,
    station: input.station,
    timeBlock: input.timeBlock,
    title: input.title,
    required: input.required,
    dayOfWeek: input.dayOfWeek === "" ? null : input.dayOfWeek,
    sortOrder: (result?.value ?? 0) + 1,
  });
  revalidatePath(`/admin/organizations/${input.organizationId}/template`);
}

export async function deleteTemplateItem(formData: FormData) {
  const input = z.object({
    organizationId: z.string().uuid(),
    templateId: z.string().uuid(),
    itemId: z.string().uuid(),
  }).parse(Object.fromEntries(formData));
  await requireOrganizationRole(input.organizationId, ["owner", "admin", "manager"]);
  await verifyTemplate(input.organizationId, input.templateId);
  await getDb().delete(templateItems).where(and(
    eq(templateItems.id, input.itemId),
    eq(templateItems.templateId, input.templateId),
  ));
  revalidatePath(`/admin/organizations/${input.organizationId}/template`);
}
