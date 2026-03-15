import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as schema from "../db/schemas/auth-schema";
import { getEnv, getEnvOptional } from "./env";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Wylo API",
  secret: getEnv("BETTER_AUTH_SECRET"),
  baseURL: getEnv("FRONTEND_URL"),
  trustedOrigins: [
    getEnv("FRONTEND_URL"),
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
    vercel: {
      clientId: getEnvOptional("VERCEL_CLIENT_ID"),
      clientSecret: getEnvOptional("VERCEL_CLIENT_SECRET"),
    },
    github: {
      clientId: getEnvOptional("GITHUB_CLIENT_ID"),
      clientSecret: getEnvOptional("GITHUB_CLIENT_SECRET"),
      scope: [
        "user:email", // required by Better Auth for email
        "read:user", // profile (name, avatar)
        "repo", // full repo access: PRs, commits, code, issues
        "read:org", // list repos in orgs the user belongs to
        "workflow", // read GitHub Actions status (e.g. CI on PRs)
      ],
    },
    slack: {
      clientId: getEnvOptional("SLACK_CLIENT_ID"),
      clientSecret: getEnvOptional("SLACK_CLIENT_SECRET"),
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
