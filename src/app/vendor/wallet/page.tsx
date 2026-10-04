"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  History,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { fetchVendorWallet, requestWithdrawal, type VendorWallet } from "@/lib/orders-api";

export default function VendorWalletPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [wallet, setWallet] = React.useState<VendorWallet | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Withdraw Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [withdrawMethod, setWithdrawMethod] = React.useState<"BKASH" | "NAGAD" | "BANK_TRANSFER">("BKASH");
  const [withdrawAccount, setWithdrawAccount] = React.useState("");
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = React.useState(false);

  const loadWallet = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchVendorWallet();
      setWallet(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load wallet information");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      loadWallet();
    } else if (!isSessionLoading) {
      setLoading(false);
    }
  }, [session, isSessionLoading, loadWallet]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum < 100) {
      toast.error("Minimum withdrawal amount is ৳100");
      return;
    }

    if (wallet && amountNum > wallet.balance) {
      toast.error(`Insufficient balance. Maximum available is ৳${wallet.balance.toLocaleString()}`);
      return;
    }

    if (!withdrawAccount.trim()) {
      toast.error("Please provide your account or phone number");
      return;
    }

    try {
      setIsSubmittingWithdraw(true);
      await requestWithdrawal({
        amount: amountNum,
        payoutMethod: withdrawMethod,
        payoutAccount: withdrawAccount.trim(),
      });
      toast.success(`Withdrawal of ৳${amountNum.toLocaleString()} requested successfully!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
      loadWallet(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to request withdrawal");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (isSessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="font-medium text-lg">Loading your helper wallet...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="p-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur shadow-sm">
          <Wallet className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Helper Authentication Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in with your verified helper account to access your earnings, escrow releases, and payouts.
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

  const balance = wallet?.balance ?? 0;
  const pendingBalance = wallet?.pendingBalance ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;
  const totalWithdrawn = wallet?.totalWithdrawn ?? 0;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-10">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/orders" className="hover:text-foreground">Orders</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Helper Wallet</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Earnings & Wallet</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Escrow Protected
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor released academic payouts, track pending milestones, and transfer funds to your local account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadWallet(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              disabled={balance < 100}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Available Balance */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Available to Withdraw
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              ৳{balance.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Ready for immediate disbursement</span>
            </div>
          </div>

          {/* Card 2: In Escrow / Pending */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Escrow In Review
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              ৳{pendingBalance.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Auto-releases after 72-hour window</span>
            </div>
          </div>

          {/* Card 3: Total Lifetime Earned */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Lifetime Earnings
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              ৳{totalEarned.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>Net helper revenue (after 10% fee)</span>
            </div>
          </div>

          {/* Card 4: Total Withdrawn */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Total Withdrawn
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              ৳{totalWithdrawn.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span>Paid out via bKash, Nagad or Bank</span>
            </div>
          </div>
        </div>

        {/* Informational Policy Banner */}
        <div className="mb-8 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <strong>Escrow Protection Policy:</strong> When a client hires you or accepts your proposal, funds are locked safely in KoreDao Escrow. Upon delivery, the customer has 72 hours to review. If they don&apos;t reply, our automated worker releases 90% directly to your balance.
            </p>
          </div>
          <Link
            href="/orders"
            className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View Active Orders</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Transactions Ledger */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {transactions.length} Records
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-base text-foreground mb-1">No transactions recorded yet</p>
              <p className="text-xs max-w-sm mx-auto mb-4">
                Completed orders with released escrow payouts will appear here in your audit ledger.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/assignments"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Browse Job Board
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/vendor/gigs/create"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create a Gig
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-6">Type & Description</th>
                    <th className="py-3 px-6">Channel / Account</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isCredit
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                <span>{tx.description}</span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                                    isCredit
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">
                                ID: {tx.id.slice(0, 12)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-muted-foreground font-mono text-xs">
                          {tx.payoutMethod ? (
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                              {tx.payoutMethod === "BANK_TRANSFER" ? (
                                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                              ) : (
                                <Smartphone className="h-3.5 w-3.5 text-pink-500" />
                              )}
                              <span>{tx.payoutMethod}</span>
                              {tx.payoutAccount && (
                                <span className="text-muted-foreground">({tx.payoutAccount})</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span
                            className={`font-bold font-mono text-base ${
                              isCredit
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }`}
                          >
                            {isCredit ? "+" : ""}৳{Math.abs(tx.amount).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Request Withdrawal</h3>
                  <p className="text-xs text-muted-foreground">
                    Available: <strong className="text-foreground">৳{balance.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Payout Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("BKASH")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      withdrawMethod === "BKASH"
                        ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold ring-1 ring-pink-500"
                        : "border-border/60 hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-xs">bKash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("NAGAD")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      withdrawMethod === "NAGAD"
                        ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold ring-1 ring-orange-500"
                        : "border-border/60 hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-xs">Nagad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("BANK_TRANSFER")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      withdrawMethod === "BANK_TRANSFER"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500"
                        : "border-border/60 hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs">Bank Wire</span>
                  </button>
                </div>
              </div>

              {/* Account Number Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {withdrawMethod === "BANK_TRANSFER" ? "Bank Name & Account Number" : "Mobile Wallet Number"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={withdrawMethod === "BANK_TRANSFER" ? "e.g. City Bank - 1234567890" : "e.g. 01700000000"}
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Withdrawal Amount (৳)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(balance.toString())}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                  <input
                    type="number"
                    min={100}
                    max={balance}
                    step={1}
                    required
                    placeholder="Min 100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Summary box */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">৳0 (Free)</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/40">
                  <span>You Receive:</span>
                  <span>৳{withdrawAmount ? parseFloat(withdrawAmount) || 0 : 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? "Processing..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
