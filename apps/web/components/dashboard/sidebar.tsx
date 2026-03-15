"use client";

import {
  FileText,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/repositories", label: "Repositories", icon: FolderGit2 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type UserInfo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Sidebar({
  onNavigate,
  user: userProp,
}: {
  onNavigate?: () => void;
  user?: UserInfo | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = userProp ?? session?.user ?? null;
  const [connectedRepos, setConnectedRepos] = useState<string[]>([]);

  const fetchConnectedRepos = useCallback(() => {
    fetch("/api/github/connected-repos", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { connectedRepos: [] }))
      .then((data: { connectedRepos?: string[] }) =>
        setConnectedRepos(data?.connectedRepos ?? []),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchConnectedRepos();
    const onUpdate = () => fetchConnectedRepos();
    window.addEventListener("connected-repos-changed", onUpdate);
    return () =>
      window.removeEventListener("connected-repos-changed", onUpdate);
  }, [session?.user?.id, fetchConnectedRepos]);

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const displayName = user?.name ?? user?.email ?? "Usuario";
  const initials =
    displayName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Scrollable nav links */}
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
        <div className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={linkClass(href)}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom: tracked repos + user (no scroll) */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-border px-4 py-3">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tracked repositories
          </p>
          <ul className="space-y-1">
            {connectedRepos.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">
                Ninguno.{" "}
                <Link
                  href="/repositories"
                  onClick={onNavigate}
                  className="text-primary hover:underline"
                >
                  Conectar
                </Link>
              </li>
            ) : (
              connectedRepos.map((fullName) => (
                <li
                  key={fullName}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
                >
                  <GitBranch className="size-3.5 shrink-0" />
                  <span className="truncate" title={fullName}>
                    {fullName}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                  {initials}
                </div>
              )}
              <span className="min-w-0 truncate text-left text-sm font-medium">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate}>
                <User className="size-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate}>
                <Settings className="size-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
