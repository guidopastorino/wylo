import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db/db";
import * as schema from "../db/schemas/auth-schema";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Wylo API",
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.FRONTEND_URL!,
  trustedOrigins: [
    process.env.FRONTEND_URL!,
    "wylo://",
    "wylo://*",
    ...(isProduction
      ? []
      : [
          "exp://",
          "exp://**",
          "exp://192.168.*.*:*/**",
          "exp://10.*.*.*:*/**",
          "https://*.ngrok.io",
          "https://*.ngrok-free.app",
        ]),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
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