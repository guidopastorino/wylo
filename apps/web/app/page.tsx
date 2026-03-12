"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start gap-8 bg-white py-24 px-8 dark:bg-black">
        <header className="w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Sesiones activas
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Vista rápida de tu sesión actual en Wylo.
          </p>
        </header>

        <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Estado de sesión
          </h2>
          {isPending && (
            <p className="text-zinc-600 dark:text-zinc-300">
              Cargando sesión...
            </p>
          )}
          {error && !isPending && (
            <p className="text-sm text-red-500">
              Hubo un problema al obtener la sesión.
            </p>
          )}
          {!isPending && !session && !error && (
            <p className="text-zinc-600 dark:text-zinc-300">
              No hay ninguna sesión activa.{" "}
              <a
                href="/auth"
                className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              >
                Iniciar sesión
              </a>
              .
            </p>
          )}
          {session && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? session.user.email ?? "Avatar"}
                    className="h-12 w-12 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold uppercase text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {(session.user?.name ?? session.user?.email ?? "U")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                )}
                <div className="text-sm text-zinc-700 dark:text-zinc-200">
                  <p className="flex items-center gap-2 font-medium">
                    {session.user?.name ?? "Usuario sin nombre"}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Sesión activa
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-50 dark:hover:bg-zinc-50 dark:hover:text-zinc-900"
              >
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </button>
            </div>
          )}
        </section>

        {session && (
          <section className="w-full max-w-xl rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 p-4 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Datos de la sesión (debug)
            </h3>
            <pre className="max-h-80 overflow-auto text-[11px] leading-relaxed">
              {JSON.stringify(session, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}
