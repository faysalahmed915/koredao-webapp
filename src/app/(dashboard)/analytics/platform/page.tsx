"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Banknote,
  Lock,
  Users,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  BadgeCheck,
  Gavel,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { isModerator, isSuperAdmin } from "@/lib/access-control";
import {
  fetchPlatformAnalyticsReport,
  type PlatformAnalyticsReport,
} from "@/lib/analytics-api";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";

const taka = (value: number) => `৳${value.toLocaleString()}`;

/**
 * Platform overview for staff.
 *
 * Backed by `GET /analytics/platform` (server-enforced `MinRole(MODERATOR)`).
 * The all-time totals use the same COMPLETED-order definition as
 * `GET /payments/ledger`, so the numbers reconcile with the platform ledger.
 */
export default function PlatformOverviewPage() {
  const { data: session, isPending: isSessionLoading } = useSession();

  const [report, setReport] = React.useState<PlatformAnalyticsReport | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const user = session?.user;
  // Derived, not stored in state: the session role is the source of truth.
  // Matches the server's `@MinRole(MODERATOR)` on GET /analytics/platform.
  const notStaff = Boolean(user) && !isModerator(user);

  const loadReport = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);
      const data = await fetchPlatformAnalyticsReport();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load platform analytics",
      );
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (!user) return;

    if (notStaff) {
      queueMicrotask(() =>
        toast.error("Access restricted: staff role required"),
      );
      return;
    }

    // Defer so the loader's setState is not synchronous within this effect.
    queueMicrotask(() => loadReport());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSessionLoading]);

  if (isSessionLoading || (!notStaff && !loaded)) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
          <span className="text-lg font-medium">Loading platform analytics...</span>
        </div>
      </div>
    );
  }

  if (notStaff) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h2 className="mb-2 text-xl font-bold">Staff access required</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Platform-wide GMV, revenue and escrow reporting is limited to
            moderators and administrators.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-6 py-2.5 font-medium text-white shadow-md shadow-rose-500/20 transition-all hover:bg-rose-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const summary = report?.summary;
  const series = report?.series ?? [];
  const activeMonths = series.filter(
    (point) => point.gmv > 0 || point.orders > 0 || point.newUsers > 0,
  );
  const isRootAdmin = isSuperAdmin(session?.user);

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
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Platform Overview
              </span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              <span>Platform Overview</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff only
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              GMV, platform revenue, escrow exposure and growth over the
              trailing 12 months. All-time totals reconcile with the platform
              ledger.
            </p>
          </div>

          <button
            onClick={() => loadReport(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-rose-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total GMV"
            value={taka(summary?.totalGMV ?? 0)}
            hint={`${summary?.completedOrdersCount ?? 0} completed orders`}
            icon={<TrendingUp className="h-5 w-5" />}
            tone="rose"
          />
          <MetricCard
            label="Platform Revenue"
            value={taka(summary?.totalPlatformRevenue ?? 0)}
            hint="10% fee on completed orders"
            icon={<Banknote className="h-5 w-5" />}
            tone="emerald"
          />
          <MetricCard
            label="Escrow Held"
            value={taka(summary?.totalEscrowHeld ?? 0)}
            hint="Customer funds still in escrow"
            icon={<Lock className="h-5 w-5" />}
            tone="amber"
          />
          <MetricCard
            label="Registered Users"
            value={(summary?.registeredUsersCount ?? 0).toLocaleString()}
            hint={`${summary?.totalWithdrawn ? taka(summary.totalWithdrawn) : "৳0"} paid out to helpers`}
            icon={<Users className="h-5 w-5" />}
            tone="indigo"
          />
        </div>

        {/* Operational queues */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/verifications"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur transition-colors hover:border-amber-500/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Pending verifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Helper applications awaiting review
                </p>
              </div>
            </div>
            <span className="font-mono text-2xl font-extrabold text-amber-500">
              {summary?.pendingVerificationsCount ?? 0}
            </span>
          </Link>

          <Link
            href="/admin/moderation"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur transition-colors hover:border-rose-500/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Gavel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Open disputes
                </p>
                <p className="text-xs text-muted-foreground">
                  Orders requiring arbitration
                </p>
              </div>
            </div>
            <span className="font-mono text-2xl font-extrabold text-rose-500">
              {summary?.openDisputesCount ?? 0}
            </span>
          </Link>
        </div>

        {/* Monthly series */}
        <div className="mb-8 rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
          <div className="flex flex-col justify-between gap-3 border-b border-border/60 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-5 w-5 text-rose-500" />
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Monthly GMV &amp; Revenue
                </h2>
                <p className="text-xs text-muted-foreground">
                  Completed order value and the platform fee collected, over
                  the trailing 12 months
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/70" />
                GMV
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
                Revenue
              </span>
            </div>
          </div>

          <div className="p-6">
            <MonthlyBarChart
              label="Monthly platform GMV and revenue for the trailing 12 months"
              caption="GMV"
              formatValue={taka}
              barClassName="bg-rose-500/70"
              data={series.map((point) => ({
                month: point.month,
                value: point.gmv,
                secondary: point.revenue,
              }))}
            />
          </div>
        </div>

        {/* Month-by-month table */}
        <div className="rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/60 p-6">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="h-5 w-5 text-rose-500" />
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
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="mb-1 text-base font-medium text-foreground">
                No marketplace activity yet
              </p>
              <p className="mx-auto max-w-sm text-xs">
                Completed orders will populate the monthly GMV, revenue and
                signup figures as soon as the first orders land.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3 text-right">Orders</th>
                    <th className="px-6 py-3 text-right">New users</th>
                    <th className="px-6 py-3 text-right">GMV</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
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
                      <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground">
                        {point.newUsers}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-foreground">
                        {taka(point.gmv)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {taka(point.revenue)}
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
            href="/admin/wallet"
            className="font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            Open platform ledger
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/dashboard"
            className="font-medium text-rose-600 hover:underline dark:text-rose-400"
          >
            Back to dashboard
          </Link>
          {isRootAdmin && (
            <>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/account/settings"
                className="font-medium text-rose-600 hover:underline dark:text-rose-400"
              >
                Account settings
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type MetricTone = "rose" | "emerald" | "amber" | "indigo";

const TONE_CLASSES: Record<MetricTone, { card: string; icon: string }> = {
  rose: {
    card: "border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
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
