import "server-only";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const deployedOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const authOrigin = process.env.BETTER_AUTH_URL || deployedOrigin || "http://localhost:3001";

export const auth = betterAuth({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Closeout",
  baseURL: authOrigin,
  secret: process.env.BETTER_AUTH_SECRET || "local-only-change-before-deploying",
  database: pool,
  emailAndPassword: { enabled: true, autoSignIn: true, requireEmailVerification: false },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, prompt: "select_account" },
  } : {},
  trustedOrigins: [...new Set([
    authOrigin,
    "http://localhost:3001",
    ...(process.env.AUTH_TRUSTED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean),
  ])],
});
