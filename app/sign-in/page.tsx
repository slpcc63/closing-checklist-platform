import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return <main className="auth-page">
    <section className="auth-story">
      <Link className="platform-brand" href="/"><span>C</span> CLOSEOUT</Link>
      <div><p className="eyebrow">Operations that finish well</p><h1>Every close accounted for.</h1><p>Build checklists for every location, document exceptions, and safely connect completion to Square timecards.</p></div>
      <small>Designed for multi-location teams · Powered by Square APIs</small>
    </section>
    <section className="auth-panel"><div><p className="eyebrow">Welcome</p><h2>Access your workspace</h2><p>Managers create a workspace. Employees join through an invitation from their organization.</p><AuthForm /></div></section>
  </main>;
}
