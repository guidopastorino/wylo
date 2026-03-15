"use client";

import { ChevronDown, ChevronRight, File, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

const languageMap: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  php: "php",
  sh: "bash",
  bash: "bash",
  yml: "yaml",
  yaml: "yaml",
  json: "json",
  md: "markdown",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  xml: "xml",
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return languageMap[ext] ?? "text";
}

interface DiffLine {
  type: "addition" | "deletion" | "context" | "hunk" | "header";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
  hunkInfo?: { oldStart: number; oldCount: number; newStart: number; newCount: number };
}

function parsePatch(patch: string): DiffLine[] {
  const lines = patch.split("\n");
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    // Skip "No newline at end of file" messages
    if (line.startsWith("\\ No newline") || line.startsWith("\\")) {
      continue;
    }

    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)?/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[3], 10);
        const context = match[5]?.trim() ?? "";
        const oldStart = parseInt(match[1], 10);
        const oldCount = parseInt(match[2] ?? "1", 10);
        const newStart = parseInt(match[3], 10);
        const newCount = parseInt(match[4] ?? "1", 10);
        result.push({
          type: "hunk",
          content: `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@ ${context}`,
          hunkInfo: { oldStart, oldCount, newStart, newCount },
        });
      }
    } else if (line.startsWith("+++") || line.startsWith("---")) {
      // Skip file headers, we show filename in the card header
    } else if (line.startsWith("+")) {
      result.push({
        type: "addition",
        content: line.slice(1),
        newLineNum: newLine++,
      });
    } else if (line.startsWith("-")) {
      result.push({
        type: "deletion",
        content: line.slice(1),
        oldLineNum: oldLine++,
      });
    } else {
      result.push({
        type: "context",
        content: line.startsWith(" ") ? line.slice(1) : line,
        oldLineNum: oldLine++,
        newLineNum: newLine++,
      });
    }
  }

  return result;
}

function useTheme() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface DiffViewerProps {
  patch: string;
  filename: string;
}

export function DiffViewer({ patch, filename }: DiffViewerProps) {
  const lines = parsePatch(patch);
  const language = getLanguageFromFilename(filename);
  const isDark = useTheme();

  if (isDark === null) {
    return (
      <div className="bg-muted/30 animate-pulse p-4">
        <div className="h-32" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto text-[13px]">
      <table className="w-full border-collapse font-mono">
        <tbody>
          {lines.map((line, i) => {
            if (line.type === "hunk") {
              return (
                <tr key={i} className="bg-blue-50 dark:bg-blue-950/50">
                  <td
                    colSpan={4}
                    className="px-3 py-1.5 font-mono text-xs text-blue-600 dark:text-blue-400"
                  >
                    {line.content}
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={i}
                className={cn(
                  line.type === "addition" && "bg-emerald-50 dark:bg-emerald-950/30",
                  line.type === "deletion" && "bg-red-50 dark:bg-red-950/30",
                  line.type === "context" && "bg-white dark:bg-zinc-900",
                )}
              >
                {/* Old line number */}
                <td
                  className={cn(
                    "w-12 select-none border-r px-2 py-0.5 text-right text-xs",
                    line.type === "addition" && "border-emerald-200 bg-emerald-100/50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-500",
                    line.type === "deletion" && "border-red-200 bg-red-100/50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-500",
                    line.type === "context" && "border-border/50 text-muted-foreground/60",
                  )}
                >
                  {line.type === "context" || line.type === "deletion"
                    ? line.oldLineNum
                    : ""}
                </td>
                {/* New line number */}
                <td
                  className={cn(
                    "w-12 select-none border-r px-2 py-0.5 text-right text-xs",
                    line.type === "addition" && "border-emerald-200 bg-emerald-100/50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-500",
                    line.type === "deletion" && "border-red-200 bg-red-100/50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-500",
                    line.type === "context" && "border-border/50 text-muted-foreground/60",
                  )}
                >
                  {line.type === "context" || line.type === "addition"
                    ? line.newLineNum
                    : ""}
                </td>
                {/* Sign */}
                <td
                  className={cn(
                    "w-6 select-none px-1 py-0.5 text-center font-semibold",
                    line.type === "addition" && "text-emerald-600 dark:text-emerald-400",
                    line.type === "deletion" && "text-red-600 dark:text-red-400",
                  )}
                >
                  {line.type === "addition" && "+"}
                  {line.type === "deletion" && "−"}
                </td>
                {/* Content with syntax highlighting */}
                <td className="py-0 pr-4">
                  <SyntaxHighlighter
                    language={language}
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                      margin: 0,
                      padding: "2px 0",
                      background: "transparent",
                      fontSize: "inherit",
                    }}
                    codeTagProps={{
                      style: { background: "transparent" },
                    }}
                    PreTag="span"
                    wrapLines
                    lineProps={{ style: { background: "transparent", display: "block" } }}
                  >
                    {line.content || " "}
                  </SyntaxHighlighter>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
  blobUrl: string;
  rawUrl: string;
}

interface FileDiffCardProps {
  file: FileChange;
  defaultExpanded?: boolean;
}

export function FileDiffCard({ file, defaultExpanded = false }: FileDiffCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const statusConfig: Record<string, { label: string; color: string }> = {
    added: { label: "Añadido", color: "text-emerald-600 dark:text-emerald-400" },
    removed: { label: "Eliminado", color: "text-red-600 dark:text-red-400" },
    modified: { label: "Modificado", color: "text-amber-600 dark:text-amber-400" },
    renamed: { label: "Renombrado", color: "text-blue-600 dark:text-blue-400" },
    copied: { label: "Copiado", color: "text-purple-600 dark:text-purple-400" },
  };

  const status = statusConfig[file.status] ?? { label: file.status, color: "text-muted-foreground" };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </span>
        <File className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-mono text-sm">{file.filename}</span>
        <span className={cn("shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium", status.color)}>
          {status.label}
        </span>
        <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
          {file.additions > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Plus className="size-3" />
              {file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Minus className="size-3" />
              {file.deletions}
            </span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border">
          {file.patch ? (
            <DiffViewer patch={file.patch} filename={file.filename} />
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Archivo binario o demasiado grande para mostrar diff
            </div>
          )}
        </div>
      )}
    </div>
  );
}
