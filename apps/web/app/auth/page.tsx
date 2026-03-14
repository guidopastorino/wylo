"use client";

import { Github, Slack, Triangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const AUTH_FORM_STORAGE_KEY = "wylo-auth-form";

type StoredAuthForm = {
  persist: boolean;
  signInEmail?: string;
  signInPassword?: string;
  signUpName?: string;
  signUpEmail?: string;
  signUpPassword?: string;
};

function loadStoredAuthForm(): StoredAuthForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_FORM_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuthForm;
    return data?.persist ? data : null;
  } catch {
    return null;
  }
}

function saveAuthForm(data: StoredAuthForm): void {
  if (typeof window === "undefined") return;
  try {
    if (!data.persist) {
      localStorage.removeItem(AUTH_FORM_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_FORM_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type Tab = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // Cargar datos guardados solo en el cliente
  useEffect(() => {
    const stored = loadStoredAuthForm();
    if (stored) {
      setRememberMe(true);
      if (stored.signInEmail) setSignInEmail(stored.signInEmail);
      if (stored.signInPassword) setSignInPassword(stored.signInPassword);
      if (stored.signUpName) setSignUpName(stored.signUpName);
      if (stored.signUpEmail) setSignUpEmail(stored.signUpEmail);
      if (stored.signUpPassword) setSignUpPassword(stored.signUpPassword);
    }
  }, []);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    // Al desmarcar solo dejamos de guardar; los datos del formulario no se borran.
    // Al enviar el formulario con la casilla desmarcada no se guardará en localStorage.
    if (!checked) localStorage.removeItem(AUTH_FORM_STORAGE_KEY);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rememberMe) {
      saveAuthForm({
        persist: true,
        signInEmail: signInEmail || undefined,
        signInPassword: signInPassword || undefined,
        signUpName: signUpName || undefined,
        signUpEmail: signUpEmail || undefined,
        signUpPassword: signUpPassword || undefined,
      });
    } else {
      saveAuthForm({ persist: false });
    }
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
    if (rememberMe) {
      saveAuthForm({
        persist: true,
        signInEmail: signUpEmail || undefined,
        signInPassword: signUpPassword || undefined,
        signUpName: signUpName || undefined,
        signUpEmail: signUpEmail || undefined,
        signUpPassword: signUpPassword || undefined,
      });
    } else {
      saveAuthForm({ persist: false });
    }
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">Wylo</h1>

        <div className="mb-6 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              tab === "signin"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              tab === "signup"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-border bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {tab === "signin" ? (
          <>
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Introduce tu contraseña"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                  aria-describedby="remember-description"
                />
                <span id="remember-description">
                  Recordar email en este dispositivo
                </span>
              </label>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Entrando…" : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                o continúa con
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
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
                className="w-full"
              >
                <Github className="h-4 w-4" />
                Continuar con GitHub
              </Button>

              <Button
                type="button"
                variant="outline"
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
                className="w-full"
              >
                <Slack className="h-4 w-4" />
                Continuar con Slack
              </Button>

              <Button
                type="button"
                variant="outline"
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
                className="w-full"
              >
                <Triangle className="h-4 w-4" fill="currentColor" />
                Continuar con Vercel
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-name">Nombre</Label>
              <Input
                id="signup-name"
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Tu nombre"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@email.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signup-password">Contraseña</Label>
              <Input
                id="signup-password"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Al menos 8 caracteres"
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
