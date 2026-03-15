import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/db";
import { account } from "../db/schemas/auth-schema";
import { auth } from "../lib/auth";

function requestHeaders(req: Request): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined || v === "") continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined) h.set(k, val);
  }
  return h;
}

export async function handleGetAccounts(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const rows = await db
      .select({ providerId: account.providerId })
      .from(account)
      .where(eq(account.userId, session.user.id));
    res.json({
      accounts: rows.map((r) => ({ providerId: r.providerId })),
    });
  } catch (err) {
    console.error("Get accounts error:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}
