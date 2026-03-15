"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  File,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function DiffViewer({ patch, filename }: { patch: string; filename: string }) {
  const lines = patch.split("\n");
  const extension = filename.split(".").pop() ?? "";

  return (
    <div className="overflow-x-auto text-xs">
      <table className="w-full border-collapse font-mono">
        <tbody>
          {lines.map((line, i) => {
            const isAddition = line.startsWith("+") && !line.startsWith("+++");
            const isDeletion = line.startsWith("-") && !line.startsWith("---");
            const isHunk = line.startsWith("@@");
            const isHeader = line.startsWith("+++") || line.startsWith("---");

            return (
              <tr
                key={i}
                className={cn(
                  isAddition && "bg-emerald-500/10",
                  isDeletion && "bg-red-500/10",
                  isHunk && "bg-blue-500/10",
                )}
              >
                <td className="w-4 select-none border-r border-border px-2 py-0.5 text-right text-muted-foreground">
                  {!isHunk && !isHeader && (
                    <span
                      className={cn(
                        isAddition && "text-emerald-600 dark:text-emerald-400",
                        isDeletion && "text-red-600 dark:text-red-400",
                      )}
                    >
                      {isAddition ? "+" : isDeletion ? "-" : " "}
                    </span>
                  )}
                </td>
                <td
                  className={cn(
                    "whitespace-pre px-3 py-0.5",
                    isAddition && "text-emerald-700 dark:text-emerald-300",
                    isDeletion && "text-red-700 dark:text-red-300",
                    isHunk && "text-blue-600 dark:text-blue-400",
                    isHeader && "text-muted-foreground",
                  )}
                >
                  {line}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FileCard({
  file,
  defaultExpanded,
}: {
  file: FileChange;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const statusColors: Record<string, string> = {
    added: "text-emerald-600 dark:text-emerald-400",
    removed: "text-red-600 dark:text-red-400",
    modified: "text-amber-600 dark:text-amber-400",
    renamed: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <File className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {file.filename}
        </span>
        <span
          className={cn(
            "shrink-0 text-xs font-medium",
            statusColors[file.status] ?? "text-muted-foreground",
          )}
        >
          {file.status}
        </span>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          {file.additions > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <Plus className="size-3" />
              {file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
              <Minus className="size-3" />
              {file.deletions}
            </span>
          )}
        </div>
      </button>
      {expanded && file.patch && (
        <div className="border-t border-border">
          <DiffViewer patch={file.patch} filename={file.filename} />
        </div>
      )}
      {expanded && !file.patch && (
        <div className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Archivo binario o demasiado grande para mostrar diff
        </div>
      )}
    </div>
  );
}

export default function PullDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const pullNumber = params.pull_number as string;

  const [pull, setPull] = useState<PullDetail | null>(null);
  const [files, setFiles] = useState<FileChange[]>([]);
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
                    isOpen && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    isMerged && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                    isClosed && "bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {isOpen ? "Open" : isMerged ? "Merged" : "Closed"}
                </span>
                {pull.draft && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">Draft</span>
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
          <code className="rounded bg-muted px-2 py-0.5 text-xs">{pull.head.ref}</code>
          <span className="text-muted-foreground">→</span>
          <code className="rounded bg-muted px-2 py-0.5 text-xs">{pull.base.ref}</code>
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
          <h2 className="text-sm font-semibold">Descripción</h2>
          <div className="prose prose-sm dark:prose-invert mt-3 max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {pull.body}
            </pre>
          </div>
        </div>
      )}

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
              <FileCard key={file.filename} file={file} defaultExpanded={i < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
