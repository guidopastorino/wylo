"use client";

import { Check, FolderGit2, Loader2, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  slack: "Slack",
  vercel: "Vercel",
};

export default function SettingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [accounts, setAccounts] = useState<{ providerId: string }[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const fetchAccounts = useCallback(() => {
    setAccountsLoading(true);
    fetch("/api/user/accounts", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { accounts: [] }))
      .then((data: { accounts?: { providerId: string }[] }) =>
        setAccounts(data?.accounts ?? []),
      )
      .catch(() => setAccounts([]))
      .finally(() => setAccountsLoading(false));
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchAccounts();
  }, [session?.user?.id, fetchAccounts]);

  const hasProvider = (providerId: string) =>
    accounts.some((a) => a.providerId === providerId);

  const handleLinkGitHub = async () => {
    setLinkError(null);
    setLinking("github");
    try {
      await authClient.linkSocial({
        provider: "github",
        callbackURL: "/settings",
      });
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Error al vincular");
      setLinking(null);
    }
  };

  if (sessionPending || !session?.user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perfil y preferencias de tu cuenta.
        </p>
      </div>

      {/* Perfil básico */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Información de tu cuenta.
          </p>
        </div>
        <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Avatar"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl font-medium text-muted-foreground">
                {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <User className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Nombre
                </p>
                <p className="text-sm font-medium">{user.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm font-medium">{user.email ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuentas vinculadas */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Cuentas vinculadas</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Conecta GitHub para ver repos, PRs y métricas. Vincula otras cuentas
            si lo necesitas.
          </p>
        </div>
        <div className="mx-4 mt-3 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          El email de la cuenta que conectes (p. ej. GitHub) debe coincidir con
          el de tu cuenta actual ({user.email ?? "tu email"}).
        </div>
        {accountsLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando…
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {["github", "slack", "vercel"].map((providerId) => {
              const connected = hasProvider(providerId);
              const label = PROVIDER_LABELS[providerId] ?? providerId;
              return (
                <li
                  key={providerId}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm font-medium">{label}</span>
                  {connected ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check className="size-4" />
                      Conectado
                    </span>
                  ) : providerId === "github" ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleLinkGitHub}
                      disabled={linking !== null}
                    >
                      {linking === "github" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Conectar GitHub"
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No disponible para vincular
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {linkError && (
          <p className="border-t border-border px-4 py-2 text-sm text-destructive">
            {linkError}
          </p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Accesos rápidos</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Gestiona tus repositorios y conexiones.
          </p>
        </div>
        <ul className="divide-y divide-border">
          <li>
            <Link
              href="/repositories"
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <FolderGit2 className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Repositorios</p>
                <p className="text-xs text-muted-foreground">
                  Conectar o desconectar repos de GitHub
                </p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
