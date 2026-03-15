"use client";

import { CalendarDays, Menu, Triangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

function useCurrentDate() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return date;
}

export function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const today = useCurrentDate();
  const dateLabel = today.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 flex h-14 min-h-14 max-h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4",
        )}
      >
        {/* Desktop / tablet content */}
        <div className="hidden w-full items-center justify-between gap-4 md:flex">
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <h1 className="text-base font-bold leading-tight text-foreground sm:text-lg">
              Daily Digest
            </h1>
            <p className="text-xs font-normal leading-tight text-muted-foreground">
              Overview of development activity across the team.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <CalendarDays className="size-3.5" />
              <span>{dateLabel}</span>
            </button>
            <Button size="sm">Export report</Button>
          </div>
        </div>

        {/* Mobile content */}
        <div className="flex w-full items-center justify-between gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <Triangle className="size-4 text-primary" />
            <span className="text-sm font-semibold">Wylo</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="px-3 text-xs">
              Export
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
