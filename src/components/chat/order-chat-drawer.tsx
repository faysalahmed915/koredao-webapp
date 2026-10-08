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
  RefreshCw,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getOrCreateConversation,
  fetchMessages,
  sendChatMessage,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-api";

interface OrderChatDrawerProps {
  orderId?: string;
  vendorProfileId?: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  const socketRef = React.useRef<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize Conversation & History
  React.useEffect(() => {
    let isMounted = true;

    async function initChat() {
      try {
        setLoading(true);
        const conv = await getOrCreateConversation({ orderId, vendorProfileId });
        if (!isMounted) return;
        setConversation(conv);

        const msgs = await fetchMessages(conv.id);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load conversation");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
    };
  }, [orderId, vendorProfileId]);

  // Connect WebSocket
  React.useEffect(() => {
    if (!conversation) return;

    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      ? process.env.NEXT_PUBLIC_BACKEND_URL.replace("/api/v1", "")
      : "http://localhost:3000";

    const socket = io(`${wsUrl}/chat`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
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
    });

    socket.on("user_typing", (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversation]);

  // Auto-scroll on new message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

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

    setSending(true);
    try {
      const attachments = attachmentUrl.trim() ? [attachmentUrl.trim()] : undefined;
      const sent = await sendChatMessage({
        conversationId: conversation.id,
        content: content.trim() || "Shared an attachment",
        attachments,
      });

      // Optimistic update
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      setContent("");
      setAttachmentUrl("");
      setShowAttachmentInput(false);

      if (sent.hasSafetyWarning) {
        toast.warning(sent.safetyWarningNote || "Warning: Off-platform contact sharing is restricted.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
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
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              Live WebSocket Workspace Chat
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
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
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
                    {isMe && <Check className="h-3 w-3" />}
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic pl-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span>{typingUser} is typing...</span>
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
