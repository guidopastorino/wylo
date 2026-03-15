"use client";

import {
  Check,
  GitBranch,
  Loader2,
  Lock,
  Plus,
  Search,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Repo = {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  description: string | null;
  updatedAt: string | null;
};

type VisibilityFilter = "all" | "public" | "private";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");

  const fetchRepos = useCallback(
    () =>
      fetch("/api/github/repos", { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load repos");
          return res.json();
        })
        .then((data: { repos: Repo[] }) => setRepos(data.repos))
        .catch((e) => setError(e instanceof Error ? e.message : "Error")),
    [],
  );

  const fetchConnected = useCallback(
    () =>
      fetch("/api/github/connected-repos", { credentials: "include" })
        .then((res) => {
          if (!res.ok) return;
          return res.json();
        })
        .then((data: { connectedRepos?: string[] }) =>
          setConnectedRepos(data?.connectedRepos ?? []),
        )
        .catch(() => {}),
    [],
  );

  useEffect(() => {
    Promise.all([fetchRepos(), fetchConnected()]).finally(() =>
      setLoading(false),
    );
  }, [fetchRepos, fetchConnected]);

  const filteredRepos = useMemo(() => {
    let list = repos;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (visibilityFilter === "public") list = list.filter((r) => !r.private);
    if (visibilityFilter === "private") list = list.filter((r) => r.private);
    return list;
  }, [repos, searchQuery, visibilityFilter]);

  const toggleConnected = async (repoFullName: string) => {
    const isConnected = connectedRepos.includes(repoFullName);
    setToggling(repoFullName);
    try {
      if (isConnected) {
        await fetch(
          `/api/github/connected-repos?repoFullName=${encodeURIComponent(repoFullName)}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        setConnectedRepos((prev) => prev.filter((r) => r !== repoFullName));
      } else {
        await fetch("/api/github/connected-repos", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoFullName }),
        });
        setConnectedRepos((prev) => [...prev, repoFullName]);
      }
      window.dispatchEvent(new Event("connected-repos-changed"));
    } catch {
      setError("Failed to update");
    } finally {
      setToggling(null);
    }
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conectá los repos que quieras monitorear. El dashboard mostrará
          métricas y actividad solo de estos repos.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setVisibilityFilter("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              visibilityFilter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter("public")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              visibilityFilter === "public"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Unlock className="size-3.5" />
            Públicos
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter("private")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              visibilityFilter === "private"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Lock className="size-3.5" />
            Privados
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            {connectedRepos.length} de {repos.length} conectados
            {filteredRepos.length !== repos.length && (
              <span className="ml-1">· mostrando {filteredRepos.length}</span>
            )}
          </p>
        </div>
        <ul className="divide-y divide-border">
          {repos.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No se encontraron repos. Verificá que tu cuenta de GitHub tenga
              acceso a repos.
            </li>
          ) : filteredRepos.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Ningún repo coincide con la búsqueda o el filtro. Probá otros
              términos o mostrá todos.
            </li>
          ) : (
            filteredRepos.map((repo) => {
              const isConnected = connectedRepos.includes(repo.fullName);
              const busy = toggling === repo.fullName;
              return (
                <li
                  key={repo.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <GitBranch className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/repositories/${repo.fullName}`}
                          className="min-w-0 truncate font-medium hover:text-primary hover:underline"
                          title={repo.fullName}
                        >
                          {repo.fullName}
                        </Link>
                        {repo.private ? (
                          <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Privado
                          </span>
                        ) : null}
                      </div>
                      {repo.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">
                          {repo.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isConnected ? "secondary" : "default"}
                    onClick={() => toggleConnected(repo.fullName)}
                    disabled={busy}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isConnected ? (
                      <>
                        <Check className="size-4" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Conectar
                      </>
                    )}
                  </Button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
