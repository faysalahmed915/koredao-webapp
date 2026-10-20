"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Lock,
  Undo2,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  fetchPaymentHistory,
  type PaymentHistoryResponse,
  type PaymentHistoryEntry,
} from "@/lib/payments-api";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const ENTRY_META: Record<
  PaymentHistoryEntry["type"],
  { label: string; icon: typeof ArrowDownLeft; tone: string }
> = {
  ESCROW_DEPOSIT: {
    label: "Escrow Deposit",
    icon: ArrowDownLeft,
    tone: "text-indigo-500 bg-indigo-500/10",
  },
  ESCROW_RELEASE: {
    label: "Escrow Released",
    icon: ArrowUpRight,
    tone: "text-emerald-500 bg-emerald-500/10",
  },
  REFUND: {
    label: "Refund",
    icon: Undo2,
    tone: "text-amber-500 bg-amber-500/10",
  },
  SUBSCRIPTION: {
    label: "Membership",
    icon: Sparkles,
    tone: "text-purple-500 bg-purple-500/10",
  },
};

/**
 * Shared wallet ledger for CUSTOMER and MEMBER roles.
 *
 * Both roles pay into escrow the same way; members additionally see their
 * membership subscription payments in the same chronological log.
 */
export function PaymentHistoryWallet({ isMember }: { isMember?: boolean }) {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [history, setHistory] = React.useState<PaymentHistoryResponse | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadHistory = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchPaymentHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load wallet information");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      // Defer so the loader's setState is not synchronous within this effect.
      queueMicrotask(() => loadHistory());
    } else if (!isSessionLoading) {
      queueMicrotask(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, isSessionLoading]);

  if (isSessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Loading your wallet ledger...
        </p>
      </div>
    );
  }

  const summary = history?.summary;
  const entries = history?.entries ?? [];
  const orders = history?.orders ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-10">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {isMember ? "Member Wallet" : "Wallet & Transactions"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{isMember ? "My Wallet" : "Wallet & Transactions"}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Escrow Protected
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track escrow deposits, releases and refunds for your orders
              {isMember ? ", plus your membership payments." : "."}
            </p>
          </div>

          <button
            onClick={() => loadHistory(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Total Protected Spent
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.totalSpent ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {summary?.ordersCount ?? 0} total orders
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Currently In Escrow
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.inEscrow ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Held securely until delivery
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Refunded To You
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <Undo2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.totalRefunded ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Disputes and cancellations
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Membership Spend
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.subscriptionSpend ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {isMember
                ? "Active membership billing"
                : "No membership payments yet"}
            </div>
          </div>
        </div>

        {/* Transaction Log + Orders side panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <header className="flex flex-row items-center justify-between px-5 py-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold">Transaction Log</h2>
                <p className="text-xs text-muted-foreground">
                  Escrow deposits, releases, refunds
                  {isMember ? " and membership payments" : ""} — newest first
                </p>
              </div>
            </header>
            <div className="p-5 space-y-3">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No transactions yet. Fund an order&apos;s escrow to see it
                  appear here.
                </div>
              ) : (
                entries.map((entry) => {
                  const meta =
                    ENTRY_META[entry.type] ?? ENTRY_META.ESCROW_DEPOSIT;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-border/50 bg-background/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                            meta.tone
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {meta.label}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize"
                            >
                              {entry.status.replace(/_/g, " ").toLowerCase()}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {entry.title}
                            {entry.vendorName ? ` • ${entry.vendorName}` : ""}
                            {entry.gateway ? ` • ${entry.gateway}` : ""}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {new Date(entry.occurredAt).toLocaleString()}
                            {entry.transactionRef
                              ? ` • Ref: ${entry.transactionRef}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "block font-mono text-sm font-bold",
                            entry.type === "ESCROW_RELEASE"
                              ? "text-emerald-500"
                              : entry.type === "REFUND"
                                ? "text-amber-500"
                                : "text-foreground"
                          )}
                        >
                          ৳{entry.amount}
                        </span>
                        {entry.orderId && (
                          <Link
                            href={`/orders/${entry.orderId}`}
                            className="text-[11px] font-semibold text-indigo-500 hover:underline"
                          >
                            View order
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-border/50">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <p className="text-xs text-muted-foreground">
                Escrow state per order
              </p>
            </header>
            <div className="p-5 space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  You have no orders yet.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg border border-border/50 bg-background/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize"
                      >
                        {order.status.replace(/_/g, " ").toLowerCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                      {order.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {order.escrowStatus
                          ? `Escrow: ${order.escrowStatus.replace(/_/g, " ").toLowerCase()}`
                          : "Escrow not funded"}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ৳{order.totalAmount}
                      </span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:underline"
                    >
                      Open workspace →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}