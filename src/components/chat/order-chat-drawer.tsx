"use client";

import * as React from "react";
import {
    Send,
    MessageSquare,
    ShieldAlert,
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    getOrCreateConversation,
    fetchMessages,
    sendChatMessage,
    markConversationRead
} from "@/lib/chat-api";
import { useChatSocket, useChatSocketStatus } from "./socket-provider";
import {
    fetchOrderCheckpoints,
    type ProjectCheckpoint,
} from "@/lib/milestones-api";
import { ChatMessage, Conversation, OrderChatDrawerProps } from "@/types/chat/chat-types";
import TypingUser from "./statics/typingUser";
import { formatLastSeen, sortMessages, validateConversation, mergeMessage } from "./utils/chat-utils";
import { ChatHeader } from "./components/chat-header";
import { TypingIndicator } from "./components/typing-indicator";
import { ChatMessageItem } from "./components/chat-message-item";


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
                const knownId = directConversationId ?? initialConversation?.id;
                if (knownId) {
                    conv = validateConversation(
                        initialConversation ?? null as any,
                        knownId
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

                const msgs = await fetchMessages(conv.id);
                if (!isMounted) return;
                // setMessages(sortMessages(msgs.messages));
                setMessages(dedupeMessages(sortMessages(msgs.messages)));

                // If there are unread incoming messages, mark them read (read receipts).
                const hasUnreadIncoming = msgs.messages.some(
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
            // Attach clientTempId fallback for our own sends whose broadcast arrived
            // without the echo (broadcast strips it) is handled at the REST site via merge.
            setMessages((prev) => mergeMessage(prev, newMsg));
            setTypingUser(null);

            // Show "New messages ↓" pill if user is scrolled up.
            if (newMsg.senderId !== currentUserId && !isNearBottomRef.current) {
                setHasNewBelow(true);
            }

            // Visibility-gated read receipt (Task 9): only mark read when tab is visible.
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
    // messages as read (Task 9).
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

    // Track whether the user is parked near the bottom of the messages pane.
    const handleMessagesScroll = React.useCallback(() => {
        const pane = messagesPaneRef.current;
        if (!pane) return;
        const distanceFromBottom = pane.scrollHeight - pane.scrollTop - pane.clientHeight;
        isNearBottomRef.current = distanceFromBottom <= 80;
        // Auto-clear the "New messages" pill when the user scrolls back down.
        if (isNearBottomRef.current && hasNewBelow) {
            setHasNewBelow(false);
        }
    }, [hasNewBelow]);

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

        if (socket && conversation) {
            socket.emit("typing", {
                conversationId: conversation.id,
                userName: currentUserName,
                isTyping: e.target.value.length > 0,
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
        if (!conversation || (!content.trim())) return;

        // The user just sent a message — pin to the bottom regardless of prior scroll.
        isNearBottomRef.current = true;
        setHasNewBelow(false);

        // Optimistic send (Task 8)
        const clientTempId = crypto.randomUUID();
        const optimisticMsg: ChatMessage = {
            id: `tmp-${clientTempId}`,
            conversationId: conversation.id,
            senderId: currentUserId,
            sender: { id: currentUserId, name: currentUserName },
            content: content.trim() || "Shared an attachment",
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
            const attachments = undefined;
            const sent = await sendChatMessage({
                conversationId: conversation.id,
                content: content.trim() || "Shared an attachment",
                attachments,
                checkpointId: selectedCheckpointId || undefined,
                clientTempId, // sent to server for matching
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
                    m.clientTempId === clientTempId
                        ? { ...m, status: "failed" }
                        : m
                )
            );
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
            <ChatHeader
                title={otherPartyName}
                isOnline={otherPartyOnline}
                lastSeen={formatLastSeen(otherPartyLastSeen)}
                expanded={isExpanded}
                onToggleExpanded={() => setIsExpanded(!isExpanded)}
                socketStatus={socketStatus}
            />
            

            {/* Socket health label (Task 4) */}
            {socketStatus === "connecting" && (
                <div className="px-4 py-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 shrink-0">
                    <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
                </div>
            )}
            {socketStatus === "offline" && (
                <div className="px-4 py-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 shrink-0">
                    <ShieldAlert className="h-3 w-3" /> Reconnecting…
                </div>
            )}

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
                        // console.log("checking msg.id", msg.id)

                        return (
                            <ChatMessageItem
                                key={msg.id}
                                message={msg}
                                isMe={isMe}
                                otherPartyName={otherPartyName}
                                orderId={orderId}
                            />
                        );
                    })
                )}

                {/* Live Typing Indicator */}
                {typingUser && (<TypingIndicator username={typingUser ?? undefined} />)}

                {/* Attachment input expandable drawer */}
                {false && (
                    <div className="p-3 bg-muted/50 border-t border-border/40 animate-in slide-in-from-bottom-2">
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                            Attachment URL (Draft PDF, image preview, or scan)
                        </label>
                        <div className="flex gap-2">

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
                        className="w-full px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                        ↓ New messages
                    </button>
                )}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 bg-card flex items-center gap-2">

                    {orderId && checkpoints.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowTargetInput(!showTargetInput)}
                            disabled={sending}
                            className={`p-2 rounded-xl border border-border/60 transition-colors ${showTargetInput || selectedCheckpointId ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
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
                        disabled={sending || (!content.trim())}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
    // Remove duplicate messages by id, keeping the first occurrence
    // function dedupeMessages(messages: ChatMessage[]): ChatMessage[] {
    //     const seen = new Set<string>();
    //     return messages.filter((msg) => {
    //         if (seen.has(msg.id)) return false;
    //         seen.add(msg.id);
    //         return true;
    //     });
    // }
function dedupeMessages(messages: ChatMessage[]): ChatMessage[] {
  const seenIds = new Set<string>();

  return messages.filter((message) => {
    if (seenIds.has(message.id)) {
      return false;
    }

    seenIds.add(message.id);
    return true;
  });
}
}