"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { BrandMark } from "@/components/layout/brand";
import {
  getDashboardNavigation,
  type DashboardNavItem,
} from "@/components/layout/dashboard/dashboard-navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMembership } from "@/components/providers/membership-provider";
import { signOut, useSession } from "@/lib/auth-client";
import {
  getUserRole,
  isAdmin,
  isMembershipExempt,
  isVendor,
} from "@/lib/access-control";
import { ROLE_LABELS, UserRole } from "@/types";

/** Exact-or-prefix active check, honouring `item.exact`. */
function useIsActive() {
  const pathname = usePathname();
  return React.useCallback(
    (item: DashboardNavItem) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    [pathname]
  );
}

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: DashboardNavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isActive = useIsActive();
  const active = isActive(item);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.title : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
          collapsed && "justify-center px-0",
          active
            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
      >
        {/* Active rail */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-500 transition-opacity",
            active ? "opacity-100" : "opacity-0"
          )}
        />
        <Icon
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            active ? "text-indigo-500" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && <span className="truncate">{item.title}</span>}
        {!collapsed && item.badge && (
          <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
            {item.badge}
          </Badge>
        )}
      </Link>
    </li>
  );
}

export interface DashboardSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Rendered inside the mobile Sheet, where the brand row is already shown. */
  hideBrand?: boolean;
  className?: string;
}

/**
 * Professional, role-aware dashboard sidebar.
 *
 * The section list is derived from `getDashboardNavigation`, so a customer, a
 * subscribed member, a helper, a moderator and an admin each see a different,
 * purposeful menu — never a flat list of every route in the app.
 */
export function DashboardSidebar({
  collapsed = false,
  onNavigate,
  hideBrand = false,
  className,
}: DashboardSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { membership } = useMembership();

  const user = session?.user;
  const role = getUserRole(user);
  const isMember = membership.isMember;
  const isPrivileged = isAdmin(user) || isMembershipExempt(user);
  const isVerifiedHelper = isVendor(user) || isAdmin(user);

  const sections = React.useMemo(
    () => getDashboardNavigation(role, { isMember, isVerifiedHelper }),
    [role, isMember, isVerifiedHelper]
  );

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

  const roleLabel = role ? ROLE_LABELS[role] : null;

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      {!hideBrand && (
        <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
          <BrandMark compact={collapsed} />
        </div>
      )}

      {/* Identity + membership summary */}
      {!collapsed && user && (
        <div className="mx-3 rounded-xl border border-border/60 bg-card/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {user.name || user.email}
              </p>
              {roleLabel && (
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {roleLabel}
                  {isMember && role !== UserRole.MEMBER ? " • Member" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-4 overflow-y-auto px-3 pb-2"
      >
        {sections.map((section) => (
          <div key={section.title} className={cn("space-y-1", collapsed && "space-y-1")}>
            {!collapsed && (
              <h3 className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {section.title}
              </h3>
            )}
            {collapsed && <Separator className="my-2 opacity-50" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade / status card */}
      {!collapsed && !isMember && !isPrivileged && (
        <div className="mx-3 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            Become a Member
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Posting jobs and taking jobs requires an active membership.
          </p>
          <Link
            href="/membership"
            onClick={onNavigate}
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-2.5 w-full justify-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            See plans
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {!collapsed && isMember && membership.expiresAt && (
        <div className="mx-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {membership.planName ?? "Membership"} active
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {membership.daysRemaining ?? 0} day
            {(membership.daysRemaining ?? 0) === 1 ? "" : "s"} remaining
          </p>
        </div>
      )}

      <div className={cn("border-t border-border/60 p-3", collapsed && "px-2")}>
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full cursor-pointer justify-start gap-2 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}
