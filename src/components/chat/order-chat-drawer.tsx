"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import {
  getOrCreateConversation,
  fetchMessages,
  sendChatMessage,
  markConversationRead,
} from "@/lib/chat-api";
import { useChatSocket, useChatSocketStatus } from "./socket-provider";
import {
  fetchOrderCheckpoints,
  type ProjectCheckpoint,
} from "@/lib/milestones-api";
import {
  ChatMessage,
  Conversation,
  OrderChatDrawerProps,
} from "@/types/chat/chat-types";
import {
  sortMessages,
  dedupeMessages,
  validateConversation,
  mergeMessage,
} from "@/lib/chat/message-utils";
import ChatHeader from "./chat-header";
import ChatMessageList from "./chat-message-list";
import ChatComposer from "./chat-composer";

export function OrderChatDrawer({
  conversationId: directConversationId,
  initialConversation,
  orderId,
  vendorProfileId,
  currentUserId,
  currentUserName,
  otherPartyName,
}: OrderChatDrawerProps) {
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [typingUser, setTypingUser] = React.useState<string | null>(null);
  // "New messages ↓" pill state
  const [hasNewBelow, setHasNewBelow] = React.useState(false);
  // Presence (online / last-seen) for the OTHER party in this conversation.
  const [otherPartyOnline, setOtherPartyOnline] = React.useState(false);
  const [otherPartyLastSeen, setOtherPartyLastSeen] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Milestone "target" linking (order-scoped chats only)
  const [checkpoints, setCheckpoints] = React.useState<ProjectCheckpoint[]>([]);
  const [selectedCheckpointId, setSelectedCheckpointId] = React.useState<string>("");
  const [showTargetInput, setShowTargetInput] = React.useState(false);

  const messagesPaneRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Whether the user is currently parked near the bottom of the messages pane.
  // Auto-scroll only fires when they are (or on first load / own send) so reading
  // history is never yanked back down by a typing indicator or incoming message.
  const isNearBottomRef = React.useRef(true);
  const hasScrolledInitiallyRef = React.useRef(false);

  // Initialize Conversation & History
  React.useEffect(() => {
    let isMounted = true;

    async function initChat() {
      try {
        setLoading(true);
        // The inbox sidebar passes the selected conversation directly — it
        // already carries customerId + participant ids, so use it as-is and
        // skip the getOrCreate round-trip (which 409s when the sidebar
        // payload lacks orderId/vendorProfileId).
        let conv: Conversation;
        if (initialConversation) {
          conv = validateConversation(
            initialConversation,
            initialConversation.id
          );
        } else {
          conv = await getOrCreateConversation({ orderId, vendorProfileId });
        }
        if (!isMounted) return;
        setConversation(conv);

        // Seed presence from the conversation payload: the party that is NOT me.
        const iAmCustomer = conv.customerId === currentUserId;
        const otherLastSeen = iAmCustomer
          ? conv.vendorProfile?.user?.lastSeenAt
          : conv.customer?.lastSeenAt;
        if (otherLastSeen) setOtherPartyLastSeen(otherLastSeen);

        const page = await fetchMessages(conv.id);
        if (!isMounted) return;
        setMessages(dedupeMessages(sortMessages(page.messages)));

        // If there are unread incoming messages, mark them read (read receipts).
        const hasUnreadIncoming = page.messages.some(
          (m) => !m.isRead && m.senderId !== currentUserId
        );
        if (hasUnreadIncoming) {
          try {
            await markConversationRead(conv.id);
            if (isMounted) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.senderId !== currentUserId ? { ...m, isRead: true } : m
                )
              );
            }
          } catch {
            // Non-fatal: read receipts simply won't update for the sender.
          }
        }

        // Load milestone checkpoints for target-linking (order-scoped only).
        if (orderId) {
          try {
            const cps = await fetchOrderCheckpoints(orderId);
            if (isMounted) setCheckpoints(cps);
          } catch {
            // Checkpoints unavailable — target-linking is simply disabled.
          }
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load conversation"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [directConversationId, initialConversation, orderId, vendorProfileId, currentUserId]);

  const socket = useChatSocket();
  const socketStatus = useChatSocketStatus();

  // Connect WebSocket (shared socket from provider)
  React.useEffect(() => {
    if (!socket || !conversation) return;

    // The other party's userId so we can react to their presence events.
    const iAmCustomer = conversation.customerId === currentUserId;
    const otherUserId = iAmCustomer
      ? conversation.vendorProfile?.userId
      : conversation.customerId;

    const join = () => {
      socket.emit("join_conversation", { conversationId: conversation.id });
    };

    // Join immediately if already connected; otherwise wait for connect.
    if (socket.connected) {
      join();
    }

    socket.on("connect", join);

    socket.on("new_message", (newMsg: ChatMessage) => {
      // Idempotent merge: handles socket-vs-REST race.
      // - newMsg carries our clientTempId (server echo) -> replaces optimistic placeholder
      // - newMsg id already present (REST won the race) -> replaces in place, no duplicate
      // - otherwise appends.
      setMessages((prev) => mergeMessage(prev, newMsg));
      setTypingUser(null);

      // Show "New messages ↓" pill if user is scrolled up.
      if (newMsg.senderId !== currentUserId && !isNearBottomRef.current) {
        setHasNewBelow(true);
      }

      // Visibility-gated read receipt: only mark read when tab is visible.
      if (
        newMsg.senderId !== currentUserId &&
        document.visibilityState === "visible"
      ) {
        socket.emit("mark_read", {
          userId: currentUserId,
          conversationId: conversation.id,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== currentUserId ? { ...m, isRead: true } : m
          )
        );
      }
    });

    socket.on("user_typing", (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    // Presence: update the other party's online/last-seen status live.
    socket.on(
      "presence",
      (data: { userId: string; online: boolean; lastSeenAt?: string }) => {
        if (!otherUserId || data.userId !== otherUserId) return;
        setOtherPartyOnline(data.online);
        if (!data.online && data.lastSeenAt) {
          setOtherPartyLastSeen(data.lastSeenAt);
        } else if (data.online) {
          setOtherPartyLastSeen(null);
        }
      }
    );

    // Read receipts: mark my sent messages as read when the other party reads them.
    socket.on(
      "messages_read",
      (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
        if (data.conversationId !== conversation.id) return;
        const readSet = new Set(data.messageIds);
        setMessages((prev) =>
          prev.map((m) => (readSet.has(m.id) ? { ...m, isRead: true } : m))
        );
      }
    );

    // Cleanup: remove only this drawer's listeners; do NOT disconnect the shared socket.
    return () => {
      socket.off("connect", join);
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("presence");
      socket.off("messages_read");
    };
  }, [socket, conversation, currentUserId]);

  // Visibility-gated read receipts: when tab becomes visible, mark unread incoming
  // messages as read.
  React.useEffect(() => {
    if (!socket || !conversation) return;
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const unreadIncoming = messages.some(
        (m) => !m.isRead && m.senderId !== currentUserId
      );
      if (unreadIncoming) {
        socket.emit("mark_read", {
          userId: currentUserId,
          conversationId: conversation.id,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== currentUserId ? { ...m, isRead: true } : m
          )
        );
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [socket, conversation, currentUserId, messages]);

  // Auto-scroll only when the user is already near the bottom (live tailing) or
  // on the first render of a loaded conversation.
  React.useEffect(() => {
    const pane = messagesPaneRef.current;
    if (!pane || loading) return;
    const shouldScroll = !hasScrolledInitiallyRef.current || isNearBottomRef.current;
    if (shouldScroll) {
      pane.scrollTop = pane.scrollHeight;
      hasScrolledInitiallyRef.current = true;
    }
  }, [messages, loading]);

  // Reset per-conversation scroll state so a newly opened thread starts pinned
  // to the latest message.
  React.useEffect(() => {
    hasScrolledInitiallyRef.current = false;
    isNearBottomRef.current = true;
  }, [conversation?.id]);

  const handleInputChange = (val: string) => {
    setContent(val);

    if (socket && conversation) {
      socket.emit("typing", {
        conversationId: conversation.id,
        userName: currentUserName,
        isTyping: val.length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("typing", {
          conversationId: conversation.id,
          userName: currentUserName,
          isTyping: false,
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !content.trim()) return;

    // The user just sent a message — pin to the bottom regardless of prior scroll.
    isNearBottomRef.current = true;
    setHasNewBelow(false);

    // Optimistic send
    const clientTempId = crypto.randomUUID();
    const optimisticMsg: ChatMessage = {
      id: `tmp-${clientTempId}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      sender: { id: currentUserId, name: currentUserName },
      content: content.trim(),
      attachments: [],
      hasSafetyWarning: false,
      isRead: true,
      createdAt: new Date().toISOString(),
      clientTempId,
      status: "sending",
    };

    setSending(true);
    setMessages((prev) => sortMessages([...prev, optimisticMsg]));

    try {
      const sent = await sendChatMessage({
        conversationId: conversation.id,
        content: content.trim(),
        checkpointId: selectedCheckpointId || undefined,
        clientTempId,
      });

      // Replace optimistic message with server message (idempotent).
      // mergeMessage drops the tmp-* placeholder (via clientTempId fallback),
      // replaces any copy already appended by the socket broadcast (same id),
      // then appends — so socket-first vs REST-first can never duplicate the key.
      setMessages((prev) =>
        mergeMessage(prev, { ...sent, clientTempId })
      );

      setContent("");
      setSelectedCheckpointId("");
      setShowTargetInput(false);

      if (sent.hasSafetyWarning) {
        toast.warning(
          sent.safetyWarningNote ||
            "Warning: Off-platform contact sharing is restricted."
        );
      }
    } catch (err: unknown) {
      // Mark optimistic message as failed and show retry affordance
      setMessages((prev) =>
        prev.map((m) =>
          m.clientTempId === clientTempId ? { ...m, status: "failed" } : m
        )
      );
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleRetryMessage = async (failedMsg: ChatMessage) => {
    if (!conversation) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending" } : m))
    );

    try {
      const sent = await sendChatMessage({
        conversationId: conversation.id,
        content: failedMsg.content,
        checkpointId: failedMsg.checkpoint?.id,
        clientTempId: failedMsg.clientTempId,
      });

      setMessages((prev) =>
        mergeMessage(prev, { ...sent, clientTempId: failedMsg.clientTempId })
      );
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "failed" } : m))
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to retry message"
      );
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden flex flex-col transition-all ${
        isExpanded ? "h-[680px]" : "h-[500px]"
      }`}
    >
      {/* Chat Header with real-time presence and socket health */}
      <ChatHeader
        otherPartyName={otherPartyName}
        online={otherPartyOnline}
        lastSeen={otherPartyLastSeen}
        socketStatus={socketStatus}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
      />

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2 shrink-0">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>
          KoreDao Escrow Protection active: Never send payment or take
          communications off-platform.
        </span>
      </div>

      {/* Messages Pane */}
      <ChatMessageList
        paneRef={messagesPaneRef}
        messages={messages}
        loading={loading}
        currentUserId={currentUserId}
        otherPartyName={otherPartyName}
        typingUser={typingUser}
        orderId={orderId}
        onRetry={handleRetryMessage}
        onNearBottomChange={(nearBottom) => {
          isNearBottomRef.current = nearBottom;
          if (nearBottom && hasNewBelow) setHasNewBelow(false);
        }}
      />

      {/* "New messages ↓" pill */}
      {hasNewBelow && (
        <button
          type="button"
          onClick={() => {
            const pane = messagesPaneRef.current;
            if (pane) {
              pane.scrollTop = pane.scrollHeight;
            }
            setHasNewBelow(false);
          }}
          className="w-full px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-t border-b border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          ↓ New messages
        </button>
      )}

      {/* Chat Composer */}
      <ChatComposer
        otherPartyName={otherPartyName}
        content={content}
        onContentChange={handleInputChange}
        sending={sending}
        orderId={orderId}
        checkpoints={checkpoints}
        selectedCheckpointId={selectedCheckpointId}
        onCheckpointChange={setSelectedCheckpointId}
        showTargetInput={showTargetInput}
        onToggleTargetInput={() => setShowTargetInput(!showTargetInput)}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}