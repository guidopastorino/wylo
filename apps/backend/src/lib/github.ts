import { and, eq } from "drizzle-orm";
import { Octokit } from "@octokit/rest";
import { account } from "../db/schemas/auth-schema";
import { db } from "../db/db";

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
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, "github"),
      ),
    )
    .limit(1);
  const row = rows[0];
  return row?.accessToken ?? null;
}
