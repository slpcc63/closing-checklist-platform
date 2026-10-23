import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { checklistTemplates, organizations, templateItems } from "@/db/schema";
import { requireOrganizationRole } from "@/lib/authorization";
import { addTemplateItem, deleteTemplateItem } from "./actions";

export const dynamic = "force-dynamic";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TemplateEditorPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  await requireOrganizationRole(organizationId, ["owner", "admin", "manager"]);
  const db = getDb();
  const [organizationRows, templateRows] = await Promise.all([
    db.select({ name: organizations.name, color: organizations.primaryColor })
      .from(organizations).where(eq(organizations.id, organizationId)).limit(1),
    db.select({ id: checklistTemplates.id, name: checklistTemplates.name })
      .from(checklistTemplates)
      .where(eq(checklistTemplates.organizationId, organizationId))
      .orderBy(asc(checklistTemplates.createdAt)).limit(1),
  ]);
  const [organization] = organizationRows;
  if (!organization) notFound();
  const [template] = templateRows;
  if (!template) notFound();
  const items = await db.select().from(templateItems)
    .where(eq(templateItems.templateId, template.id)).orderBy(asc(templateItems.sortOrder));
  const stations = Map.groupBy(items, (item) => item.station);

  return <main className="admin-page">
    <header className="admin-header"><Link className="platform-brand" href="/admin"><span>C</span> CLOSEOUT</Link><div><Link className="admin-back" href="/admin">← Organizations</Link></div></header>
    <section className="admin-intro template-intro" style={{ borderColor: organization.color }}><p className="eyebrow">{organization.name}</p><h1>{template.name}</h1><p>Required tasks must be completed or exception-marked before clock-out. Guidance is displayed for employees, but it does not block them.</p></section>
    <div className="template-layout">
      <section className="admin-card template-list"><div className="template-heading"><div><p className="eyebrow">Current template</p><h2>{items.length} items</h2></div><span>{stations.size} stations</span></div>
        {items.length === 0 ? <p className="empty-copy">No checklist items yet. Add the first one using the form.</p> : Array.from(stations, ([station, stationItems]) => <section className="template-station" key={station}><h3>{station}</h3>{stationItems.map((item) => <article key={item.id}><div><strong>{item.title}</strong><small>{item.timeBlock}{item.dayOfWeek !== null ? ` · ${days[item.dayOfWeek]}` : " · Every day"}</small></div><span className={item.required ? "required-badge" : "guidance-badge"}>{item.required ? "Required" : "Guidance"}</span><form action={deleteTemplateItem}><input type="hidden" name="organizationId" value={organizationId}/><input type="hidden" name="templateId" value={template.id}/><input type="hidden" name="itemId" value={item.id}/><button className="delete-item" type="submit" aria-label={`Delete ${item.title}`}>Delete</button></form></article>)}</section>)}
      </section>
      <aside className="admin-card add-item-card"><p className="eyebrow">Customize</p><h2>Add an item</h2><form className="workspace-form" action={addTemplateItem}>
        <input type="hidden" name="organizationId" value={organizationId}/><input type="hidden" name="templateId" value={template.id}/>
        <label><span>Station</span><input name="station" required placeholder="Front counter" list="station-options"/><datalist id="station-options">{Array.from(stations.keys()).map((station) => <option key={station} value={station}/>)}</datalist></label>
        <label><span>Time block</span><input name="timeBlock" required placeholder="30 minutes before close"/></label>
        <label><span>Task or guidance</span><textarea name="title" required placeholder="Clean and sanitize the espresso station"/></label>
        <label><span>Day</span><select name="dayOfWeek" defaultValue=""><option value="">Every day</option>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
        <label className="required-check"><input name="required" type="checkbox" defaultChecked/><span><strong>Required for clock-out</strong><small>Turn this off for non-checkable guidance.</small></span></label>
        <button className="primary-button" type="submit">Add to checklist</button>
      </form></aside>
    </div>
  </main>;
}
