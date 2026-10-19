
"use client";

import type { ChatMessage } from "@/types/chat/chat-types";
import {
  ShieldAlert,
  Check,
  CheckCheck,
  ExternalLink,
  Target,
  CalendarClock,
} from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
  isMe: boolean;
  otherPartyName: string;
  orderId?: string;
}

export function ChatMessageItem({
  message: msg,
  isMe,
  otherPartyName,
  orderId,
}: ChatMessageItemProps) {
  return (
    <div
      className={`flex flex-col ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
          isMe
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isMe
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-background text-indigo-600 dark:text-indigo-400 border border-border/60 hover:bg-accent"
                }`}
              >
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
              isMe
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
                {new Date(
                  msg.checkpoint.targetDate
                ).toLocaleDateString([], {
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
          className={`flex items-center justify-end gap-1 text-[9px] pt-1 ${
            isMe ? "text-indigo-200" : "text-muted-foreground"
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
          <span>
            {msg.safetyWarningNote ||
              "Warning: Off-platform contact detected"}
          </span>
        </div>
      )}
    </div>
  );
}
