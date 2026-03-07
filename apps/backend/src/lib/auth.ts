import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as schema from "../db/schemas/auth-schema";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Wylo API",
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.FRONTEND_URL!,
  trustedOrigins: [process.env.FRONTEND_URL!],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: isProduction ? "lax" : "lax",
      secure: isProduction,
      httpOnly: true,
      path: "/",
    },
  },
});