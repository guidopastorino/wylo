"use client";

import Link from "next/link";
import {
  TrendingDown,
  GitPullRequest,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activityItems = [
  {
    name: "Sarah Jenkins",
    action: "merged PR",
    link: "#1254",
    description: "feat: add multi-factor authentication support",
    meta: "+ 428 lines · 12 comments",
    time: "12m ago",
    initials: "SJ",
  },
  {
    name: "David Chen",
    action: "pushed to",
    branch: "hotfix/api-latency",
    description: "fix: optimized database query for user profile loading",
    meta: "a4f21d9 · 88e91c2",
    time: "45m ago",
    initials: "DC",
  },
  {
    name: "Alex Rivera",
    action: "commented on PR",
    link: "#1248",
    description:
      '"I think we should move this logic to the middleware to keep the controller clean..."',
    time: "1h ago",
    initials: "AR",
  },
  {
    name: "Jessica Wu",
    action: "resolved issue",
    link: "#1089",
    description: "bug: fix race condition in web-socket reconnect",
    time: "3h ago",
    initials: "JW",
  },
];

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

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top row - Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative rounded-lg border border-border bg-card p-4">
          <TrendingDown className="absolute right-3 top-3 size-4 text-emerald-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Avg. time to merge
          </p>
          <p className="mt-1 text-2xl font-semibold">4.2h</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            −12% vs last week
          </p>
        </div>
        <div className="relative rounded-lg border border-border bg-card p-4">
          <GitPullRequest className="absolute right-3 top-3 size-4 text-blue-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Open pull requests
          </p>
          <p className="mt-1 text-2xl font-semibold">14</p>
          <p className="mt-1 text-xs text-muted-foreground">
            4 draft, 10 active
          </p>
        </div>
        <div className="relative rounded-lg border border-border bg-card p-4">
          <CheckCircle2 className="absolute right-3 top-3 size-4 text-violet-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Issues closed today
          </p>
          <p className="mt-1 text-2xl font-semibold">8</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            +2 over goal
          </p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left - Team Activity Summary */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Team Activity Summary</h2>
            <Link
              href="#"
              className="text-xs font-medium text-primary hover:underline"
            >
              View detailed log
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {activityItems.map((item) => (
              <li key={`${item.name}-${item.time}`} className="px-4 py-3">
                <div className="flex gap-3">
                  <Avatar initials={item.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.name}</span>{" "}
                      {item.action}{" "}
                      {item.link ? (
                        <Link
                          href="#"
                          className="font-medium text-primary hover:underline"
                        >
                          {item.link}
                        </Link>
                      ) : null}
                      {item.branch ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {item.branch}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.meta ? (
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {item.meta}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-3">
            <Button variant="ghost" size="sm" className="w-full">
              Load more activity
            </Button>
          </div>
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
                      h.variant === "muted" &&
                        "bg-muted text-muted-foreground",
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
