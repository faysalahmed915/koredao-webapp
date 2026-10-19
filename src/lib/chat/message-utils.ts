import { ChatMessage, Conversation } from "@/types/chat/chat-types";

export function sortMessages(msgs: ChatMessage[]): ChatMessage[] {
  return [...msgs].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return da === db ? 0 : da < db ? -1 : 1;
  });
}

export function dedupeMessages(msgs: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const out: ChatMessage[] = [];
  for (const m of msgs) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

/**
 * Merge a server-sourced message into the current list.
 * Idempotent. Handles all three race conditions:
 *   - server echoes clientTempId  → drop the optimistic placeholder
 *   - server id already present   → replace it (server truth wins)
 *   - otherwise                   → append
 * Always strips clientTempId/status and sorts by createdAt.
 */
export function mergeMessage(
  prev: ChatMessage[],
  serverMsg: ChatMessage,
): ChatMessage[] {
  const withoutOptimistic = serverMsg.clientTempId
    ? prev.filter((m) => m.clientTempId !== serverMsg.clientTempId)
    : prev;
  const withoutDup = withoutOptimistic.filter((m) => m.id !== serverMsg.id);
  const cleaned = {
    ...serverMsg,
    clientTempId: undefined,
    status: undefined,
  };
  return sortMessages([...withoutDup, cleaned]);
}

export function formatLastSeen(iso: string | null): string {
  if (!iso) return "offline";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "offline";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return `last seen ${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `last seen ${hours}h ago`;
  return `last seen ${Math.floor(hours / 24)}d ago`;
}

export function validateConversation(
  obj: Conversation | null | undefined,
  id: string,
): Conversation {
  if (!obj || !obj.id || typeof obj.customerId !== "string" || !obj.lastMessageAt) {
    throw new Error(
      `Invalid conversation payload (missing id, customerId, or lastMessageAt). Got id=${id}`,
    );
  }
  return { ...obj, id };
}