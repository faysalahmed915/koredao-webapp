"use client";

import * as React from "react";
import Link from "next/link";
import {
  PiggyBank,
  Wallet,
  Lock,
  TrendingUp,
  Receipt,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  BadgeCheck,
  BarChart3,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { buildLoginHref } from "@/lib/auth-redirect";
import {
  fetchVendorAnalyticsReport,
  type VendorAnalyticsReport,
} from "@/lib/analytics-api";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";

const taka = (value: number) => `৳${value.toLocaleString()}`;

/**
 * Helper earnings report.
 *
 * Backed by `GET /analytics/earnings`, which resolves the numbers through the
 * caller's own account (never anybody else's). The server returns a zeroed
 * report with `hasHelperProfile: false` for accounts without a helper
 * profile, so this page can explain the state instead of showing an error.
 */
export default function EarningsReportPage() {
  const { data: session, isPending: isSessionLoading } = useSession();

  const [report, setReport] = React.useState<VendorAnalyticsReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadReport = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchVendorAnalyticsReport();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load the earnings report",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      // Defer so the loader's setState is not synchronous within this effect.
      queueMicrotask(() => loadReport());
    } else if (!isSessionLoading) {
      queueMicrotask(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, isSessionLoading]);

  if (isSessionLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-lg font-medium">Building your earnings report...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur">
          <PiggyBank className="mx-auto mb-4 h-12 w-12 text-indigo-500" />
          <h2 className="mb-2 text-xl font-bold">Sign in to view your earnings</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Your earnings report is private — it only ever shows the numbers
            belonging to your own account.
          </p>
          <Link
            href={buildLoginHref()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const summary = report?.summary;
  const series = report?.series ?? [];
  const hasHelperProfile = report?.hasHelperProfile ?? false;

  // Only buckets with activity are worth listing; the chart itself keeps the
  // full 12-month window so the shape of the year stays visible.
  const activeMonths = series.filter((point) => point.orders > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-10">
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Earnings Report
              </span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              <span>Earnings Report</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" />
                Private to you
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly earnings, escrow still held for you, and everything you
              have withdrawn — resolved from your own account.
            </p>
          </div>

          <button
            onClick={() => loadReport(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!hasHelperProfile ? (
          /* No helper profile: explain the state instead of showing empty numbers. */
          <div className="rounded-2xl border border-border/60 bg-card/60 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
              <PiggyBank className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold">No helper earnings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This account has no verified helper profile, so there is nothing
              to report yet. Once your application is approved and you complete
              a gig, your monthly earnings will appear here.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/vendor/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700"
              >
                Apply to become a helper
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Available to Withdraw"
                value={taka(summary?.availableBalance ?? 0)}
                hint="Ready for immediate disbursement"
                icon={<Wallet className="h-5 w-5" />}
                tone="emerald"
              />
              <MetricCard
                label="Held in Escrow"
                value={taka(summary?.pendingEscrow ?? 0)}
                hint="Released after the 72-hour review window"
                icon={<Lock className="h-5 w-5" />}
                tone="amber"
              />
              <MetricCard
                label="Earned (Last 30 Days)"
                value={taka(summary?.earningsLast30Days ?? 0)}
                hint={`${summary?.completedOrdersCount ?? 0} orders completed all time`}
                icon={<TrendingUp className="h-5 w-5" />}
                tone="indigo"
              />
              <MetricCard
                label="Total Withdrawn"
                value={taka(summary?.totalWithdrawn ?? 0)}
                hint={`Average order value ${taka(summary?.avgOrderValue ?? 0)}`}
                icon={<Receipt className="h-5 w-5" />}
                tone="purple"
              />
            </div>

            {/* Monthly series */}
            <div className="mb-8 rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
              <div className="flex flex-col justify-between gap-3 border-b border-border/60 p-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Monthly Earnings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Gross order value and your net earnings over the trailing
                      12 months
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500/70" />
                    Gross
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
                    Net earnings
                  </span>
                </div>
              </div>

              <div className="p-6">
                <MonthlyBarChart
                  label="Monthly gross order value and net earnings for the trailing 12 months"
                  caption="Gross"
                  formatValue={taka}
                  data={series.map((point) => ({
                    month: point.month,
                    value: point.gross,
                    secondary: point.earnings,
                  }))}
                />
              </div>
            </div>

            {/* Month-by-month table */}
            <div className="rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 p-6">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-bold text-foreground">
                    Month-by-month breakdown
                  </h2>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeMonths.length} active{" "}
                  {activeMonths.length === 1 ? "month" : "months"}
                </span>
              </div>

              {activeMonths.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <PiggyBank className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="mb-1 text-base font-medium text-foreground">
                    No completed orders yet
                  </p>
                  <p className="mx-auto max-w-sm text-xs">
                    Complete an order and the escrow release will show up here
                    as monthly earnings.
                  </p>
                  <Link
                    href="/assignments"
                    className="mt-4 inline-block text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Browse the job board
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-3">Month</th>
                        <th className="px-6 py-3 text-right">Orders</th>
                        <th className="px-6 py-3 text-right">Gross</th>
                        <th className="px-6 py-3 text-right">Net earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-sm">
                      {[...activeMonths].reverse().map((point) => (
                        <tr key={point.month} className="transition-colors hover:bg-accent/40">
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">
                            {point.month}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground">
                            {point.orders}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs text-foreground">
                            {taka(point.gross)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {taka(point.earnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                href="/vendor/wallet"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Open wallet &amp; payouts
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/orders"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View your orders
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type MetricTone = "emerald" | "amber" | "indigo" | "purple";

const TONE_CLASSES: Record<MetricTone, { card: string; icon: string }> = {
  emerald: {
    card: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    card: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card",
    icon: "bg-amber-500/15 text-amber-500",
  },
  indigo: {
    card: "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card",
    icon: "bg-indigo-500/15 text-indigo-500",
  },
  purple: {
    card: "border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card",
    icon: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
};

function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: MetricTone;
}) {
  const classes = TONE_CLASSES[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${classes.card}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${classes.icon}`}
        >
          {icon}
        </div>
      </div>
      <div className="truncate text-3xl font-extrabold tracking-tight text-foreground">
        {value}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
