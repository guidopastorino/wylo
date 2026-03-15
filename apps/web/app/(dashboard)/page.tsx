"use client";

import {
  CheckCircle2,
  Flag,
  GitPullRequest,
  Loader2,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardData = {
  repos: { id: number; fullName: string; name: string; private: boolean }[];
  connectedRepos?: string[];
  pulls: {
    id: number;
    number: number;
    title: string;
    state: string;
    htmlUrl: string;
    user: { login: string; avatarUrl: string } | null;
    updatedAt: string;
    repoFullName: string;
  }[];
  metrics: { myOpenPulls: number };
  activity: {
    type: string;
    title: string;
    repoFullName: string;
    number: number;
    user: string;
    avatarUrl: string | null;
    updatedAt: string;
    htmlUrl: string;
  }[];
};

const criticalHighlights = [
  {
    title: "Large PR (52 files)",
    detail: "#1260 - Refactor Core Engine",
    badge: "COMPLEX",
    variant: "destructive",
  },
  {
    title: "Critical Issue #45",
    detail: "Security: SQL Injection vulnerability in search",
    badge: "OVERDUE",
    variant: "warning",
  },
  {
    title: "Blocked PRs",
    detail: "3 PRs are currently blocked by dependencies",
    badge: "WAITING",
    variant: "muted",
  },
];

const healthMetrics = [
  { label: "Test Coverage", value: 82, color: "bg-emerald-500" },
  { label: "Build Stability", value: 98.4, color: "bg-emerald-500" },
  { label: "Documentation", value: 64, color: "bg-amber-500" },
];

function formatTimeAgo(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString();
}

function Avatar({
  initials,
  src,
}: { initials: string; src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/github/dashboard", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("GitHub not connected");
          if (res.status === 401) throw new Error("Unauthorized");
          throw new Error("Failed to load dashboard");
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">{error}</p>
        <p className="mt-1 text-sm">
          {error === "GitHub not connected"
            ? "Inicia sesión con GitHub para ver tus datos."
            : "Intenta recargar la página."}
        </p>
      </div>
    );
  }

  const metrics = data?.metrics ?? { myOpenPulls: 0 };
  const activity = data?.activity ?? [];
  const pulls = data?.pulls ?? [];
  const connectedRepos = data?.connectedRepos ?? [];

  return (
    <div className="space-y-6">
      {connectedRepos.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Conectá repos en{" "}
          <Link href="/repositories" className="font-medium text-primary hover:underline">
            Repositories
          </Link>{" "}
          para que las métricas y la actividad solo muestren esos repos.
        </div>
      )}
      {/* Top row - Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative rounded-lg border border-border bg-card p-4">
          <TrendingDown className="absolute right-3 top-3 size-4 text-emerald-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Avg. time to merge
          </p>
          <p className="mt-1 text-2xl font-semibold">—</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Próximamente
          </p>
        </div>
        <div className="relative rounded-lg border border-border bg-card p-4">
          <GitPullRequest className="absolute right-3 top-3 size-4 text-blue-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mis PRs abiertos
          </p>
          <p className="mt-1 text-2xl font-semibold">{metrics.myOpenPulls}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pendientes de review/merge
          </p>
        </div>
        <div className="relative rounded-lg border border-border bg-card p-4">
          <CheckCircle2 className="absolute right-3 top-3 size-4 text-violet-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Issues cerradas hoy
          </p>
          <p className="mt-1 text-2xl font-semibold">—</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Próximamente
          </p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left - Activity Summary */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Activity Summary</h2>
            <Link
              href="#"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver en GitHub
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {activity.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No hay actividad reciente (PRs abiertos por vos).
              </li>
            ) : (
              activity.map((item) => (
                <li key={`${item.repoFullName}-${item.number}`} className="px-4 py-3">
                  <div className="flex gap-3">
                    <Avatar
                      initials={item.user.slice(0, 2).toUpperCase()}
                      src={item.avatarUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-muted-foreground">PR</span>{" "}
                        <a
                          href={item.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          #{item.number}
                        </a>{" "}
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {item.repoFullName}
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(item.updatedAt)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
          {pulls.length > 0 && (
            <div className="border-t border-border p-3">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a
                  href="https://github.com/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver todos en GitHub
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Right - Critical Highlights + Repo Health */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Flag className="size-4 text-destructive" />
              Critical Highlights
            </h2>
            <ul className="mt-3 space-y-3">
              {criticalHighlights.map((h) => (
                <li
                  key={h.title}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      h.variant === "destructive" && "bg-destructive",
                      h.variant === "warning" && "bg-amber-500",
                      h.variant === "muted" && "bg-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.detail}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                      h.variant === "destructive" &&
                        "bg-destructive/20 text-destructive",
                      h.variant === "warning" &&
                        "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                      h.variant === "muted" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {h.badge}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Repo Health Index</h2>
            <ul className="mt-4 space-y-4">
              {healthMetrics.map((m) => (
                <li key={m.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", m.color)}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
