"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  User as UserIcon,
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
import { getUserRole, isAdmin, isVendor } from "@/lib/access-control";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationSummary,
} from "@/lib/notifications-api";
import { ROLE_LABELS } from "@/types";

/**
 * A feed entry plus the relative timestamp, computed when the feed is loaded
 * so the render pass itself stays free of impure calls.
 */
type FeedNotification = NotificationSummary & { relativeTime: string };

/** Human-readable age of a timestamp, e.g. "3h ago". */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

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

  const user = session?.user;
  const role = getUserRole(user);
  const initials = (user?.name || user?.email || "U")[0]?.toUpperCase() ?? "U";

  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<FeedNotification[]>([]);
  const [bellLoading, setBellLoading] = React.useState(false);
  const [markingRead, setMarkingRead] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setBellLoading(true);
    try {
      const [count, feed] = await Promise.all([
        fetchUnreadNotificationCount(),
        fetchNotifications({ limit: 15 }),
      ]);
      setUnreadCount(count);
      // The relative timestamp is computed here rather than during render, so
      // the render pass stays pure (no `Date.now()` in the component body).
      setNotifications(
        (feed.items ?? []).map((item) => ({
          ...item,
          relativeTime: timeAgo(item.createdAt),
        })),
      );
    } catch {
      // Keep the header usable when the feed is temporarily unavailable.
    } finally {
      setBellLoading(false);
    }
  }, []);

  // Poll the badge once the session is known so the count is visible before
  // the bell is ever opened.
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetchUnreadNotificationCount()
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {
        // The badge simply stays at zero when the endpoint is unreachable.
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleMarkAllRead = React.useCallback(async () => {
    setMarkingRead(true);
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) =>
          n.isRead ? n : { ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() },
        ),
      );
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error((err as Error).message || "Failed to mark notifications as read");
    } finally {
      setMarkingRead(false);
    }
  }, []);

  /**
   * Opening a notification marks it read and follows its in-app link.
   * The link is always a relative path produced by the server, so it can
   * never navigate off-site.
   */
  const handleOpenNotification = React.useCallback(
    async (notification: FeedNotification) => {
      if (!notification.isRead) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() }
              : n,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));

        try {
          const result = await markNotificationRead(notification.id);
          setUnreadCount(result.unreadCount);
        } catch {
          // Read state is best-effort; the feed reloads on the next open.
        }
      }

      if (notification.link) {
        router.push(notification.link);
      }
    },
    [router],
  );

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

      {/* Notifications */}
      {user && (
        <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative h-9 w-9 cursor-pointer"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                >
                  {markingRead ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCheck className="h-3 w-3" aria-hidden="true" />
                  )}
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {bellLoading ? (
              <div className="flex items-center justify-center gap-2 px-2 py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                You are all caught up. New order, escrow and verification alerts
                will land here.
              </p>
            ) : (
              <DropdownMenuGroup>
                {notifications.slice(0, 8).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn(
                      "cursor-pointer items-start gap-2.5 py-2",
                      !n.isRead && "bg-indigo-500/5",
                    )}
                    onClick={() => {
                      void handleOpenNotification(n);
                    }}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        n.isRead ? "bg-muted-foreground/30" : "bg-indigo-500",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {n.body}
                        </span>
                      )}
                      <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                        {n.relativeTime}
                        {n.link ? " · Open" : ""}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
