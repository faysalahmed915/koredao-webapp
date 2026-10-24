"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { cn } from "cn";
import { useLanguage } from "@/components/providers/language-provider";

import {
  isDropdownActive,
  publicNavigation,
  type DropdownNavItem,
} from "@/components/layout/navigation-data";
import { CollapsibleNavItem } from "@/components/layout/nav/collapsible-nav-item";

/** Small hover-intent delay so the panel does not flash while the pointer travels. */
const HOVER_CLOSE_DELAY_MS = 120;
const HOVER_OPEN_DELAY_MS = 60;

/** Direct links that are useful to everyone and need no dropdown. */
// const PUBLIC_DIRECT_LINKS = [
//   { title: "Membership", href: "/membership" },
//   { title: "About", href: "/about" },
// ] as const;

/**
 * Desktop mega-menu.
 *
 * Deliberately session-free: the public navigation is identical for guests and
 * signed-in users, so this component never re-renders when the auth state
 * changes. Opening is instant on click, with hover intent on desktop, and the
 * heavyweight panel markup only exists while a menu is open.
 */
export function DesktopNav() {
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
    [clearTimers]
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
    // Defer so this setState is not synchronous within the effect.
    queueMicrotask(() => setOpenMenu(null));
  }, [pathname]);

  const isActiveItem = React.useCallback(
    (item: DropdownNavItem) => isDropdownActive(pathname, item),
    [pathname]
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
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        Home
      </Link>

      {publicNavigation.map((item) => {
        const isOpen = openMenu === item.title;
        const active = isActiveItem(item);

        return (
          <div
            key={item.title}
            className="relative"
            onMouseEnter={() => scheduleOpen(item.title)}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={() => setOpenMenu(isOpen ? null : item.title)}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active || isOpen
                  ? "bg-accent/70 text-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {(t.navItems as unknown as Record<string, string>)[item.title] || item.title}
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full z-50 pt-3">
                <div className="w-[620px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                  <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {(t.navItems as unknown as Record<string, string>)[item.title] || item.title}
                      </h2>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {(t.navItems as unknown as Record<string, string>)[item.description] || item.description}
                        </p>
                      )}
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

                  <div
                    className={cn(
                      "grid max-h-[70vh] gap-6 overflow-y-auto p-5",
                      (item.groups?.length ?? 0) > 1 ? "grid-cols-2" : "grid-cols-1"
                    )}
                  >
                    {item.groups?.map((group, groupIndex) => (
                      <section
                        key={group.title || `${item.href}-group-${groupIndex}`}
                        className="min-w-0"
                      >
                        {group.title && (
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {(t.navItems as unknown as Record<string, string>)[group.title] || group.title}
                          </h3>
                        )}
                        {group.description && (
                          <p className="mb-3 mt-1 text-xs text-muted-foreground">
                            {(t.navItems as unknown as Record<string, string>)[group.description] || group.description}
                          </p>
                        )}
                        <ul className="space-y-1">
                          {group.items.map((child) => (
                            <CollapsibleNavItem
                              key={child.href}
                              item={child}
                              pathname={pathname}
                              onNavigate={() => setOpenMenu(null)}
                            />
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>

                  <div className="border-t border-border/70 bg-muted/30 p-4">
                    <Link
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Browse all {(t.navItems as unknown as Record<string, string>)[item.title] || item.title}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Direct links that are useful to everyone and need no dropdown */}
      {/* {PUBLIC_DIRECT_LINKS.map((link) => {
        const active = isRouteActive(pathname, link);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {link.title}
          </Link>
        );
      })} */}
    </nav>
  );
}
