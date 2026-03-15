import { and, eq } from "drizzle-orm";
import type { db } from "../db/db";
import { connectedRepo } from "../db/schemas/connected-repos-schema";

export async function getConnectedRepos(
  dbInstance: typeof db,
  userId: string,
): Promise<string[]> {
  const rows = await dbInstance
    .select({ repoFullName: connectedRepo.repoFullName })
    .from(connectedRepo)
    .where(eq(connectedRepo.userId, userId));
  return rows.map((r) => r.repoFullName);
}

export async function addConnectedRepo(
  dbInstance: typeof db,
  userId: string,
  repoFullName: string,
): Promise<void> {
  await dbInstance
    .insert(connectedRepo)
    .values({ userId, repoFullName })
    .onConflictDoNothing({
      target: [connectedRepo.userId, connectedRepo.repoFullName],
    });
}

export async function removeConnectedRepo(
  dbInstance: typeof db,
  userId: string,
  repoFullName: string,
): Promise<void> {
  await dbInstance
    .delete(connectedRepo)
    .where(
      and(
        eq(connectedRepo.userId, userId),
        eq(connectedRepo.repoFullName, repoFullName),
      ),
    );
}
