"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Sparkles, User as UserIcon } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import {
  getDashboardNavigation,
  type DashboardNavItem,
} from "@/components/layout/dashboard/dashboard-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMembership } from "@/components/providers/membership-provider";
import { signOut, useSession } from "@/lib/auth-client";
import { fetchUnreadCount } from "@/lib/notifications-api";
import { getUserRole, isAdmin, isVendor } from "@/lib/access-control";
import { ROLE_LABELS } from "@/types";

/** Resolves the human title for the current route straight from the sidebar
 * configuration, so the topbar never drifts out of sync with the menu. */
function useActiveNavItem(): DashboardNavItem | null {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { membership } = useMembership();

  const user = session?.user;
  const role = getUserRole(user);

  const sections = React.useMemo(
    () =>
      getDashboardNavigation(role, {
        isMember: membership.isMember,
        isVerifiedHelper: isVendor(user) || isAdmin(user),
      }),
    [role, membership.isMember, user],
  );

  return React.useMemo(() => {
    const all = sections.flatMap((section) => section.items);
    return (
      all.find((item) =>
        item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? all.find((item) => pathname.startsWith(item.href)) ?? null
    );
  }, [sections, pathname]);
}

export interface DashboardTopbarProps {
  onOpenMobileNav: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Sticky dashboard topbar.
 *
 * Slim, session-aware chrome. The account `DropdownMenu` is intentionally
 * MOVED to the dashboard sidebar (its footer) so the topbar stays focused
 * on: mobile nav trigger, sidebar collapse, contextual title, notif badge.
 */
export function DashboardTopbar({
  onOpenMobileNav,
  collapsed,
  onToggleCollapse,
}: DashboardTopbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { membership } = useMembership();
  const activeItem = useActiveNavItem();

  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(async () => {
      try {
        const { unreadCount } = await fetchUnreadCount();
        if (!cancelled) setUnreadCount(unreadCount);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const user = session?.user;
  const role = getUserRole(user);
  const initials = (user?.name || user?.email || "U")[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile nav trigger */}
          <button
            type="button"
            onClick={onOpenMobileNav}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "lg:hidden",
            )}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Sidebar collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hidden h-8 w-8 lg:flex",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Contextual page title */}
          <div className="hidden min-w-0 flex-1 sm:block">
            {activeItem ? (
              <h1 className="text-base font-semibold text-foreground truncate">
                {activeItem.title}
              </h1>
            ) : (
              <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
            )}
            {role && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                {ROLE_LABELS[role]}
                {membership.isMember && role !== "MEMBER" ? " • Member" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />

          {/* Notifications bell */}
          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative cursor-pointer",
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Slim avatar — open account menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "cursor-pointer gap-2 px-1",
                )}
                aria-label="Account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-xs font-semibold sm:inline">
                  {user.name || user.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {user.name || "Account"}
                      </span>
                      <span className="truncate text-[11px] font-normal text-muted-foreground">
                        {user.email}
                      </span>
                      {role && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-500">
                          {ROLE_LABELS[role]}
                          {membership.isMember && role !== "MEMBER" ? " • Member" : ""}
                        </span>
                      )}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  render={<Link href="/profile" />}
                >
                  <UserIcon className="h-4 w-4" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  render={<Link href="/membership" />}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Membership
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2"
                  onClick={() => {
                    void signOut().finally(() => {
                      toast.success("Signed out successfully");
                      router.push("/");
                      router.refresh();
                    });
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
