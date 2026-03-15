"use client";

import {
  CheckCircle2,
  GitPullRequest,
  Loader2,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  reviewsPending?: {
    id: number;
    number: number;
    title: string;
    htmlUrl: string;
    user: { login: string; avatarUrl: string } | null;
    updatedAt: string;
    repoFullName: string;
  }[];
  metrics: {
    myOpenPulls: number;
    reviewsPendingCount?: number;
    avgTimeToMergeHours?: number | null;
  };
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

function Avatar({ initials, src }: { initials: string; src?: string | null }) {
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

  const metrics = data?.metrics ?? {
    myOpenPulls: 0,
    reviewsPendingCount: 0,
    avgTimeToMergeHours: null,
  };
  const activity = data?.activity ?? [];
  const pulls = data?.pulls ?? [];
  const reviewsPending = data?.reviewsPending ?? [];
  const connectedRepos = data?.connectedRepos ?? [];

  return (
    <div className="space-y-6">
      {connectedRepos.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Conectá repos en{" "}
          <Link
            href="/repositories"
            className="font-medium text-primary hover:underline"
          >
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
          <p className="mt-1 text-2xl font-semibold">
            {metrics.avgTimeToMergeHours != null
              ? `${metrics.avgTimeToMergeHours}h`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {metrics.avgTimeToMergeHours != null
              ? "Tus PRs mergeados"
              : "Sin datos aún"}
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
            Reviews pendientes
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {metrics.reviewsPendingCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PRs donde te asignaron
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
                <li
                  key={`${item.repoFullName}-${item.number}`}
                  className="px-4 py-3"
                >
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

        {/* Right - Reviews pendientes */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Reviews pendientes</h2>
            <a
              href="https://github.com/pulls/review-requested"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver en GitHub
            </a>
          </div>
          <ul className="divide-y divide-border">
            {reviewsPending.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No hay PRs pendientes de tu review.
              </li>
            ) : (
              reviewsPending.slice(0, 5).map((pr) => (
                <li key={pr.id} className="px-4 py-3">
                  <a
                    href={pr.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80"
                  >
                    <p className="text-sm font-medium">{pr.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      #{pr.number} · {pr.repoFullName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {pr.user?.login ?? "—"} · {formatTimeAgo(pr.updatedAt)}
                    </p>
                  </a>
                </li>
              ))
            )}
          </ul>
          {reviewsPending.length > 5 && (
            <div className="border-t border-border p-3">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a
                  href="https://github.com/pulls/review-requested"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver todos ({reviewsPending.length})
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
