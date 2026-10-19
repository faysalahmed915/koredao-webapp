import type {
  ChatMessage,
  Conversation,
} from "@/types/chat/chat-types";

// Human-friendly last-seen label.
export function formatLastSeen(
  iso: string | null,
): string {
  if (!iso) return "offline";

  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) return "offline";

  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "last seen just now";
  if (mins < 60) return `last seen ${mins} min ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `last seen ${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `last seen ${days}d ago`;
}

// Validates a conversation payload.
export function validateConversation(
  obj: Conversation,
  id: string,
): Conversation {
  if (
    !obj.id ||
    typeof obj.customerId !== "string" ||
    !obj.lastMessageAt
  ) {
    throw new Error(
      `Invalid conversation payload: missing required fields (id, customerId, lastMessageAt). Got id=${id}`,
    );
  }

  return { ...obj, id };
}

// Sort messages by creation time, oldest first.
export function sortMessages(
  msgs: ChatMessage[],
): ChatMessage[] {
  return [...msgs].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();

    if (da === db) return 0;

    return da < db ? -1 : 1;
  });
}

/**
 * Merge a server-sourced message into the current list.
 * Idempotent — safe to call twice for the same server id (socket + REST race).
 *   - server echoes clientTempId  → drop the optimistic placeholder
 *   - server id already present   → replace it (server truth wins), never duplicate
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
