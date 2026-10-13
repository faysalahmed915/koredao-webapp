export interface ChatCheckpointTarget {
  id: string;
  title: string;
  targetDate?: string;
  status: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  content: string;
  attachments: string[];
  checkpoint?: ChatCheckpointTarget | null;
  hasSafetyWarning: boolean;
  safetyWarningNote?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  orderId?: string;
  customerId: string;
  vendorProfileId: string;
  lastMessageAt: string;
  customer?: {
    id: string;
    name: string;
    image?: string;
    email?: string;
    lastSeenAt?: string;
  };
  vendorProfile?: {
    id: string;
    userId: string;
    university: string;
    department: string;
    user?: {
      id: string;
      name: string;
      image?: string;
      lastSeenAt?: string;
    };
  };
  order?: {
    id: string;
    orderNumber: string;
    title: string;
    status: string;
  };
  messages?: ChatMessage[];
}

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export async function getOrCreateConversation(payload: {
  orderId?: string;
  vendorProfileId?: string;
}): Promise<Conversation> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/chat/conversations`, {
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
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/chat/conversations/me`, {
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

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/chat/conversations/${conversationId}/messages`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch messages");
  }

  return envelope.data || [];
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
    `${NEXT_PUBLIC_BACKEND_URL}/chat/moderation/conversations?${query.toString()}`,
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
    `${NEXT_PUBLIC_BACKEND_URL}/chat/conversations/${conversationId}/read`,
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
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/chat/presence`, {
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
}): Promise<ChatMessage> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/chat/messages`, {
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
