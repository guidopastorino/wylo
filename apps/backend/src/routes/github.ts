import type { Request, Response } from "express";
import { auth } from "../lib/auth";
import { db } from "../db/db";
import {
  addConnectedRepo,
  getConnectedRepos,
  removeConnectedRepo,
} from "../lib/connected-repos";
import {
  createOctokit,
  getGitHubAccessToken,
} from "../lib/github";

function requestHeaders(req: Request): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined && v !== "") h.set(k, Array.isArray(v) ? v[0]! : v);
  }
  return h;
}

export async function handleGetRepos(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 30,
    });
    res.json({
      repos: data.map((r: { id: number; full_name: string; name: string; private: boolean; description: string | null; updated_at: string | null }) => ({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        private: r.private,
        description: r.description,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    console.error("GitHub repos error:", err);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
}

export async function handleGetPulls(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const login = user.login;
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: `type:pr state:open author:${login}`,
      sort: "updated",
      per_page: 20,
    });
    const pulls = data.items.map((pr: { id: number; number: number; title: string; state: string; html_url: string; body?: string | null; user?: { login: string; avatar_url: string } | null; created_at: string; updated_at: string; repository_url: string }) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      htmlUrl: pr.html_url,
      body: pr.body,
      user: pr.user
        ? { login: pr.user.login, avatarUrl: pr.user.avatar_url }
        : null,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      repoFullName: pr.repository_url.split("/").slice(-2).join("/"),
    }));
    res.json({ pulls });
  } catch (err) {
    console.error("GitHub pulls error:", err);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
}

export async function handleGetConnectedRepos(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const repoFullNames = await getConnectedRepos(db, session.user.id);
    res.json({ connectedRepos: repoFullNames });
  } catch (err) {
    console.error("Connected repos error:", err);
    res.status(500).json({ error: "Failed to fetch connected repos" });
  }
}

export async function handlePostConnectedRepo(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const repoFullName = req.body?.repoFullName as string | undefined;
  if (!repoFullName || typeof repoFullName !== "string" || !repoFullName.includes("/")) {
    res.status(400).json({ error: "repoFullName required (e.g. owner/repo)" });
    return;
  }
  try {
    await addConnectedRepo(db, session.user.id, repoFullName.trim());
    res.json({ ok: true });
  } catch (err) {
    console.error("Add connected repo error:", err);
    res.status(500).json({ error: "Failed to add repo" });
  }
}

export async function handleDeleteConnectedRepo(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const repoFullName = req.query.repoFullName as string | undefined;
  if (!repoFullName || typeof repoFullName !== "string" || !repoFullName.includes("/")) {
    res.status(400).json({ error: "repoFullName query required (e.g. owner/repo)" });
    return;
  }
  try {
    await removeConnectedRepo(db, session.user.id, repoFullName.trim());
    res.json({ ok: true });
  } catch (err) {
    console.error("Remove connected repo error:", err);
    res.status(500).json({ error: "Failed to remove repo" });
  }
}

export async function handleGetDashboard(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const connectedRepos = await getConnectedRepos(db, session.user.id);
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const login = user.login;

    const repoQuery =
      connectedRepos.length > 0
        ? connectedRepos.map((r) => `repo:${r}`).join(" ")
        : "";

    const searchQ =
      repoQuery.length > 0
        ? `type:pr state:open author:${login} ${repoQuery}`
        : `type:pr state:open author:${login}`;

    const [reposRes, myPullsRes] = await Promise.all([
      octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: searchQ,
        sort: "updated",
        per_page: 30,
      }),
    ]);

    const allRepos = reposRes.data.map((r: { id: number; full_name: string; name: string; private: boolean }) => ({
      id: r.id,
      fullName: r.full_name,
      name: r.name,
      private: r.private,
    }));

    const repos =
      connectedRepos.length > 0
        ? allRepos.filter((r: { fullName: string }) => connectedRepos.includes(r.fullName))
        : allRepos.slice(0, 20);

    type PrItem = { id: number; number: number; title: string; state: string; html_url: string; user: { login: string; avatar_url: string } | null; updated_at: string; repository_url: string };
    const myPulls = myPullsRes.data.items.map((pr: PrItem) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      htmlUrl: pr.html_url,
      user: pr.user
        ? { login: pr.user.login, avatarUrl: pr.user.avatar_url }
        : null,
      updatedAt: pr.updated_at,
      repoFullName: pr.repository_url.split("/").slice(-2).join("/"),
    }));

    const activity = myPulls.slice(0, 10).map((pr: { title: string; repoFullName: string; number: number; user: { login: string; avatarUrl: string } | null; updatedAt: string; htmlUrl: string }) => ({
      type: "pull_request" as const,
      title: pr.title,
      repoFullName: pr.repoFullName,
      number: pr.number,
      user: pr.user?.login ?? "unknown",
      avatarUrl: pr.user?.avatarUrl ?? null,
      updatedAt: pr.updatedAt,
      htmlUrl: pr.htmlUrl,
    }));

    res.json({
      repos,
      connectedRepos,
      pulls: myPulls,
      metrics: {
        myOpenPulls: myPulls.length,
      },
      activity,
    });
  } catch (err) {
    console.error("GitHub dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
