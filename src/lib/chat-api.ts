import { ChatMessage, Conversation } from "@/types/chat/chat-types";
import { BACKEND_URL, getApiHeaders } from "./api-client";

// REST base URL (may be the same-origin Next.js proxy — fine for fetch,
// but NEVER for WebSockets; use getChatSocketBaseUrl() for socket.io).
const REST_BASE_URL = BACKEND_URL;

/**
 * Resolves the Socket.io origin for real-time chat (`/chat` namespace).
 *
 * REST goes through the Next.js same-origin proxy (`:3001/api/v1` -> `:3000`),
 * but WebSocket upgrades CANNOT be proxied by Next.js rewrites — the browser
 * must connect directly to the NestJS backend that hosts the ChatGateway.
 *
 * Resolution order (production-safe):
 *  1. Explicit override `NEXT_PUBLIC_WS_URL` (e.g. Render URL in prod).
 *  2. Origin of `REST_BASE_URL` when it points at a DIFFERENT
 *     origin than the webapp (direct-backend deployments).
 *  3. Proxy fallback — `REST_BASE_URL` is same-origin as the
 *     webapp, so fall back to the known backend defaults:
 *       dev  -> http://localhost:3000
 *       prod -> https://koredao-server.onrender.com
 */
export function getChatSocketBaseUrl(): string {
  const trimTrailing = (u: string) => u.replace(/\/+$/, "");

  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (explicit) {
    const url = trimTrailing(explicit);
    if (isProduction && url.startsWith("http://")) {
      throw new Error(
        `SECURITY: NEXT_PUBLIC_WS_URL must use https:// in production. Got: ${url}`
      );
    }
    return url;
  }

  const backend = (BACKEND_URL || "").trim();

  if (backend) {
    try {
      const backendOrigin = new URL(backend).origin;
      if (
        typeof window !== "undefined" &&
        window.location?.origin &&
        backendOrigin === window.location.origin
      ) {
        // Same-origin proxy — cannot use it for WebSockets. Fall through.
      } else {
        if (isProduction && backendOrigin.startsWith("http://")) {
          throw new Error(
            `SECURITY: Backend URL must use https:// in production. Got: ${backendOrigin}`
          );
        }
        return backendOrigin;
      }
    } catch {
      // Invalid URL — fall through to defaults below.
    }
  }

  return isProduction
    ? "https://koredao-server.onrender.com"
    : "http://localhost:3000";
}

export async function getOrCreateConversation(payload: {
  orderId?: string;
  vendorProfileId?: string;
}): Promise<Conversation> {
  const res = await fetch(`${REST_BASE_URL}/chat/conversations`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to initialize conversation");
  }

  return envelope.data;
}

export async function fetchMyConversations(): Promise<Conversation[]> {
  const res = await fetch(`${REST_BASE_URL}/chat/conversations/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch conversations");
  }

  return envelope.data || [];
}

export interface MessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

export async function fetchMessages(
  conversationId: string,
  opts?: { before?: string; limit?: number }
): Promise<MessagesPage> {
  const query = new URLSearchParams();
  if (opts?.before) query.set("before", opts.before);
  if (opts?.limit) query.set("limit", String(opts.limit));

  const url = `${REST_BASE_URL}/chat/conversations/${conversationId}/messages${query.toString() ? "?" + query.toString() : ""
    }`;

  const res = await fetch(url, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch messages");
  }

  const data = envelope?.data;
  // Backward-compatible: if the API still returns a plain array (not yet
  // paginated on the backend), wrap it defensively.
  if (Array.isArray(data)) {
    return { messages: data, hasMore: false };
  }
  return {
    messages: data?.messages || [],
    hasMore: data?.hasMore ?? false,
  };
}

export interface ModerationConversation extends Conversation {
  _count?: { messages: number };
}

export async function fetchModerationConversations(params: {
  flaggedOnly?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<{ items: ModerationConversation[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.flaggedOnly !== undefined) query.set("flaggedOnly", String(params.flaggedOnly));
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));

  const res = await fetch(
    `${REST_BASE_URL}/chat/moderation/conversations?${query.toString()}`,
    {
      method: "GET",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch moderation conversations");
  }

  return envelope.data || { items: [], total: 0, totalPages: 0 };
}

export async function markConversationRead(
  conversationId: string,
): Promise<{ updatedCount: number; messageIds: string[] }> {
  const res = await fetch(
    `${REST_BASE_URL}/chat/conversations/${conversationId}/read`,
    {
      method: "POST",
      headers: getApiHeaders(),
      credentials: "include",
    },
  );

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to mark conversation as read");
  }

  return envelope.data || { updatedCount: 0, messageIds: [] };
}

export async function updatePresence(): Promise<{ userId: string; lastSeenAt: string }> {
  const res = await fetch(`${REST_BASE_URL}/chat/presence`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update presence");
  }

  return envelope.data;
}

export async function sendChatMessage(payload: {
  conversationId: string;
  content: string;
  attachments?: string[];
  checkpointId?: string;
  clientTempId?: string;
}): Promise<ChatMessage> {
  const res = await fetch(`${REST_BASE_URL}/chat/messages`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to send message");
  }

  return envelope.data;
}

