"use client";

import { FolderGit2, Loader2, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  if (isPending || !session?.user) {
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
