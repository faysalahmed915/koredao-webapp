"use client";

import * as React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  title: string;
  isOnline: boolean;
  lastSeen: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  socketStatus: "connecting" | "online" | "offline";
}

export function ChatHeader({
  title,
  isOnline,
  lastSeen,
  expanded,
  onToggleExpanded,
  socketStatus,
}: ChatHeaderProps) {
  return (
    <div>
      {/* Move your existing header JSX here.
          Preserve its current layout and Tailwind classes. */}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>

          <p className="text-sm text-muted-foreground">
            {isOnline ? "Online" : lastSeen}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleExpanded}
          aria-label={expanded ? "Collapse chat" : "Expand chat"}
        >
          {expanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {socketStatus === "online"
          ? "Connected"
          : socketStatus === "connecting"
            ? "Connecting..."
            : "Connection unavailable"}
      </p>
    </div>
  );
}
