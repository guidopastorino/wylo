"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sesiones activas
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Vista rápida de tu sesión actual en Wylo.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Estado de sesión
          </h2>

          {isPending && (
            <p className="text-sm text-muted-foreground">Cargando sesión...</p>
          )}

          {error && !isPending && (
            <p className="text-sm text-destructive">
              Hubo un problema al obtener la sesión.
            </p>
          )}

          {!isPending && !session && !error && (
            <p className="text-sm text-muted-foreground">
              No hay ninguna sesión activa.{" "}
              <Link
                href="/auth"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                Iniciar sesión
              </Link>
            </p>
          )}

          {session && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? session.user.email ?? "Avatar"}
                    className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold uppercase text-muted-foreground">
                    {(session.user?.name ?? session.user?.email ?? "U")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                    <span className="truncate">
                      {session.user?.name ?? "Usuario sin nombre"}
                    </span>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Sesión activa
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full shrink-0 sm:w-auto"
              >
                {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
              </Button>
            </div>
          )}
        </section>

        {session && (
          <section className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:mt-8 sm:p-5">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Datos de la sesión (debug)
            </h3>
            <pre className="max-h-64 overflow-auto rounded-md bg-background/50 p-3 text-[11px] leading-relaxed text-muted-foreground sm:max-h-80">
              {JSON.stringify(session, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}
