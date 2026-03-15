"use client";

import { Triangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-dvh overflow-y-auto bg-background">
      {/* Desktop: sidebar sticky a la izquierda */}
      <aside
        className={cn(
          "hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0 self-start",
          "md:flex",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <Triangle className="size-5 text-primary" />
          <span className="font-semibold">Wylo</span>
        </div>
        <Sidebar user={session.user} />
      </aside>

      {/* Área de contenido: navbar fuera del scroll, contenido scrolleable */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
