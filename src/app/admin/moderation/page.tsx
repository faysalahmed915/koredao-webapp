"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  MessageSquare,
  RefreshCw,
  Loader2,
  ExternalLink,
  AlertTriangle,
  ShoppingBag,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  fetchModerationConversations,
  fetchMessages,
  type ModerationConversation,
  type ChatMessage,
} from "@/lib/chat-api";

export default function AdminModerationPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [flaggedOnly, setFlaggedOnly] = React.useState(false);
  const [conversations, setConversations] = React.useState<ModerationConversation[]>([]);

  // Selected conversation transcript
  const [selected, setSelected] = React.useState<ModerationConversation | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);

  const role = (session?.user as any)?.role as string | undefined;
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN" || role === "MODERATOR";

  const loadConversations = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchModerationConversations({ flaggedOnly, limit: 30 });
      setConversations(data.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [flaggedOnly]);

  React.useEffect(() => {
    if (sessionLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!isStaff) {
      router.push("/dashboard");
      return;
    }
    loadConversations();
  }, [session, sessionLoading, isStaff, router, loadConversations]);

  const openConversation = async (conv: ModerationConversation) => {
    setSelected(conv);
    setMessagesLoading(true);
    try {
      const msgs = await fetchMessages(conv.id);
      setMessages(msgs);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load transcript");
    } finally {
      setMessagesLoading(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-8">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            Chat &amp; Target Moderation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only audit of all platform conversations and milestone/target history.
            Available to moderators, admins, and super admins.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant={flaggedOnly ? "default" : "outline"}
            onClick={() => setFlaggedOnly((v) => !v)}
            className={flaggedOnly ? "bg-rose-600 hover:bg-rose-700 text-white text-xs" : "text-xs"}
          >
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
            {flaggedOnly ? "Showing flagged only" : "Show flagged only"}
          </Button>
          <Button size="sm" variant="ghost" onClick={loadConversations} className="text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
          <span className="text-xs text-muted-foreground">{conversations.length} conversation(s)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-2">
            {conversations.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No conversations found.</p>
              </Card>
            ) : (
              conversations.map((conv) => {
                const flagged = (conv._count?.messages ?? 0) > 0;
                const otherName =
                  conv.customer?.name || conv.vendorProfile?.user?.name || "Conversation";
                const isActive = selected?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={
                      "w-full text-left rounded-xl border p-3 transition-colors " +
                      (isActive
                        ? "border-indigo-500 bg-indigo-500/5"
                        : "border-border/60 hover:border-indigo-500/40")
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conv.customer?.image || conv.vendorProfile?.user?.image || ""} />
                        <AvatarFallback className="text-xs">{otherName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold">{otherName}</span>
                          {flagged && (
                            <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-[10px] px-1.5 py-0">
                              {conv._count?.messages} flagged
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {conv.messages?.[0]?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <TranscriptPanel
                selected={selected}
                messages={messages}
                loading={messagesLoading}
              />
            ) : (
              <Card className="p-12 text-center text-muted-foreground border-dashed">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select a conversation to review its history.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function TranscriptPanel({
  selected,
  messages,
  loading,
}: {
  selected: ModerationConversation | null;
  messages: ChatMessage[];
  loading: boolean;
}) {
  if (!selected) return null;
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          Transcript
        </CardTitle>
        <CardDescription className="text-xs space-y-1">
          <span className="block">
            Student: <strong>{selected.customer?.name || "—"}</strong> · Helper:{" "}
            <strong>{selected.vendorProfile?.user?.name || "—"}</strong>
          </span>
          {selected.order && (
            <Link
              href={`/orders/${selected.order.id}`}
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ShoppingBag className="h-3 w-3" /> Order #{selected.order.orderNumber} ·{" "}
              {selected.order.status} <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No messages.</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-border/50 p-2.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{m.sender?.name || "User"}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap break-words">{m.content}</p>
                {m.attachments?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.attachments.map((a, i) => (
                      <a
                        key={i}
                        href={a}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 hover:underline"
                      >
                        attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                {m.checkpoint && (
                  <div className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                    ↳ target: {m.checkpoint.title}
                  </div>
                )}
                {m.hasSafetyWarning && (
                  <div className="mt-1.5 rounded-md bg-rose-500/10 px-2 py-1 text-[11px] text-rose-600 dark:text-rose-400">
                    {m.safetyWarningNote || "Safety warning flagged."}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

  }
