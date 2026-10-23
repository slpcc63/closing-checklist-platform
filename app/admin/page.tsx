import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { SignOutButton } from "@/components/sign-out-button";
import { createOrganization } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const memberships = await getDb().select({ id: organizations.id, name: organizations.name, slug: organizations.slug, color: organizations.primaryColor, role: organizationMembers.role })
    .from(organizationMembers).innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id)).where(eq(organizationMembers.userId, session.user.id));
  return <main className="admin-page">
    <header className="admin-header"><Link className="platform-brand" href="/"><span>C</span> CLOSEOUT</Link><div><span>{session.user.email}</span><SignOutButton /></div></header>
    <section className="admin-intro"><p className="eyebrow">Workspace settings</p><h1>Your organizations</h1><p>Each client has isolated locations, staff, checklist templates, branding, and a separate Square authorization.</p></section>
    <div className="admin-grid">
      <section className="admin-card"><h2>Organizations</h2>{memberships.length ? <div className="organization-list">{memberships.map((item) => <article key={item.id} style={{ borderLeftColor: item.color }}><div><strong>{item.name}</strong><small>{item.slug} · {item.role}</small></div><nav><a href={`/admin/organizations/${item.id}/template`}>Customize</a><a href={`/api/square/connect?organizationId=${item.id}`}>Connect Square</a></nav></article>)}</div> : <p className="empty-copy">Create your first client workspace to begin.</p>}</section>
      <section className="admin-card"><p className="eyebrow">New client</p><h2>Create organization</h2><form className="workspace-form" action={createOrganization}>
        <label><span>Business name</span><input name="name" required placeholder="Spike’s Coffee & Tea" /></label>
        <label><span>Workspace URL</span><div className="slug-input"><span>closeout.app/</span><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="spikes-coffee" /></div></label>
        <label><span>Timezone</span><select name="timezone" defaultValue="America/Los_Angeles"><option>America/Los_Angeles</option><option>America/Denver</option><option>America/Chicago</option><option>America/New_York</option></select></label>
        <label><span>Brand color</span><input name="primaryColor" type="color" defaultValue="#e84d25" /></label>
        <button className="primary-button" type="submit">Create organization</button>
      </form></section>
    </div>
  </main>;
}
