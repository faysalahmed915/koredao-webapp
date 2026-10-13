"use client";

import * as React from "react";
import {
  Send,
  MessageSquare,
  ShieldAlert,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Target,
  CalendarClock,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getOrCreateConversation,
  fetchMessages,
  sendChatMessage,
  markConversationRead,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-api";
import {
  fetchOrderCheckpoints,
  type ProjectCheckpoint,
} from "@/lib/milestones-api";

interface OrderChatDrawerProps {
  orderId?: string;
  vendorProfileId?: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
}

// Human-friendly "last seen" label for presence display.
function formatLastSeen(iso: string | null): string {
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

export function OrderChatDrawer({
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
  const [attachmentUrl, setAttachmentUrl] = React.useState("");
  const [showAttachmentInput, setShowAttachmentInput] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [typingUser, setTypingUser] = React.useState<string | null>(null);
  // Presence (online / last-seen) for the OTHER party in this conversation.
  const [otherPartyOnline, setOtherPartyOnline] = React.useState(false);
  const [otherPartyLastSeen, setOtherPartyLastSeen] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Milestone "target" linking (order-scoped chats only)
  const [checkpoints, setCheckpoints] = React.useState<ProjectCheckpoint[]>([]);
  const [selectedCheckpointId, setSelectedCheckpointId] = React.useState<string>("");
  const [showTargetInput, setShowTargetInput] = React.useState(false);

  const socketRef = React.useRef<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
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
        const conv = await getOrCreateConversation({ orderId, vendorProfileId });
        if (!isMounted) return;
        setConversation(conv);

        // Seed presence from the conversation payload: the party that is NOT me.
        const iAmCustomer = conv.customerId === currentUserId;
        const otherLastSeen = iAmCustomer
          ? conv.vendorProfile?.user?.lastSeenAt
          : conv.customer?.lastSeenAt;
        if (otherLastSeen) setOtherPartyLastSeen(otherLastSeen);

        const msgs = await fetchMessages(conv.id);
        if (!isMounted) return;
        setMessages(msgs);

        // If there are unread incoming messages, mark them read (read receipts).
        const hasUnreadIncoming = msgs.some(
          (m) => !m.isRead && m.senderId !== currentUserId,
        );
        if (hasUnreadIncoming) {
          try {
            await markConversationRead(conv.id);
            if (isMounted) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.senderId !== currentUserId ? { ...m, isRead: true } : m,
                ),
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
        toast.error(err instanceof Error ? err.message : "Failed to load conversation");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [orderId, vendorProfileId, currentUserId]);

  // Connect WebSocket
  React.useEffect(() => {
    if (!conversation) return;

    // The other party's userId so we can react to their presence events.
    const iAmCustomer = conversation.customerId === currentUserId;
    const otherUserId = iAmCustomer
      ? conversation.vendorProfile?.userId
      : conversation.customerId;

    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      ? process.env.NEXT_PUBLIC_BACKEND_URL.replace("/api/v1", "")
      : "http://localhost:3000";

    const socket = io(`${wsUrl}/chat`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: { userId: currentUserId },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_conversation", { conversationId: conversation.id });
    });

    socket.on("new_message", (newMsg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTypingUser(null);

      // If this incoming message is from the OTHER party and we're actively viewing
      // the conversation, immediately send a read receipt so the sender sees ✓✓.
      if (newMsg.senderId !== currentUserId) {
        socket.emit("mark_read", {
          userId: currentUserId,
          conversationId: conversation.id,
        });
        // Optimistically reflect read state locally for incoming messages.
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== currentUserId ? { ...m, isRead: true } : m,
          ),
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
      },
    );

    // Read receipts: mark my sent messages as read when the other party reads them.
    socket.on(
      "messages_read",
      (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
        if (data.conversationId !== conversation.id) return;
        const readSet = new Set(data.messageIds);
        setMessages((prev) =>
          prev.map((m) => (readSet.has(m.id) ? { ...m, isRead: true } : m)),
        );
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [conversation, currentUserId]);

  // Track whether the user is parked near the bottom of the messages pane.
  const handleMessagesScroll = React.useCallback(() => {
    const pane = messagesPaneRef.current;
    if (!pane) return;
    const distanceFromBottom = pane.scrollHeight - pane.scrollTop - pane.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= 80;
  }, []);

  // Auto-scroll only when the user is already near the bottom (live tailing) or
  // on the first render of a loaded conversation. Typing indicators no longer
  // force a scroll, and the page window is never scrolled (pane scrollTop only).
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    if (socketRef.current && conversation) {
      socketRef.current.emit("typing", {
        conversationId: conversation.id,
        userName: currentUserName,
        isTyping: e.target.value.length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          conversationId: conversation.id,
          userName: currentUserName,
          isTyping: false,
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || (!content.trim() && !attachmentUrl.trim())) return;

    // The user just sent a message — pin to the bottom regardless of prior scroll.
    isNearBottomRef.current = true;

    setSending(true);
    try {
      const attachments = attachmentUrl.trim() ? [attachmentUrl.trim()] : undefined;
      const sent = await sendChatMessage({
        conversationId: conversation.id,
        content: content.trim() || "Shared an attachment",
        attachments,
        checkpointId: selectedCheckpointId || undefined,
      });

      // Optimistic update
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      setContent("");
      setAttachmentUrl("");
      setSelectedCheckpointId("");
      setShowAttachmentInput(false);
      setShowTargetInput(false);

      if (sent.hasSafetyWarning) {
        toast.warning(sent.safetyWarningNote || "Warning: Off-platform contact sharing is restricted.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden flex flex-col transition-all ${isExpanded ? "h-[680px]" : "h-[500px]"
        }`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>{otherPartyName}</span>
              {otherPartyOnline ? (
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                  title="Online now"
                />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" title="Offline" />
              )}
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              {otherPartyOnline ? (
                <span className="text-emerald-600 dark:text-emerald-400">Active now</span>
              ) : (
                formatLastSeen(otherPartyLastSeen)
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={isExpanded ? "Shrink chat" : "Expand chat"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2 shrink-0">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>KoreDao Escrow Protection active: Never send payment or take communications off-platform.</span>
      </div>

      {/* Messages Pane */}
      <div
        ref={messagesPaneRef}
        onScroll={handleMessagesScroll}
        className="flex-1 p-4 overflow-y-auto space-y-3.5"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span>Connecting to chat room...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-medium text-foreground">No messages yet</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
              Send questions, share references, or discuss assignment equations in this secure channel.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${isMe
                      ? "bg-indigo-600 text-white rounded-br-none shadow-sm shadow-indigo-600/20"
                      : "bg-muted text-foreground rounded-bl-none border border-border/50"
                    }`}
                >
                  {/* Sender Name (if other person) */}
                  {!isMe && (
                    <span className="block font-bold text-[10px] text-indigo-500 dark:text-indigo-400">
                      {msg.sender?.name || otherPartyName}
                    </span>
                  )}

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      {msg.attachments.map((att, aIdx) => (
                        <a
                          key={aIdx}
                          href={att}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${isMe
                              ? "bg-white/15 text-white hover:bg-white/25"
                              : "bg-background text-indigo-600 dark:text-indigo-400 border border-border/60 hover:bg-accent"
                            }`}
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>View Attachment #{aIdx + 1}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Milestone Target Reference Badge */}
                  {msg.checkpoint && (
                    <a
                      href={orderId ? `/orders/${orderId}` : "#"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${isMe
                          ? "bg-white/15 text-white border-white/20 hover:bg-white/25"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20"
                        }`}
                    >
                      <Target className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        Target: {msg.checkpoint.title}
                      </span>
                      {msg.checkpoint.targetDate && (
                        <span className="inline-flex items-center gap-0.5 opacity-80">
                          <CalendarClock className="h-3 w-3" />
                          {new Date(msg.checkpoint.targetDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {/* Timestamp & read status */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] pt-1 ${isMe ? "text-indigo-200" : "text-muted-foreground"
                      }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe &&
                      (msg.isRead ? (
                        <CheckCheck
                          className="h-3.5 w-3.5 text-sky-300"
                          aria-label="Read"
                        />
                      ) : (
                        <Check
                          className="h-3 w-3 text-indigo-200"
                          aria-label="Sent"
                        />
                      ))}
                  </div>
                </div>

                {/* Zero-Leakage Safety Warning Badge */}
                {msg.hasSafetyWarning && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 max-w-[80%]">
                    <ShieldAlert className="h-3 w-3 shrink-0" />
                    <span>{msg.safetyWarningNote || "Warning: Off-platform contact detected"}</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 px-3 pb-1.5 text-xs text-muted-foreground italic">
            <span className="flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
            </span>
            <span>{typingUser} is typing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment input expandable drawer */}
      {showAttachmentInput && (
        <div className="p-3 bg-muted/50 border-t border-border/40 animate-in slide-in-from-bottom-2">
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            Attachment URL (Draft PDF, image preview, or scan)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://storage.koredao.com/... or https://images.unsplash.com/..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowAttachmentInput(false)}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestone Target selector (order-scoped chats with checkpoints only) */}
      {orderId && checkpoints.length > 0 && showTargetInput && (
        <div className="p-3 bg-muted/50 border-t border-border/40 animate-in slide-in-from-bottom-2">
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <Target className="h-3 w-3" /> Link a milestone target to this message
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCheckpointId}
              onChange={(e) => setSelectedCheckpointId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">— No target —</option>
              {checkpoints.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.title}
                  {cp.targetDate
                    ? ` (due ${new Date(cp.targetDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })})`
                    : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setShowTargetInput(false);
                setSelectedCheckpointId("");
              }}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 bg-card flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAttachmentInput(!showAttachmentInput)}
          className={`p-2 rounded-xl border border-border/60 transition-colors ${showAttachmentInput
              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          title="Attach file or handwriting sample"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {orderId && checkpoints.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTargetInput(!showTargetInput)}
            className={`p-2 rounded-xl border border-border/60 transition-colors ${showTargetInput || selectedCheckpointId
                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            title="Link a milestone target"
          >
            <Target className="h-4 w-4" />
          </button>
        )}

        <input
          type="text"
          placeholder={`Message ${otherPartyName}...`}
          value={content}
          onChange={handleInputChange}
          className="flex-1 px-3.5 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <Button
          type="submit"
          size="sm"
          disabled={sending || (!content.trim() && !attachmentUrl.trim())}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
