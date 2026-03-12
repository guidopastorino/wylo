"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Slack, Triangle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
      callbackURL: "/",
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error al iniciar sesión");
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      callbackURL: "/",
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error al registrarse");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Wylo
        </h1>

        <div className="mb-6 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "signin"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "signup"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {tab === "signin" ? (
          <>
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Email</span>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="tu@email.com"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  Contraseña
                </span>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                o continúa con
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  const { error: err } = await authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/",
                  });
                  setLoading(false);
                  if (err) {
                    setError(
                      err.message ?? "Error al iniciar sesión con GitHub",
                    );
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Github className="h-4 w-4" />
                <span>Continuar con GitHub</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  const { error: err } = await authClient.signIn.social({
                    provider: "slack",
                    callbackURL: "/",
                  });
                  setLoading(false);
                  if (err) {
                    setError(
                      err.message ?? "Error al iniciar sesión con Slack",
                    );
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Slack className="h-4 w-4" />
                <span>Continuar con Slack</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  const { error: err } = await authClient.signIn.social({
                    provider: "vercel",
                    callbackURL: "/",
                  });
                  setLoading(false);
                  if (err) {
                    setError(
                      err.message ?? "Error al iniciar sesión con Vercel",
                    );
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Triangle className="h-4 w-4" fill="currentColor" />
                <span>Continuar con Vercel</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Nombre</span>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                autoComplete="name"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Tu nombre"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Email</span>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="tu@email.com"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Contraseña
              </span>
              <input
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Mínimo 8 caracteres"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
