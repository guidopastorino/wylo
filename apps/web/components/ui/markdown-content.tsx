"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

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

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const isDark = useTheme();

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-full min-w-0 break-words",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? "");
            const language = match?.[1] ?? "";
            const codeString = String(children).replace(/\n$/, "");
            const isBlock = match || codeString.includes("\n");

            if (isBlock) {
              return (
                <div className="my-4 min-w-0 overflow-x-auto rounded-lg border border-border [&>div]:!rounded-lg">
                  <SyntaxHighlighter
                    style={isDark === false ? oneLight : oneDark}
                    language={language || "text"}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                      border: isDark === false ? "1px solid #e5e7eb" : "none",
                      minWidth: "fit-content",
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="inline-block max-w-full break-all rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="min-w-full border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 text-left text-sm font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2 text-sm">
                {children}
              </td>
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt ?? ""}
                className="max-w-full rounded-lg"
                loading="lazy"
              />
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          details({ children }) {
            return (
              <details className="rounded-lg border border-border bg-muted/30 p-3 my-2">
                {children}
              </details>
            );
          },
          summary({ children }) {
            return (
              <summary className="cursor-pointer font-medium text-foreground">
                {children}
              </summary>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 space-y-1">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>;
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-semibold mt-5 mb-2">{children}</h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
            );
          },
          hr() {
            return <hr className="my-4 border-border" />;
          },
          p({ children }) {
            return <p className="min-w-0 break-words">{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
