"use client";

import type { ChatMessage } from "@/types/chat/chat-types";
import { useCallback } from "react";
import ChatMessageBubble from "./chat-message-bubble";
import TypingUser from "./statics/typingUser";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  paneRef: React.RefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  otherPartyName: string;
  typingUser: string | null;
  orderId?: string;
  onRetry: (msg: ChatMessage) => void;
  onNearBottomChange: (nearBottom: boolean) => void;
}

export default function ChatMessageList({
  paneRef,
  messages,
  loading,
  currentUserId,
  otherPartyName,
  typingUser,
  orderId,
  onRetry,
  onNearBottomChange,
}: ChatMessageListProps) {
  const handleScroll = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const distanceFromBottom =
      pane.scrollHeight - pane.scrollTop - pane.clientHeight;
    onNearBottomChange(distanceFromBottom <= 80);
  }, [paneRef, onNearBottomChange]);

  return (
    <div
      ref={paneRef}
      onScroll={handleScroll}
      className="flex-1 p-4 overflow-y-auto space-y-3.5"
    >
      {loading ? (
        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Connecting to chat room...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
          <p className="text-xs font-medium text-foreground">No messages yet</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
            Send questions, share references, or discuss assignment equations in
            this secure channel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <ChatMessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                fallbackName={otherPartyName}
                orderId={orderId}
                onRetry={onRetry}
              />
            );
          })}
        </div>
      )}

      {typingUser && <TypingUser typingUser={typingUser} />}
    </div>
  );
}