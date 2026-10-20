"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  TrendingUp,
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Undo2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  fetchPlatformLedger,
  type PlatformLedgerResponse,
} from "@/lib/payments-api";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const TYPE_TONE: Record<string, string> = {
  ESCROW_RELEASE: "text-emerald-500 bg-emerald-500/10",
  WITHDRAWAL: "text-amber-500 bg-amber-500/10",
  REFUND: "text-rose-500 bg-rose-500/10",
  PLATFORM_FEE: "text-indigo-500 bg-indigo-500/10",
};

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

/**
 * Platform-wide financial ledger for staff (ADMIN / SUPER_ADMIN / MODERATOR).
 *
 * Backed by `GET /payments/ledger` (MinRole MODERATOR on the server), this page
 * surfaces every vendor wallet movement, recent escrow releases/refunds and the
 * platform revenue / withdrawal totals.
 */
export default function AdminWalletPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const [ledger, setLedger] = React.useState<PlatformLedgerResponse | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadLedger = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchPlatformLedger();
      setLedger(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load platform ledger");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role;
      if (!STAFF_ROLES.includes(role)) {
        toast.error("Access restricted: staff role required");
        router.push("/dashboard");
        return;
      }
      // Defer so the loader's setState is not synchronous within this effect.
      queueMicrotask(() => loadLedger());
    } else if (!isSessionLoading) {
      toast.error("Please log in as a staff member");
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, isSessionLoading, router]);

  if (isSessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Loading platform ledger...
        </p>
      </div>
    );
  }

  const summary = ledger?.summary;
  const transactions = ledger?.transactions ?? [];
  const escrowMovements = ledger?.escrowMovements ?? [];

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
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Payouts & Ledger
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Platform Ledger</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff Only
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Audit platform-wide escrow releases, vendor payouts and refunds,
              plus platform revenue collected from completed orders.
            </p>
          </div>

          <button
            onClick={() => loadLedger(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin text-rose-500" : ""}`}
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
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Escrow Locked
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.totalEscrowHeld ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {summary?.escrowHeldCount ?? 0} active escrow holdings
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Platform Revenue
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ৳{summary?.totalPlatformRevenue ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              From ৳{summary?.totalGMV ?? 0} completed GMV
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Vendor Withdrawals
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              ৳{summary?.totalWithdrawn ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Paid out via bKash / Nagad / bank
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Completed Orders
              </span>
              <div className="h-9 w-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              {summary?.completedOrdersCount ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Lifetime completed transactions
            </div>
          </div>
        </div>

        {/* Wallet Transactions + Escrow Movements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-border/50">
              <h2 className="text-lg font-bold">Wallet Transactions</h2>
              <p className="text-xs text-muted-foreground">
                Escrow releases, withdrawals, refunds and platform fees across
                all helper wallets
              </p>
            </header>
            <div className="p-5 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No wallet transactions recorded yet.
                </div>
              ) : (
                transactions.map((tx) => {
                  const tone =
                    TYPE_TONE[tx.type] ?? "text-muted-foreground bg-muted";
                  const isNegative = tx.amount < 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                            tone
                          )}
                        >
                          {tx.type === "REFUND" ? (
                            <Undo2 className="h-4 w-4" aria-hidden="true" />
                          ) : isNegative ? (
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ArrowDownLeft
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {tx.type.replace(/_/g, " ")}
                            </span>
                            {tx.payoutMethod && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase"
                              >
                                {tx.payoutMethod}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 truncate">
                            {tx.vendorName
                              ? `${tx.vendorName} • ${tx.vendorUniversity ?? "—"}`
                              : "Platform"}
                            {" • "}
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-xs font-bold shrink-0",
                          isNegative ? "text-rose-500" : "text-emerald-500"
                        )}
                      >
                        {isNegative ? "-" : "+"}৳
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-border/50">
              <h2 className="text-lg font-bold">Recent Escrow Movements</h2>
              <p className="text-xs text-muted-foreground">
                Released-to-vendor and refunded escrow with counterparties
              </p>
            </header>
            <div className="p-5 space-y-3">
              {escrowMovements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No escrow releases or refunds recorded yet.
                </div>
              ) : (
                escrowMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="p-3 rounded-lg border border-border/50 bg-background/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        {movement.orderNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          movement.status === "RELEASED_TO_VENDOR"
                            ? "border-emerald-500/40 text-emerald-500"
                            : "border-amber-500/40 text-amber-500"
                        )}
                      >
                        {movement.status === "RELEASED_TO_VENDOR"
                          ? "Released"
                          : "Refunded"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                      {movement.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Customer: {movement.customerName ?? "—"}
                      {movement.gateway ? ` • ${movement.gateway}` : ""}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {movement.releasedAt
                          ? `Released ${new Date(movement.releasedAt).toLocaleDateString()}`
                          : movement.refundedAt
                            ? `Refunded ${new Date(movement.refundedAt).toLocaleDateString()}`
                            : ""}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        ৳{movement.amount.toLocaleString()}
                      </span>
                    </div>
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