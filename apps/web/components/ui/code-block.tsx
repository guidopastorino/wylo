"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
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
  zsh: "bash",
  yml: "yaml",
  yaml: "yaml",
  json: "json",
  md: "markdown",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  less: "less",
  xml: "xml",
  dockerfile: "docker",
  makefile: "makefile",
  toml: "toml",
  ini: "ini",
  env: "bash",
  gitignore: "git",
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const basename = filename.split("/").pop()?.toLowerCase() ?? "";

  if (basename === "dockerfile") return "docker";
  if (basename === "makefile") return "makefile";
  if (basename.startsWith(".env")) return "bash";

  return languageMap[ext] ?? "text";
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

interface CodeBlockProps {
  code: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export function CodeBlock({
  code,
  filename,
  language,
  showLineNumbers = true,
  maxHeight = "60vh",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const isDark = useTheme();
  const lang =
    language ?? (filename ? getLanguageFromFilename(filename) : "text");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't render until we know the theme to avoid flash
  if (isDark === null) {
    return (
      <div
        className={cn(
          "relative rounded-lg border border-border overflow-hidden bg-muted animate-pulse",
          className,
        )}
      >
        {filename && (
          <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted">
            <span className="text-xs font-medium text-muted-foreground">
              {filename}
            </span>
          </div>
        )}
        <div style={{ maxHeight }} className="overflow-auto p-4">
          <div className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border overflow-hidden",
        isDark ? "bg-zinc-900" : "bg-zinc-50",
        className,
      )}
    >
      {filename && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-border px-4 py-2",
            isDark ? "bg-zinc-800" : "bg-zinc-100",
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {filename}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
              isDark
                ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900",
            )}
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>
      )}
      <div style={{ maxHeight }} className="overflow-auto">
        <SyntaxHighlighter
          language={lang}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          wrapLines
          lineProps={{ style: { background: "transparent" } }}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.8125rem",
          }}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: isDark ? "#636d83" : "#999",
            userSelect: "none",
            background: "transparent",
          }}
          codeTagProps={{
            style: { background: "transparent" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export { getLanguageFromFilename };
