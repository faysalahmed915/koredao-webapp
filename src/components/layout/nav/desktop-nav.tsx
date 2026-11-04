"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { cn } from "cn";
import { useLanguage } from "@/components/providers/language-provider";
import {
  getPublicNavForContext,
  type PublicNavContext,
} from "@/components/layout/nav/public-nav-context";
import { CollapsibleNavItem } from "@/components/layout/nav/collapsible-nav-item";
import {
  isDropdownActive,
  publicNavigation,
  resolveNavTitle,
} from "@/components/layout/navigation-data";

/** Small hover-intent delay so the panel does not flash while the pointer travels. */
const HOVER_CLOSE_DELAY_MS = 120;
const HOVER_OPEN_DELAY_MS = 60;

/**
 * Desktop mega-menu.
 *
 * Accepts a `context` prop so the public header can render the correct
 * buy-side (customer), sell-side (helper), or guest-focused navigation.
 * Guests still get the full classic three-column menu; members get their
 * role-specific view.
 */
export function DesktopNav({ context = "guest" }: { context?: PublicNavContext }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = React.useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleOpen = React.useCallback(
    (title: string) => {
      clearTimers();
      openTimer.current = setTimeout(() => setOpenMenu(title), HOVER_OPEN_DELAY_MS);
    },
    [clearTimers],
  );

  const scheduleClose = React.useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpenMenu(null), HOVER_CLOSE_DELAY_MS);
  }, [clearTimers]);

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      clearTimers();
    };
  }, [clearTimers]);

  // Close any open panel on navigation.
  React.useEffect(() => {
    queueMicrotask(() => setOpenMenu(null));
  }, [pathname]);

  const navItems: { label: string; href: string; context: PublicNavContext[] }[] =
    getPublicNavForContext(context);

  const isActiveItem = React.useCallback(
    (item: { href: string }) => isDropdownActive(pathname, { href: item.href, title: "" }),
    [pathname],
  );

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="hidden items-center gap-1 md:flex"
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className={cn(
          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/"
            ? "bg-accent text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        Home
      </Link>

      {navItems.map((item) => {
        const isOpen = openMenu === item.label;
        const active = isActiveItem({ href: item.href });
        const matchedEntry = publicNavigation.find((n) => n.href === item.href);
        const matchedGroups = matchedEntry?.groups ?? [];

        return (
          <div key={item.href} className="relative" onMouseEnter={() => scheduleOpen(item.label)}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {item.label}
              {item.context.includes("member") && (
                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-500">
                  Member
                </span>
              )}
            </Link>

            {isOpen && (
              <div className="absolute top-full left-0 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                  <div>
                    <h2 className="text-lg font-semibold">{item.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setOpenMenu(null)}
                    className="shrink-0 cursor-pointer rounded-md p-2 hover:bg-accent"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-5 grid-cols-1">
                  {matchedGroups.map((group) => (
                    <div
                      key={group.title ?? group.items[0]?.href}
                      className="space-y-2"
                    >
                      {(group.title || group.description) && (
                        <div className="px-1 pt-1">
                          {group.title && (
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {resolveNavTitle(group.title, t.navItems)}
                            </h3>
                          )}
                          {group.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground/80">
                              {resolveNavTitle(
                                group.description,
                                t.navItems,
                              )}
                            </p>
                          )}
                        </div>
                      )}
                      <ul className="space-y-1">
                        {group.items.map((child) => (
                          <CollapsibleNavItem
                            key={child.href}
                            item={child}
                            pathname={pathname}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                  {matchedGroups.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No categories available for this section.
                    </p>
                  )}
                </div>

                <div className="border-t border-border/70 bg-muted/30 p-4">
                  <Link
                    href={item.href}
                    onClick={() => setOpenMenu(null)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/** Direct links that are useful to everyone and need no dropdown */}
    </nav>
  );
}
