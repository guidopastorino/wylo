"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  File,
  GitCommit,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommitDetail = {
  sha: string;
  message: string;
  htmlUrl: string;
  authorName: string | null;
  authorEmail: string | null;
  authorDate: string | null;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  committerName: string | null;
  committerDate: string | null;
  stats: { additions: number; deletions: number; total: number };
  parents: { sha: string; htmlUrl: string }[];
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

function DiffViewer({ patch }: { patch: string }) {
  const lines = patch.split("\n");

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
          <DiffViewer patch={file.patch} />
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

export default function CommitDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const sha = params.sha as string;

  const [commit, setCommit] = useState<CommitDetail | null>(null);
  const [files, setFiles] = useState<FileChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/github/repos/${owner}/${repo}/commits/${sha}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load commit");
        return res.json();
      })
      .then((data: { commit: CommitDetail; files: FileChange[] }) => {
        setCommit(data.commit);
        setFiles(data.files);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [owner, repo, sha]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (error || !commit) {
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
          <p className="font-medium">{error ?? "Commit no encontrado"}</p>
        </div>
      </div>
    );
  }

  const messageLines = commit.message.split("\n");
  const title = messageLines[0];
  const body = messageLines.slice(1).join("\n").trim();

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
            <GitCommit className="mt-1 size-6 shrink-0 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {commit.authorAvatarUrl && (
                  <Image
                    src={commit.authorAvatarUrl}
                    alt={commit.authorLogin ?? ""}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span>{commit.authorLogin ?? commit.authorName ?? "—"}</span>
                <span>·</span>
                <span>{commit.authorDate ? formatTimeAgo(commit.authorDate) : "—"}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={commit.htmlUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Ver en GitHub
            </a>
          </Button>
        </div>

        {/* SHA */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Commit:</span>
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
            {commit.sha}
          </code>
        </div>

        {/* Parents */}
        {commit.parents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {commit.parents.length === 1 ? "Parent:" : "Parents:"}
            </span>
            {commit.parents.map((p) => (
              <Link
                key={p.sha}
                href={`/repositories/${owner}/${repo}/commits/${p.sha}`}
                className="rounded bg-muted px-2 py-0.5 font-mono text-xs hover:bg-muted/80"
              >
                {p.sha.slice(0, 7)}
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Archivos:</span>
            <span className="font-medium">{files.length}</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Plus className="size-4" />
            <span className="font-medium">{commit.stats.additions}</span>
          </span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <Minus className="size-4" />
            <span className="font-medium">{commit.stats.deletions}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      {body && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Descripción</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {body}
          </pre>
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
