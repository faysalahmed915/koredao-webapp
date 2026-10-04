"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Clock,
  User as UserIcon,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { fetchMyConversations, type Conversation } from "@/lib/chat-api";
import { OrderChatDrawer } from "@/components/chat/order-chat-drawer";

export default function MessagesInboxPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = React.useState<Conversation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const loadConversations = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  }, [selectedConv]);

  React.useEffect(() => {
    if (session?.user) {
      loadConversations();
    } else if (!isSessionLoading) {
      setLoading(false);
    }
  }, [session, isSessionLoading, loadConversations]);

  if (isSessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="font-medium text-lg">Loading your conversations...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="p-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur shadow-sm">
          <MessageSquare className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to Access Messages</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Direct communications and project workspace conversations require signing in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 transition-all"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) => {
    const custName = c.customer?.name || "";
    const vendorName = c.vendorProfile?.user?.name || "";
    const orderTitle = c.order?.title || "";
    const q = searchQuery.toLowerCase();
    return (
      custName.toLowerCase().includes(q) ||
      vendorName.toLowerCase().includes(q) ||
      orderTitle.toLowerCase().includes(q)
    );
  });

  const currentUserId = session.user.id;
  const currentUserName = session.user.name || "Me";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-8">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Messages & Workspace Chat</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Messages</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero-Leakage Safe
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live WebSocket channels for assignment coordination and pre-order academic inquiries.
            </p>
          </div>
        </div>

        {/* 2-Column Split: Sidebar + Active Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Conversations List (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                  <span>No conversations found</span>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isCustomerMe = conv.customerId === currentUserId;
                  const otherName = isCustomerMe
                    ? conv.vendorProfile?.user?.name || "Helper"
                    : conv.customer?.name || "Student";
                  const isSelected = selectedConv?.id === conv.id;
                  const lastMsg = conv.messages?.[0];

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                          : "border-border/40 hover:bg-accent/40"
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {otherName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-bold text-xs text-foreground truncate">{otherName}</h4>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(conv.lastMessageAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {conv.order ? (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate mb-1">
                            <ShoppingBag className="h-3 w-3 shrink-0" />
                            <span>Order #{conv.order.orderNumber}</span>
                          </div>
                        ) : (
                          <span className="block text-[10px] text-muted-foreground/80 mb-1">
                            Pre-order Inquiry
                          </span>
                        )}

                        <p className="text-[11px] text-muted-foreground truncate">
                          {lastMsg ? lastMsg.content : "Conversation opened"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Chat Pane (8 cols) */}
          <div className="lg:col-span-8">
            {selectedConv ? (
              <div className="space-y-3">
                {/* Active Chat Meta Banner */}
                {selectedConv.order && (
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-indigo-500" />
                      <span>
                        Linked Order: <strong>{selectedConv.order.title}</strong> (#{selectedConv.order.orderNumber})
                      </span>
                    </div>
                    <Link
                      href={`/orders/${selectedConv.order.id}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                <OrderChatDrawer
                  orderId={selectedConv.orderId}
                  vendorProfileId={selectedConv.vendorProfileId}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  otherPartyName={
                    selectedConv.customerId === currentUserId
                      ? selectedConv.vendorProfile?.user?.name || "Helper"
                      : selectedConv.customer?.name || "Student"
                  }
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <h3 className="font-semibold text-foreground text-sm">Select a conversation</h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Choose a conversation thread from the left or open an order workspace to send messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
