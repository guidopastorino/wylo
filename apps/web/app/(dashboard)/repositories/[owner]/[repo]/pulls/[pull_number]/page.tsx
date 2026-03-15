"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDiffCard } from "@/components/ui/diff-viewer";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";

type PullDetail = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  htmlUrl: string;
  diffUrl: string;
  user: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  draft: boolean;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
};

type FileChange = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
  blobUrl: string;
  rawUrl: string;
};

type PrCommit = {
  sha: string;
  message: string;
  authorName: string | null;
  authorDate: string | null;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  htmlUrl: string;
};

type CommitDetail = {
  sha: string;
  message: string;
  htmlUrl: string;
  authorName: string | null;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  authorDate: string | null;
  stats: { additions: number; deletions: number; total: number };
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function PullDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const pullNumber = params.pull_number as string;

  const [pull, setPull] = useState<PullDetail | null>(null);
  const [files, setFiles] = useState<FileChange[]>([]);
  const [commits, setCommits] = useState<PrCommit[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(
    null,
  );
  const [commitDetail, setCommitDetail] = useState<{
    commit: CommitDetail;
    files: FileChange[];
  } | null>(null);
  const [commitDetailLoading, setCommitDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/github/repos/${owner}/${repo}/pulls/${pullNumber}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load PR");
        return res.json();
      })
      .then((data: { pull: PullDetail; files: FileChange[] }) => {
        setPull(data.pull);
        setFiles(data.files);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [owner, repo, pullNumber]);

  useEffect(() => {
    if (!owner || !repo || !pullNumber) return;
    setCommitsLoading(true);
    fetch(`/api/github/repos/${owner}/${repo}/pulls/${pullNumber}/commits`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { commits: [] }))
      .then((data: { commits?: PrCommit[] }) => setCommits(data?.commits ?? []))
      .catch(() => setCommits([]))
      .finally(() => setCommitsLoading(false));
  }, [owner, repo, pullNumber]);

  const fetchCommitDetail = useCallback(
    (sha: string) => {
      if (selectedCommitSha === sha && commitDetail?.commit.sha === sha) {
        setSelectedCommitSha(null);
        setCommitDetail(null);
        return;
      }
      setSelectedCommitSha(sha);
      setCommitDetailLoading(true);
      setCommitDetail(null);
      fetch(`/api/github/repos/${owner}/${repo}/commits/${sha}`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            data: {
              commit: CommitDetail;
              files: FileChange[];
            } | null,
          ) => {
            if (data && data.commit.sha === sha) setCommitDetail(data);
          },
        )
        .catch(() => setCommitDetail(null))
        .finally(() => setCommitDetailLoading(false));
    },
    [owner, repo, selectedCommitSha, commitDetail?.commit.sha],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !pull) {
    return (
      <div className="space-y-4">
        <Link
          href={`/repositories/${owner}/${repo}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al repositorio
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">{error ?? "PR no encontrado"}</p>
        </div>
      </div>
    );
  }

  const isMerged = !!pull.mergedAt;
  const isClosed = pull.state === "closed" && !isMerged;
  const isOpen = pull.state === "open";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/repositories/${owner}/${repo}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a {owner}/{repo}
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {isMerged ? (
              <GitMerge className="mt-1 size-6 shrink-0 text-violet-500" />
            ) : (
              <GitPullRequest
                className={cn(
                  "mt-1 size-6 shrink-0",
                  isOpen ? "text-emerald-500" : "text-red-500",
                )}
              />
            )}
            <div>
              <h1 className="text-xl font-semibold">{pull.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-medium",
                    isOpen &&
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    isMerged &&
                      "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                    isClosed && "bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {isOpen ? "Open" : isMerged ? "Merged" : "Closed"}
                </span>
                {pull.draft && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">
                    Draft
                  </span>
                )}
                <span>#{pull.number}</span>
                <span>·</span>
                {pull.user && (
                  <>
                    <Image
                      src={pull.user.avatarUrl}
                      alt={pull.user.login}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span>{pull.user.login}</span>
                    <span>·</span>
                  </>
                )}
                <span>{formatTimeAgo(pull.createdAt)}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={pull.htmlUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Ver en GitHub
            </a>
          </Button>
        </div>

        {/* Branch info */}
        <div className="flex items-center gap-2 text-sm">
          <GitBranch className="size-4 text-muted-foreground" />
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
            {pull.head.ref}
          </code>
          <span className="text-muted-foreground">→</span>
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
            {pull.base.ref}
          </code>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Commits:</span>
            <span className="font-medium">{pull.commits}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Archivos:</span>
            <span className="font-medium">{pull.changedFiles}</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Plus className="size-4" />
            <span className="font-medium">{pull.additions}</span>
          </span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <Minus className="size-4" />
            <span className="font-medium">{pull.deletions}</span>
          </span>
        </div>
      </div>

      {/* Description */}
      {pull.body && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Descripción</h2>
          <MarkdownContent content={pull.body} />
        </div>
      )}

      {/* Commits */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <GitCommit className="size-4" />
          Commits ({commits.length})
        </h2>
        {commitsLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando commits…
          </div>
        ) : commits.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No hay commits
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {commits.map((c) => {
                const isSelected = selectedCommitSha === c.sha;
                const firstLine =
                  c.message.split("\n")[0].slice(0, 72) +
                  (c.message.split("\n")[0].length > 72 ? "…" : "");
                return (
                  <li key={c.sha}>
                    <button
                      type="button"
                      onClick={() => fetchCommitDetail(c.sha)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        isSelected && "bg-muted/70",
                      )}
                    >
                      <span className="shrink-0 text-muted-foreground">
                        {isSelected ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </span>
                      <code className="shrink-0 font-mono text-xs text-muted-foreground">
                        {c.sha.slice(0, 7)}
                      </code>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {firstLine}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {c.authorAvatarUrl && (
                          <Image
                            src={c.authorAvatarUrl}
                            alt={c.authorLogin ?? ""}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        {c.authorLogin ?? c.authorName ?? "—"}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTimeAgo(c.authorDate ?? c.sha)}
                      </span>
                    </button>
                    {isSelected && (
                      <div className="border-t border-border bg-muted/30 px-4 py-4">
                        {commitDetailLoading ||
                        commitDetail?.commit.sha !== c.sha ? (
                          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Cargando archivos del commit…
                          </div>
                        ) : commitDetail?.files &&
                          commitDetail.files.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Archivos en este commit (
                              {commitDetail.files.length})
                            </p>
                            {commitDetail.files.map((file, i) => (
                              <FileDiffCard
                                key={file.filename}
                                file={file}
                                defaultExpanded={i < 2}
                              />
                            ))}
                            <a
                              href={commitDetail.commit.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="size-4" />
                              Ver commit en GitHub
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sin archivos o no se pudieron cargar.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Files changed */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">
          Archivos modificados ({files.length})
        </h2>
        {files.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No hay archivos modificados
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, i) => (
              <FileDiffCard
                key={file.filename}
                file={file}
                defaultExpanded={i < 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
