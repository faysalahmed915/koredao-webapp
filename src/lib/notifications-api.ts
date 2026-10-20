import { BACKEND_URL, getApiHeaders } from "./api-client";

/**
 * In-app notification centre client.
 *
 * Mirrors the server contract exactly:
 *   GET  /notifications            → { items, nextCursor, unreadCount }
 *   GET  /notifications/unread-count → { unreadCount }
 *   POST /notifications/read-all    → { updated, unreadCount }
 *   POST /notifications/:id/read    → { id, readAt, unreadCount }
 *
 * The feed is cursor-paginated (the server orders by an index-backed
 * `createdAt DESC, id DESC`), so `cursor` is an opaque notification id rather
 * than a page number.
 */

export type NotificationType =
  | "ORDER"
  | "ESCROW"
  | "PAYOUT"
  | "BID"
  | "VERIFICATION"
  | "MEMBERSHIP"
  | "SYSTEM";

export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  /** Relative in-app destination (never an absolute URL), e.g. `/orders/abc`. */
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsFeed {
  items: NotificationSummary[];
  /** Cursor for the next page, or null when the feed is exhausted. */
  nextCursor: string | null;
  unreadCount: number;
}

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

/** Unwraps the server's `{ data }` envelope, throwing a readable message. */
async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok) {
    throw new Error(
      (typeof envelope?.message === "string" && envelope.message) || fallback,
    );
  }

  if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
    throw new Error("The server returned an unexpected response");
  }

  return envelope.data as T;
}

/**
 * Paginated notification feed for the signed-in user, newest first.
 * The unread count always comes back with the page so the header can render
 * the badge and the list from a single response.
 */
export async function fetchNotifications(params?: {
  limit?: number;
  cursor?: string;
  unreadOnly?: boolean;
}): Promise<NotificationsFeed> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.cursor) search.set("cursor", params.cursor);
  if (params?.unreadOnly) search.set("unreadOnly", "true");
  const query = search.toString();

  const res = await fetch(
    `${BACKEND_URL}/notifications${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );

  return unwrap<NotificationsFeed>(res, "Failed to fetch notifications");
}

/** Unread badge count for the signed-in user. */
export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await fetch(`${BACKEND_URL}/notifications/unread-count`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const data = await unwrap<{ unreadCount: number }>(
    res,
    "Failed to fetch unread count",
  );

  return Number(data?.unreadCount) || 0;
}

/** Marks every unread notification as read. Returns the affected row count. */
export async function markAllNotificationsRead(): Promise<{
  updated: number;
  unreadCount: number;
}> {
  const res = await fetch(`${BACKEND_URL}/notifications/read-all`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const data = await unwrap<{ updated: number; unreadCount: number }>(
    res,
    "Failed to mark all notifications as read",
  );

  return {
    updated: Number(data?.updated) || 0,
    unreadCount: Number(data?.unreadCount) || 0,
  };
}

/**
 * Marks a single notification as read. Idempotent on the server, and scoped
 * to the caller's own rows — a foreign id resolves to a 404.
 */
export async function markNotificationRead(id: string): Promise<{
  id: string;
  readAt: string;
  unreadCount: number;
}> {
  const res = await fetch(
    `${BACKEND_URL}/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "POST",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );

  const data = await unwrap<{ id: string; readAt: string; unreadCount: number }>(
    res,
    "Failed to mark notification as read",
  );

  return {
    id: data.id,
    readAt: data.readAt,
    unreadCount: Number(data?.unreadCount) || 0,
  };
}

/**
 * The four user-facing notification switches.
 *
 * These are enforced on the server: a category that is switched off is never
 * written to the feed in the first place, so the toggles are a real setting
 * rather than a cosmetic one.
 */
export type NotificationCategoryKey =
  | "ORDERS"
  | "PROPOSALS"
  | "ACCOUNT"
  | "ANNOUNCEMENTS";

export type NotificationCategoryFlags = Record<NotificationCategoryKey, boolean>;

export interface NotificationPreferences {
  categories: NotificationCategoryFlags;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await fetch(`${BACKEND_URL}/notifications/preferences`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  return unwrap<NotificationPreferences>(
    res,
    "Failed to fetch notification preferences",
  );
}

export async function updateNotificationPreferences(
  categories: NotificationCategoryFlags,
): Promise<NotificationPreferences> {
  const res = await fetch(`${BACKEND_URL}/notifications/preferences`, {
    method: "PUT",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify({ categories }),
  });

  return unwrap<NotificationPreferences>(
    res,
    "Failed to save notification preferences",
  );
}
