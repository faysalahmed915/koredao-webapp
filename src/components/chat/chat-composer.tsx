"use client";

import * as React from "react";
import { Target, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectCheckpoint } from "@/lib/milestones-api";

interface ChatComposerProps {
  otherPartyName: string;
  content: string;
  onContentChange: (v: string) => void;
  sending: boolean;
  orderId?: string;
  checkpoints: ProjectCheckpoint[];
  selectedCheckpointId: string;
  onCheckpointChange: (id: string) => void;
  showTargetInput: boolean;
  onToggleTargetInput: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatComposer({
  otherPartyName,
  content,
  onContentChange,
  sending,
  orderId,
  checkpoints,
  selectedCheckpointId,
  onCheckpointChange,
  showTargetInput,
  onToggleTargetInput,
  onSubmit,
}: ChatComposerProps) {
  return (
    <>
      {orderId && checkpoints.length > 0 && showTargetInput && (
        <div className="p-3 bg-muted/50 border-t border-border/40 animate-in slide-in-from-bottom-2">
          <label className="text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <Target className="h-3 w-3" /> Link a milestone target to this message
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCheckpointId}
              onChange={(e) => onCheckpointChange(e.target.value)}
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
                onToggleTargetInput();
                onCheckpointChange("");
              }}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="p-3 border-t border-border/60 bg-card flex items-center gap-2"
      >
        {orderId && checkpoints.length > 0 && (
          <button
            type="button"
            onClick={onToggleTargetInput}
            disabled={sending}
            className={`p-2 rounded-xl border border-border/60 transition-colors ${
              showTargetInput || selectedCheckpointId
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
          onChange={(e) => onContentChange(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <Button
          type="submit"
          size="sm"
          disabled={sending || !content.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </>
  );
}