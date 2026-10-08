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

export async function sendChatMessage(payload: {
  conversationId: string;
  content: string;
  attachments?: string[];
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
