"use client";

import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  File,
  Folder,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Loader2,
  Lock,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";

type RepoInfo = {
  id: number;
  fullName: string;
  name: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  owner: { login: string; avatarUrl: string };
};

type Commit = {
  sha: string;
  message: string;
  authorName: string | null;
  authorDate: string | null;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  htmlUrl: string;
};

type Pull = {
  id: number;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  user: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  draft: boolean;
};

type ContentItem = {
  name: string;
  path: string;
  type: string;
  size: number;
  sha: string;
  htmlUrl: string;
};

type FileContent = {
  name: string;
  path: string;
  size: number;
  sha: string;
  htmlUrl: string;
  content: string | null;
};

type Tab = "overview" | "commits" | "pulls" | "code";

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function RepoDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commitsCount, setCommitsCount] = useState(0);
  const [pullsCount, setPullsCount] = useState(0);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/github/repos/${owner}/${repo}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load repo");
        return res.json();
      })
      .then(
        (data: {
          repo: RepoInfo;
          commitsCount?: number;
          pullsCount?: number;
        }) => {
          setRepoInfo(data.repo);
          setCommitsCount(data.commitsCount ?? 0);
          setPullsCount(data.pullsCount ?? 0);
        },
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  useEffect(() => {
    if (activeTab === "commits" && commits.length === 0) {
      setTabLoading(true);
      fetch(`/api/github/repos/${owner}/${repo}/commits`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: { commits: Commit[] }) => setCommits(data.commits ?? []))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, owner, repo, commits.length]);

  useEffect(() => {
    if (activeTab === "pulls" && pulls.length === 0) {
      setTabLoading(true);
      fetch(`/api/github/repos/${owner}/${repo}/pulls`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: { pulls: Pull[] }) => setPulls(data.pulls ?? []))
        .catch(() => {})
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, owner, repo, pulls.length]);

  useEffect(() => {
    if (activeTab === "code") {
      setTabLoading(true);
      setFileContent(null);
      setReadmeContent(null);
      fetch(
        `/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(currentPath)}`,
        { credentials: "include" },
      )
        .then((res) => res.json())
        .then(
          async (data: {
            type: string;
            items?: ContentItem[];
            file?: FileContent;
          }) => {
            if (data.type === "dir") {
              setContents(data.items ?? []);
              setFileContent(null);

              // Check for README file
              const readmeFile = data.items?.find(
                (item) =>
                  item.type === "file" && /^readme\.md$/i.test(item.name),
              );
              if (readmeFile) {
                const readmePath = currentPath
                  ? `${currentPath}/${readmeFile.name}`
                  : readmeFile.name;
                try {
                  const readmeRes = await fetch(
                    `/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(readmePath)}`,
                    { credentials: "include" },
                  );
                  const readmeData = await readmeRes.json();
                  if (readmeData.type === "file" && readmeData.file?.content) {
                    setReadmeContent(readmeData.file.content);
                  }
                } catch {
                  // Ignore readme fetch errors
                }
              }
            } else if (data.type === "file" && data.file) {
              setFileContent(data.file);
              setContents([]);
            }
          },
        )
        .catch(() => {})
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, owner, repo, currentPath]);

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !repoInfo) {
    return (
      <div className="space-y-4">
        <Link
          href="/repositories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a repositorios
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">{error ?? "Repo no encontrado"}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: GitBranch },
    { id: "commits", label: "Commits", icon: GitCommit },
    { id: "pulls", label: "Pull Requests", icon: GitPullRequest },
    { id: "code", label: "Código", icon: File },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/repositories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a repositorios
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Image
              src={repoInfo.owner.avatarUrl}
              alt={repoInfo.owner.login}
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{repoInfo.fullName}</h1>
                {repoInfo.private && (
                  <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    Privado
                  </span>
                )}
              </div>
              {repoInfo.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {repoInfo.description}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href={repoInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              Ver en GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
            {tab.id === "commits" && commitsCount > 0 && (
              <span className="text-muted-foreground">{commitsCount}</span>
            )}
            {tab.id === "pulls" && pullsCount > 0 && (
              <span className="text-muted-foreground">{pullsCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold">Información</h2>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Lenguaje principal
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {repoInfo.language ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Branch por defecto
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {repoInfo.defaultBranch}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Último push
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {formatTimeAgo(repoInfo.pushedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Creado</dt>
                      <dd className="mt-1 text-sm font-medium">
                        {new Date(repoInfo.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold">Estadísticas</h2>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="size-4" />
                        Stars
                      </span>
                      <span className="font-medium">
                        {repoInfo.stargazersCount}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GitBranch className="size-4" />
                        Forks
                      </span>
                      <span className="font-medium">{repoInfo.forksCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GitPullRequest className="size-4" />
                        Issues abiertas
                      </span>
                      <span className="font-medium">
                        {repoInfo.openIssuesCount}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Commits */}
          {activeTab === "commits" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Últimos {commits.length} commits
                </p>
              </div>
              <ul className="divide-y divide-border">
                {commits.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No hay commits
                  </li>
                ) : (
                  commits.map((commit) => (
                    <li key={commit.sha} className="px-4 py-3">
                      <Link
                        href={`/repositories/${owner}/${repo}/commits/${commit.sha}`}
                        className="block hover:opacity-80"
                      >
                        <div className="flex items-start gap-3">
                          {commit.authorAvatarUrl ? (
                            <Image
                              src={commit.authorAvatarUrl}
                              alt={commit.authorLogin ?? ""}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {(commit.authorName ?? "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium">
                              {commit.message.split("\n")[0]}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {commit.authorLogin ?? commit.authorName ?? "—"} ·{" "}
                              {commit.authorDate
                                ? formatTimeAgo(commit.authorDate)
                                : "—"}
                            </p>
                          </div>
                          <code className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                            {commit.sha.slice(0, 7)}
                          </code>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* Pull Requests */}
          {activeTab === "pulls" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {pulls.length} pull requests
                </p>
              </div>
              <ul className="divide-y divide-border">
                {pulls.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No hay pull requests
                  </li>
                ) : (
                  pulls.map((pr) => (
                    <li key={pr.id} className="px-4 py-3">
                      <Link
                        href={`/repositories/${owner}/${repo}/pulls/${pr.number}`}
                        className="block hover:opacity-80"
                      >
                        <div className="flex items-start gap-3">
                          <GitPullRequest
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              pr.state === "open"
                                ? "text-emerald-500"
                                : pr.mergedAt
                                  ? "text-violet-500"
                                  : "text-red-500",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium">{pr.title}</p>
                              {pr.draft && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              #{pr.number} · {pr.user?.login ?? "—"} ·{" "}
                              {formatTimeAgo(pr.updatedAt)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
                              pr.state === "open"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : pr.mergedAt
                                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400",
                            )}
                          >
                            {pr.state === "open"
                              ? "Open"
                              : pr.mergedAt
                                ? "Merged"
                                : "Closed"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* Code */}
          {activeTab === "code" && (
            <div className="rounded-lg border border-border bg-card">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 border-b border-border px-4 py-2 text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentPath("")}
                  className="font-medium text-primary hover:underline"
                >
                  {repoInfo.name}
                </button>
                {currentPath?.split("/")?.map((part, i, arr) => {
                  const path = arr.slice(0, i + 1).join("/");
                  return (
                    <span key={path} className="flex items-center gap-1">
                      <ChevronRight className="size-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => navigateToPath(path)}
                        className={cn(
                          i === arr.length - 1
                            ? "text-foreground"
                            : "text-primary hover:underline",
                        )}
                      >
                        {part}
                      </button>
                    </span>
                  );
                })}
              </div>

              {fileContent ? (
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={navigateUp}>
                      <ArrowLeft className="size-4" />
                      Volver
                    </Button>
                    <a
                      href={fileContent.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver en GitHub
                    </a>
                  </div>
                  {fileContent.content ? (
                    <CodeBlock
                      code={fileContent.content}
                      filename={fileContent.path}
                      maxHeight="none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Archivo demasiado grande para mostrar (
                      {Math.round(fileContent.size / 1024)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-border">
                    {currentPath && (
                      <li>
                        <button
                          type="button"
                          onClick={navigateUp}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 cursor-pointer"
                        >
                          <Folder className="size-4 text-muted-foreground" />
                          <span>..</span>
                        </button>
                      </li>
                    )}
                    {contents.length === 0 && !currentPath ? (
                      <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No hay archivos
                      </li>
                    ) : (
                      [...contents]
                        .sort((a, b) => {
                          if (a.type === "dir" && b.type !== "dir") return -1;
                          if (a.type !== "dir" && b.type === "dir") return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((item) => (
                          <li key={item.path}>
                            <button
                              type="button"
                              onClick={() => navigateToPath(item.path)}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 cursor-pointer"
                            >
                              {item.type === "dir" ? (
                                <Folder className="size-4 text-blue-500" />
                              ) : (
                                <File className="size-4 text-muted-foreground" />
                              )}
                              <span>{item.name}</span>
                            </button>
                          </li>
                        ))
                    )}
                  </ul>

                  {/* README preview */}
                  {readmeContent && (
                    <div className="border-t border-border">
                      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
                        <File className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">README.md</span>
                      </div>
                      <div className="p-6">
                        <MarkdownContent content={readmeContent} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
