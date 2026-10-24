"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import {
  publicNavigation,
  type DropdownNavItem,
} from "@/components/layout/navigation-data";
import { CollapsibleNavItem } from "@/components/layout/nav/collapsible-nav-item";
import { BrandMark } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMembership } from "@/components/providers/membership-provider";
import { signOut, useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/access-control";
import { ROLE_LABELS } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";

/** Category containing the active route, for auto-expansion in the drawer. */
function findActiveCategory(
  pathname: string,
  items: DropdownNavItem[]
): string | null {
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.title;
    }
    for (const group of item.groups ?? []) {
      for (const child of group.items) {
        if (
          pathname === child.href ||
          pathname.startsWith(`${child.href}/`) ||
          child.children?.some(
            (nested) =>
              pathname === nested.href || pathname.startsWith(`${nested.href}/`)
          )
        ) {
          return item.title;
        }
      }
    }
  }
  return null;
}

/**
 * Off-canvas navigation for small screens. It reuses the same public menu
 * definition as the desktop mega-menu, so the two can never disagree.
 */
export function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, isPending: isSessionPending } = useSession();
  const { membership } = useMembership();

  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    () => findActiveCategory(pathname, publicNavigation)
  );
  React.useEffect(() => {
    const next = findActiveCategory(pathname, publicNavigation);
    // Defer so this setState is not synchronous within the effect.
    queueMicrotask(() => setExpandedSection(next));
  }, [pathname]);

  const user = session?.user;
  const role = getUserRole(user);

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      onNavigate?.();
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }, [onNavigate, router]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 pb-6 pt-4">
      <BrandMark />

      {user && (
        <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/60 p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {(user.name || user.email || "U")[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {user.name || user.email}
            </p>
            {role && (
              <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                {ROLE_LABELS[role]}
                {membership.isMember && role !== "MEMBER" ? " • Member" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <nav aria-label="Mobile navigation" className="flex-1 space-y-1.5">
        <Link
          href="/"
          onClick={onNavigate}
          aria-current={pathname === "/" ? "page" : undefined}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-accent font-semibold text-primary"
              : "text-foreground hover:bg-accent/60"
          )}
        >
          <span>{t.nav.home}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
        </Link>

        {publicNavigation.map((item) => {
          const isExpanded = expandedSection === item.title;
          const sectionId = `mobile-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <section
              key={item.title}
              className="overflow-hidden rounded-lg border border-border/40 bg-card/40"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="min-w-0 flex-1 py-2.5 pl-3 pr-2 text-sm font-semibold text-foreground"
                >
                  <span className="truncate">{(t.navItems as unknown as Record<string, string>)[item.title] || item.title}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
                  aria-expanded={isExpanded}
                  aria-controls={sectionId}
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : item.title)
                  }
                  className="mr-1 cursor-pointer rounded-md px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-background/80 hover:text-foreground"
                >
                  {isExpanded ? "Hide" : "Show"}
                </button>
              </div>

              {isExpanded && (
                <div
                  id={sectionId}
                  className="space-y-3 border-t border-border/40 bg-background/50 px-3 pb-3 pt-2"
                >
                      {item.description && (
                        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                          {(t.navItems as unknown as Record<string, string>)[item.description] || item.description}
                        </p>
                      )}

                  {item.groups?.map((group, groupIndex) => (
                    <div
                      key={group.title || `${item.href}-group-${groupIndex}`}
                      className="space-y-2"
                    >
                      {(group.title || group.description) && (
                        <div className="px-1 pt-1">
                          {group.title && (
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {(t.navItems as unknown as Record<string, string>)[group.title] || group.title}
                            </h3>
                          )}
                          {group.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground/80">
                              {(t.navItems as unknown as Record<string, string>)[group.description] || group.description}
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
                            onNavigate={onNavigate}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="border-t border-border/50 px-1 pt-2">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      Browse all {(t.navItems as unknown as Record<string, string>)[item.title] || item.title}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        <Link
          href="/membership"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Membership &amp; Pricing
          </span>
          {membership.isMember ? (
            <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-600">
              Active
            </Badge>
          ) : (
            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
          )}
        </Link>
      </nav>

      <Separator />

      {isSessionPending ? null : user ? (
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full cursor-pointer justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            )}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t.nav.signOut}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            onClick={onNavigate}
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            onClick={onNavigate}
            className={cn(
              buttonVariants(),
              "w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            {t.nav.register}
          </Link>
        </div>
      )}
    </div>
  );
}
