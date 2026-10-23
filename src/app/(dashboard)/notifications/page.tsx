"use client";

import * as React from "react";
import { Bell, Mail, CheckCircle2, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllRead,
  NotificationItem,
} from "@/lib/notifications-api";

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [marking, setMarking] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        fetchMyNotifications({ page: 1, limit: 50, unreadOnly: false }),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs.items);
      setUnreadCount(count.unreadCount);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  const handleMarkRead = async (id: string) => {
    setMarking((prev) => new Set([...prev, id]));
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as read");
    } finally {
      setMarking((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
            <Bell className="h-3.5 w-3.5" />
            Notification Centre
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Platform alerts, dispute SLA warnings, escrow release reminders and
            verification outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={unreadCount > 0 ? "destructive" : "secondary"}
            className={`hidden sm:inline-flex ${unreadCount > 0 ? "animate-pulse" : ""}`}
          >
            {unreadCount} unread
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={load}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={loading ? "h-3 w-3 animate-spin mr-1.5" : "h-3 w-3 mr-1.5"} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleMarkAllRead}
            disabled={loading || unreadCount === 0}
            className="bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm gap-1"
          >
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Mark all read
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No notifications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform alerts will appear here when you receive them.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {unread.length} new of {notifications.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    n.read ? "bg-muted/30" : "bg-indigo-500/5 border-l-2 border-l-indigo-600"
                  }`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full h-2 w-2 ${
                          n.read ? "bg-muted" : "bg-indigo-600"
                        }`}
                      />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {n.title}
                      </span>
                      {!n.read && (
                        <Badge variant="outline" className="text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {n.body}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{relativeTime(n.createdAt)}</span>
                      <span>{n.emailSent ? "• emailed" : "• in-app"}</span>
                      {typeof n.dataJson?.orderId === "string" && (
                        <span>• order {n.dataJson.orderId.slice(-6)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        disabled={marking.has(n.id)}
                        className="text-indigo-600 font-medium"
                      >
                        Mark read
                      </Button>
                    )}
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40">
            {unread.length > 0 && (
              <Button size="sm" onClick={handleMarkAllRead} disabled={loading}>
                Mark all {unread.length} as read
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
