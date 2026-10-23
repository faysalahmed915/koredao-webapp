export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  dataJson?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface PreferenceItem {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  vendorAppOutcome: boolean;
  disputeSla: boolean;
  releaseWarning: boolean;
  safetyAlert: boolean;
  updatedAt: string;
}

export interface SlaTrackerItem {
  moderationRequestId: string;
  orderId: string;
  requestedBy: { id: string; name: string; email: string };
  assignedModeratorId: string | null;
  status: string;
  priority: string;
  createdAt: string;
  slaHours: number;
  secondsRemaining: number;
  breached: boolean;
}

export interface SlaTrackerResponse {
  slaHours: number;
  items: SlaTrackerItem[];
}

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  dataJson?: Record<string, unknown>;
}

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

async function json<T>(res: Response): Promise<T> {
  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Request failed");
  }
  return envelope?.data ?? envelope;
}

export async function fetchMyNotifications(
  query: NotificationListQuery = {},
): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.unreadOnly) params.set("unreadOnly", "true");

  const res = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/notifications/me?${params.toString()}`,
    { method: "GET", headers: getApiHeaders(), credentials: "include" },
  );
  return json<NotificationListResponse>(res);
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/unread-count`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return json<UnreadCountResponse>(res);
}

export async function markNotificationRead(
  id: string,
): Promise<NotificationItem> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return json<NotificationItem>(res);
}

export async function markAllRead(): Promise<{ markedRead: number }> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return json<{ markedRead: number }>(res);
}

export async function fetchPreferences(): Promise<PreferenceItem> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/preferences`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return json<PreferenceItem>(res);
}

export interface UpdatePreferenceDto {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  vendorAppOutcome?: boolean;
  disputeSla?: boolean;
  releaseWarning?: boolean;
  safetyAlert?: boolean;
}

export async function updatePreferences(
  dto: UpdatePreferenceDto,
): Promise<PreferenceItem> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/preferences`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  });
  return json<PreferenceItem>(res);
}

export async function fetchSlaTracker(): Promise<SlaTrackerResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications/sla-tracker`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return json<SlaTrackerResponse>(res);
}

export async function createBroadcast(dto: CreateNotificationDto): Promise<NotificationItem> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/notifications`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  });
  return json<NotificationItem>(res);
}
