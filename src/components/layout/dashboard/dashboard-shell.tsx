"use client";

import * as React from "react";
import { cn } from "cn";

import { DashboardSidebar } from "@/components/layout/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard/dashboard-topbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const COLLAPSE_STORAGE_KEY = "koredao.dashboard.sidebar-collapsed";

/**
 * Industry-standard dashboard shell:
 *
 * - `lg+`: a persistent, collapsible sidebar beside a sticky topbar.
 * - `< lg`: the sidebar becomes an off-canvas drawer driven by the topbar.
 *
 * The collapse preference is remembered locally so the layout a user chooses
 * survives navigation and reloads.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Restore the stored preference after mount to keep SSR markup stable.
  React.useEffect(() => {
    let stored = false;
    try {
      stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
    } catch {
      // Storage unavailable (private mode) — fall back to the default.
    }
    // Defer so this setState is not synchronous within the effect.
    if (stored) queueMicrotask(() => setCollapsed(true));
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage failures; the visual state still updates.
      }
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-svh w-full bg-muted/20">
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 border-r border-border/60 bg-card/50 transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <DashboardSidebar collapsed={collapsed} className="w-full" />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[282px] max-w-[85vw] p-0 sm:max-w-[282px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
            <SheetDescription>
              Role-based navigation for your KoreDao workspace.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto pt-2">
            <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          onOpenMobileNav={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
