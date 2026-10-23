"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  User as UserIcon,
  Bell,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import {
  getDashboardNavigation,
  type DashboardNavItem,
} from "@/components/layout/dashboard/dashboard-navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMembership } from "@/components/providers/membership-provider";
import { signOut, useSession } from "@/lib/auth-client";
import { fetchUnreadCount } from "@/lib/notifications-api";
import { getUserRole, isAdmin, isVendor } from "@/lib/access-control";
import { ROLE_LABELS } from "@/types";

/**
 * Resolves the human title for the current route straight from the sidebar
 * configuration, so the topbar never drifts out of sync with the menu.
 */
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
    [role, membership.isMember, user]
  );

  return React.useMemo(() => {
    const all = sections.flatMap((section) => section.items);
    return (
      all.find((item) =>
        item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
      ) ??
      all.find((item) => pathname.startsWith(item.href)) ??
      null
    );
  }, [sections, pathname]);
}

export interface DashboardTopbarProps {
  onOpenMobileNav: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Sticky dashboard topbar: mobile drawer trigger, sidebar collapse, contextual
 * page title, membership status and the global account controls.
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

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }, [router]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md sm:px-4">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-9 w-9 cursor-pointer lg:hidden"
        )}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Desktop collapse */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "hidden h-9 w-9 cursor-pointer lg:inline-flex"
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Contextual title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {activeItem?.title ?? "Dashboard"}
        </h1>
        {activeItem?.description && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {activeItem.description}
          </p>
        )}
      </div>

      {/* Membership status */}
      {membership.isMember ? (
        <Badge
          variant="outline"
          className="hidden border-emerald-500/30 text-[10px] text-emerald-600 sm:inline-flex dark:text-emerald-400"
        >
          <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
          Member
        </Badge>
      ) : (
        <Link
          href="/membership"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden gap-1 border-indigo-500/40 text-xs text-indigo-600 hover:bg-indigo-500/10 sm:inline-flex dark:text-indigo-400"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Become a Member
        </Link>
      )}

      <LanguageToggle />
      <ThemeToggle />

      {/* Notifications bell */}
      <Link
        href="/notifications"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "cursor-pointer relative"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center text-[10px] font-bold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Link>

      {/* Account */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "cursor-pointer gap-2 px-1.5"
            )}
            aria-label="Account menu"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {initials}
            </span>
            <span className="hidden max-w-[120px] truncate text-xs font-semibold sm:inline">
              {user.name || user.email}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
