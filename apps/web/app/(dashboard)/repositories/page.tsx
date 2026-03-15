"use client";

import { GitBranch, Loader2, Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Repo = {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  description: string | null;
  updatedAt: string | null;
};

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = () =>
    fetch("/api/github/repos", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load repos");
        return res.json();
      })
      .then((data: { repos: Repo[] }) => setRepos(data.repos))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));

  const fetchConnected = () =>
    fetch("/api/github/connected-repos", { credentials: "include" })
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data: { connectedRepos?: string[] }) => setConnectedRepos(data?.connectedRepos ?? []))
      .catch(() => {});

  useEffect(() => {
    Promise.all([fetchRepos(), fetchConnected()])
      .finally(() => setLoading(false));
  }, []);

  const toggleConnected = async (repoFullName: string) => {
    const isConnected = connectedRepos.includes(repoFullName);
    setToggling(repoFullName);
    try {
      if (isConnected) {
        await fetch(`/api/github/connected-repos?repoFullName=${encodeURIComponent(repoFullName)}`, {
          method: "DELETE",
          credentials: "include",
        });
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
          Conectá los repos que quieras monitorear. El dashboard mostrará métricas y actividad solo de estos repos.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            {connectedRepos.length} de {repos.length} conectados
          </p>
        </div>
        <ul className="divide-y divide-border">
          {repos.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No se encontraron repos. Verificá que tu cuenta de GitHub tenga acceso a repos.
            </li>
          ) : (
            repos.map((repo) => {
              const isConnected = connectedRepos.includes(repo.fullName);
              const busy = toggling === repo.fullName;
              return (
                <li
                  key={repo.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <GitBranch className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium">{repo.fullName}</p>
                      {repo.description ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {repo.description}
                        </p>
                      ) : null}
                    </div>
                    {repo.private ? (
                      <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Privado
                      </span>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant={isConnected ? "secondary" : "default"}
                    onClick={() => toggleConnected(repo.fullName)}
                    disabled={busy}
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
