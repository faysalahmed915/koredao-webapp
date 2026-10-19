"use client";

import { AlertTriangle, MessageSquare, Maximize2, Minimize2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatLastSeen } from "@/lib/chat/message-utils";

interface ChatHeaderProps {
  otherPartyName: string;
  online: boolean;
  lastSeen: string | null;
  socketStatus: "connecting" | "online" | "offline";
  isExpanded: boolean;
  onToggleExpanded: () => void;
  children?: ReactNode;
}

export default function ChatHeader({
  otherPartyName,
  online,
  lastSeen,
  socketStatus,
  isExpanded,
  onToggleExpanded,
  children,
}: ChatHeaderProps) {
  return (
    <div>
      {/* Chat Header */}
      <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>{otherPartyName}</span>
              {online ? (
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                  title="Online now"
                />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" title="Offline" />
              )}
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              {online ? (
                <span className="text-emerald-600 dark:text-emerald-400">Active now</span>
              ) : (
                formatLastSeen(lastSeen)
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {children}
          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={isExpanded ? "Shrink chat" : "Expand chat"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Socket health label */}
      {socketStatus === "connecting" && (
        <div className="px-4 py-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 shrink-0">
          <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
        </div>
      )}
      {socketStatus === "offline" && (
        <div className="px-4 py-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 shrink-0">
          <AlertTriangle className="h-3 w-3" /> Reconnecting…
        </div>
      )}
    </div>
  );
}