import { Octokit } from "@octokit/rest";
import { and, eq } from "drizzle-orm";
import type { db } from "../db/db";
import { account } from "../db/schemas/auth-schema";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function getGitHubAccessToken(
  dbInstance: typeof db,
  userId: string,
): Promise<string | null> {
  const rows = await dbInstance
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);
  const row = rows[0];
  return row?.accessToken ?? null;
}
