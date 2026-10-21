import { BACKEND_URL, getApiHeaders } from "./api-client";

/**
 * Moderation API client.
 *
 * Endpoints:
 *   POST  /moderation/help-request        → customer/vendor requests moderator help
 *   GET   /moderation/help-requests       → moderator+: pending help requests
 *   GET   /moderation/help-requests/all   → moderator+: all help requests
 *   PATCH /moderation/help-requests/:id/resolve → moderator+: resolve a request
 *   POST  /moderation/admin-escalation    → moderator: escalate to admin
 *   GET   /moderation/admin-escalations   → admin: pending escalations
 *   GET   /moderation/admin-escalations/all → admin: all escalations
 *   PATCH /moderation/admin-escalations/:id/resolve → admin: resolve escalation
 *   GET   /moderation/orders/:orderId/history → moderator+: order moderation history
 */

export interface HelpRequestItem {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTitle: string;
  orderStatus: string;
  requestedById: string;
  requestedByName: string;
  requestedByRole: string;
  reason: string;
  status: string;
  moderatorId: string | null;
  moderatorName: string | null;
  moderatorNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AdminEscalationItem {
  id: string;
  orderId: string | null;
  orderNumber: string | null;
  orderTitle: string | null;
  requestedById: string;
  requestedByName: string;
  requestedByRole: string;
  reason: string;
  status: string;
  adminId: string | null;
  adminName: string | null;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface OrderModerationHistory {
  helpRequests: HelpRequestItem[];
  escalations: AdminEscalationItem[];
}

async function envelope<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (typeof data?.message === "string" && data.message) ||
        "The server returned an error",
    );
  }
  return data?.data ?? data;
}

/**
 * Customer or vendor requests moderator help on an active job.
 */
export async function requestModeratorHelp(payload: {
  orderId: string;
  reason: string;
}): Promise<HelpRequestItem> {
  const res = await fetch(`${BACKEND_URL}/moderation/help-request`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return envelope<HelpRequestItem>(res);
}

/**
 * Get all pending moderator help requests (moderator+ only).
 */
export async function fetchPendingHelpRequests(): Promise<HelpRequestItem[]> {
  const res = await fetch(`${BACKEND_URL}/moderation/help-requests`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return envelope<HelpRequestItem[]>(res);
}

/**
 * Get all moderator help requests with optional status filter (moderator+ only).
 */
export async function fetchAllHelpRequests(status?: string): Promise<HelpRequestItem[]> {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  const res = await fetch(
    `${BACKEND_URL}/moderation/help-requests/all?${query.toString()}`,
    {
      method: "GET",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );
  return envelope<HelpRequestItem[]>(res);
}

/**
 * Resolve a moderation help request (moderator+ only).
 */
export async function resolveHelpRequest(
  requestId: string,
  payload: { status: string; moderatorNote: string },
): Promise<HelpRequestItem> {
  const res = await fetch(
    `${BACKEND_URL}/moderation/help-requests/${requestId}/resolve`,
    {
      method: "PATCH",
      headers: getApiHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
  return envelope<HelpRequestItem>(res);
}

/**
 * Moderator escalates a transaction issue to admin.
 */
export async function requestAdminEscalation(payload: {
  orderId?: string;
  reason: string;
}): Promise<AdminEscalationItem> {
  const res = await fetch(`${BACKEND_URL}/moderation/admin-escalation`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return envelope<AdminEscalationItem>(res);
}

/**
 * Get all pending moderator-to-admin escalation requests (admin only).
 */
export async function fetchPendingAdminEscalations(): Promise<AdminEscalationItem[]> {
  const res = await fetch(`${BACKEND_URL}/moderation/admin-escalations`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return envelope<AdminEscalationItem[]>(res);
}

/**
 * Get all moderator-to-admin escalation requests (admin only).
 */
export async function fetchAllAdminEscalations(status?: string): Promise<AdminEscalationItem[]> {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  const res = await fetch(
    `${BACKEND_URL}/moderation/admin-escalations/all?${query.toString()}`,
    {
      method: "GET",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );
  return envelope<AdminEscalationItem[]>(res);
}

/**
 * Resolve a moderator-to-admin escalation request (admin only).
 */
export async function resolveAdminEscalation(
  requestId: string,
  payload: { status: string; adminNote: string },
): Promise<AdminEscalationItem> {
  const res = await fetch(
    `${BACKEND_URL}/moderation/admin-escalations/${requestId}/resolve`,
    {
      method: "PATCH",
      headers: getApiHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
  return envelope<AdminEscalationItem>(res);
}

/**
 * Get moderation history for a specific order (moderator+ only).
 */
export async function fetchOrderModerationHistory(
  orderId: string,
): Promise<OrderModerationHistory> {
  const res = await fetch(
    `${BACKEND_URL}/moderation/orders/${orderId}/history`,
    {
      method: "GET",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );
  return envelope<OrderModerationHistory>(res);
}
