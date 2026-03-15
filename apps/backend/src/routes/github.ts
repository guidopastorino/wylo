import type { Request, Response } from "express";
import { db } from "../db/db";
import { auth } from "../lib/auth";
import {
  addConnectedRepo,
  getConnectedRepos,
  removeConnectedRepo,
} from "../lib/connected-repos";
import { createOctokit, getGitHubAccessToken } from "../lib/github";

function requestHeaders(req: Request): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined || v === "") continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined) h.set(k, val);
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
      repos: data.map(
        (r: {
          id: number;
          full_name: string;
          name: string;
          private: boolean;
          description: string | null;
          updated_at: string | null;
        }) => ({
          id: r.id,
          fullName: r.full_name,
          name: r.name,
          private: r.private,
          description: r.description,
          updatedAt: r.updated_at,
        }),
      ),
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
    const pulls = data.items.map(
      (pr: {
        id: number;
        number: number;
        title: string;
        state: string;
        html_url: string;
        body?: string | null;
        user?: { login: string; avatar_url: string } | null;
        created_at: string;
        updated_at: string;
        repository_url: string;
      }) => ({
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
      }),
    );
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
  if (
    !repoFullName ||
    typeof repoFullName !== "string" ||
    !repoFullName.includes("/")
  ) {
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
  if (
    !repoFullName ||
    typeof repoFullName !== "string" ||
    !repoFullName.includes("/")
  ) {
    res
      .status(400)
      .json({ error: "repoFullName query required (e.g. owner/repo)" });
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

    const reviewsPendingQ =
      repoQuery.length > 0
        ? `type:pr state:open review-requested:${login} ${repoQuery}`
        : `type:pr state:open review-requested:${login}`;

    const mergedQ =
      repoQuery.length > 0
        ? `type:pr is:merged author:${login} ${repoQuery}`
        : `type:pr is:merged author:${login}`;

    const [reposRes, myPullsRes, reviewsPendingRes, mergedRes] =
      await Promise.all([
        octokit.rest.repos.listForAuthenticatedUser({
          sort: "updated",
          per_page: 100,
        }),
        octokit.rest.search.issuesAndPullRequests({
          q: searchQ,
          sort: "updated",
          per_page: 30,
        }),
        octokit.rest.search.issuesAndPullRequests({
          q: reviewsPendingQ,
          sort: "updated",
          per_page: 20,
        }),
        octokit.rest.search.issuesAndPullRequests({
          q: mergedQ,
          sort: "updated",
          per_page: 30,
        }),
      ]);

    const allRepos = reposRes.data.map(
      (r: {
        id: number;
        full_name: string;
        name: string;
        private: boolean;
      }) => ({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        private: r.private,
      }),
    );

    const repos =
      connectedRepos.length > 0
        ? allRepos.filter((r: { fullName: string }) =>
            connectedRepos.includes(r.fullName),
          )
        : allRepos.slice(0, 20);

    type PrItem = {
      id: number;
      number: number;
      title: string;
      state: string;
      html_url: string;
      user: { login: string; avatar_url: string } | null;
      updated_at: string;
      repository_url: string;
    };
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

    const activity = myPulls
      .slice(0, 10)
      .map(
        (pr: {
          title: string;
          repoFullName: string;
          number: number;
          user: { login: string; avatarUrl: string } | null;
          updatedAt: string;
          htmlUrl: string;
        }) => ({
          type: "pull_request" as const,
          title: pr.title,
          repoFullName: pr.repoFullName,
          number: pr.number,
          user: pr.user?.login ?? "unknown",
          avatarUrl: pr.user?.avatarUrl ?? null,
          updatedAt: pr.updatedAt,
          htmlUrl: pr.htmlUrl,
        }),
      );

    type MergedItem = { created_at: string; closed_at: string | null };
    const mergedItems = mergedRes.data.items as MergedItem[];
    const mergeTimes = mergedItems
      .filter(
        (m): m is MergedItem & { closed_at: string } => m.closed_at != null,
      )
      .map(
        (m) =>
          (new Date(m.closed_at).getTime() - new Date(m.created_at).getTime()) /
          (1000 * 60 * 60),
      );
    const avgTimeToMergeHours =
      mergeTimes.length > 0
        ? Math.round(
            (mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length) * 10,
          ) / 10
        : null;

    type ReviewPrItem = {
      id: number;
      number: number;
      title: string;
      html_url: string;
      user: { login: string; avatar_url: string } | null;
      updated_at: string;
      repository_url: string;
    };
    const reviewsPending = (reviewsPendingRes.data.items as ReviewPrItem[]).map(
      (pr) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        htmlUrl: pr.html_url,
        user: pr.user
          ? { login: pr.user.login, avatarUrl: pr.user.avatar_url }
          : null,
        updatedAt: pr.updated_at,
        repoFullName: pr.repository_url.split("/").slice(-2).join("/"),
      }),
    );

    res.json({
      repos,
      connectedRepos,
      pulls: myPulls,
      reviewsPending,
      metrics: {
        myOpenPulls: myPulls.length,
        reviewsPendingCount: reviewsPending.length,
        avgTimeToMergeHours,
      },
      activity,
    });
  } catch (err) {
    console.error("GitHub dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}

export async function handleGetRepoDetail(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo } = req.params;
  if (!owner || !repo) {
    res.status(400).json({ error: "owner and repo params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    res.json({
      repo: {
        id: repoData.id,
        fullName: repoData.full_name,
        name: repoData.name,
        description: repoData.description,
        private: repoData.private,
        htmlUrl: repoData.html_url,
        homepage: repoData.homepage,
        language: repoData.language,
        stargazersCount: repoData.stargazers_count,
        forksCount: repoData.forks_count,
        openIssuesCount: repoData.open_issues_count,
        defaultBranch: repoData.default_branch,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        owner: {
          login: repoData.owner.login,
          avatarUrl: repoData.owner.avatar_url,
        },
      },
    });
  } catch (err) {
    console.error("Repo detail error:", err);
    res.status(500).json({ error: "Failed to fetch repo details" });
  }
}

export async function handleGetRepoCommits(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo } = req.params;
  if (!owner || !repo) {
    res.status(400).json({ error: "owner and repo params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 30,
    });

    type CommitItem = {
      sha: string;
      commit: {
        message: string;
        author: { name: string; date: string } | null;
      };
      author: { login: string; avatar_url: string } | null;
      html_url: string;
    };

    const commits = (data as CommitItem[]).map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author?.name ?? null,
      authorDate: c.commit.author?.date ?? null,
      authorLogin: c.author?.login ?? null,
      authorAvatarUrl: c.author?.avatar_url ?? null,
      htmlUrl: c.html_url,
    }));

    res.json({ commits });
  } catch (err) {
    console.error("Repo commits error:", err);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
}

export async function handleGetCommitDetail(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo, sha } = req.params;
  if (!owner || !repo || !sha) {
    res.status(400).json({ error: "owner, repo, and sha params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: sha,
    });

    const files = (data.files ?? []).map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch ?? null,
      blobUrl: f.blob_url,
      rawUrl: f.raw_url,
    }));

    res.json({
      commit: {
        sha: data.sha,
        message: data.commit.message,
        htmlUrl: data.html_url,
        authorName: data.commit.author?.name ?? null,
        authorEmail: data.commit.author?.email ?? null,
        authorDate: data.commit.author?.date ?? null,
        authorLogin: data.author?.login ?? null,
        authorAvatarUrl: data.author?.avatar_url ?? null,
        committerName: data.commit.committer?.name ?? null,
        committerDate: data.commit.committer?.date ?? null,
        stats: {
          additions: data.stats?.additions ?? 0,
          deletions: data.stats?.deletions ?? 0,
          total: data.stats?.total ?? 0,
        },
        parents: data.parents.map((p) => ({ sha: p.sha, htmlUrl: p.html_url })),
      },
      files,
    });
  } catch (err) {
    console.error("Commit detail error:", err);
    res.status(500).json({ error: "Failed to fetch commit details" });
  }
}

export async function handleGetRepoPulls(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo } = req.params;
  if (!owner || !repo) {
    res.status(400).json({ error: "owner and repo params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const state = (req.query.state as "open" | "closed" | "all") || "all";
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state,
      sort: "updated",
      direction: "desc",
      per_page: 30,
    });

    type PullItem = {
      id: number;
      number: number;
      title: string;
      state: string;
      html_url: string;
      user: { login: string; avatar_url: string } | null;
      created_at: string;
      updated_at: string;
      merged_at: string | null;
      draft: boolean;
    };

    const pulls = (data as PullItem[]).map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      htmlUrl: pr.html_url,
      user: pr.user
        ? { login: pr.user.login, avatarUrl: pr.user.avatar_url }
        : null,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      draft: pr.draft,
    }));

    res.json({ pulls });
  } catch (err) {
    console.error("Repo pulls error:", err);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
}

export async function handleGetPullDetail(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo, pull_number } = req.params;
  if (!owner || !repo || !pull_number) {
    res
      .status(400)
      .json({ error: "owner, repo, and pull_number params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const [prRes, filesRes] = await Promise.all([
      octokit.rest.pulls.get({ owner, repo, pull_number: Number(pull_number) }),
      octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: Number(pull_number),
        per_page: 100,
      }),
    ]);

    const pr = prRes.data;
    const files = filesRes.data.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch ?? null,
      blobUrl: f.blob_url,
      rawUrl: f.raw_url,
    }));

    res.json({
      pull: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        htmlUrl: pr.html_url,
        diffUrl: pr.diff_url,
        user: pr.user
          ? { login: pr.user.login, avatarUrl: pr.user.avatar_url }
          : null,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        mergedAt: pr.merged_at,
        closedAt: pr.closed_at,
        draft: pr.draft,
        mergeable: pr.mergeable,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        commits: pr.commits,
        head: { ref: pr.head.ref, sha: pr.head.sha },
        base: { ref: pr.base.ref, sha: pr.base.sha },
      },
      files,
    });
  } catch (err) {
    console.error("Pull detail error:", err);
    res.status(500).json({ error: "Failed to fetch pull request details" });
  }
}

export async function handleGetRepoContents(req: Request, res: Response) {
  const session = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { owner, repo } = req.params;
  const path = (req.query.path as string) || "";
  if (!owner || !repo) {
    res.status(400).json({ error: "owner and repo params required" });
    return;
  }
  const token = await getGitHubAccessToken(db, session.user.id);
  if (!token) {
    res.status(403).json({ error: "GitHub not connected" });
    return;
  }
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

    if (Array.isArray(data)) {
      type ContentItem = {
        name: string;
        path: string;
        type: string;
        size: number;
        sha: string;
        html_url: string;
      };
      const items = (data as ContentItem[]).map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        htmlUrl: item.html_url,
      }));
      res.json({ type: "dir", items });
    } else {
      const file = data as {
        name: string;
        path: string;
        type: string;
        size: number;
        sha: string;
        html_url: string;
        content?: string;
        encoding?: string;
      };
      let content: string | null = null;
      if (file.content && file.encoding === "base64") {
        content = Buffer.from(file.content, "base64").toString("utf-8");
      }
      res.json({
        type: "file",
        file: {
          name: file.name,
          path: file.path,
          size: file.size,
          sha: file.sha,
          htmlUrl: file.html_url,
          content,
        },
      });
    }
  } catch (err) {
    console.error("Repo contents error:", err);
    res.status(500).json({ error: "Failed to fetch contents" });
  }
}
