import { BACKEND_URL, getApiHeaders } from "./api-client";

/**
 * Role-scoped reporting client.
 *
 *   GET /analytics/earnings → own helper earnings report (VENDOR+)
 *   GET /analytics/platform → platform-wide KPIs and 12-month series (staff)
 *
 * Both endpoints are resolved through the caller's own identity on the server,
 * so no user id is ever sent from the browser.
 */

export interface VendorAnalyticsReport {
  /** False when the account has no helper profile yet (staff, new accounts). */
  hasHelperProfile: boolean;
  summary: {
    availableBalance: number;
    pendingBalance: number;
    pendingEscrow: number;
    totalEarned: number;
    totalWithdrawn: number;
    completedOrdersCount: number;
    earningsLast30Days: number;
    avgOrderValue: number;
  };
  series: Array<{
    /** `YYYY-MM` in UTC. */
    month: string;
    gross: number;
    earnings: number;
    orders: number;
  }>;
}

export interface PlatformAnalyticsReport {
  summary: {
    totalGMV: number;
    totalPlatformRevenue: number;
    totalEscrowHeld: number;
    totalWithdrawn: number;
    completedOrdersCount: number;
    pendingVerificationsCount: number;
    openDisputesCount: number;
    registeredUsersCount: number;
  };
  series: Array<{
    /** `YYYY-MM` in UTC. */
    month: string;
    gmv: number;
    revenue: number;
    orders: number;
    newUsers: number;
  }>;
}

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  const envelope = (await res.json().catch(() => null)) as {
    data?: T;
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(
      (typeof envelope?.message === "string" && envelope.message) || fallback,
    );
  }

  if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
    throw new Error("The server returned an unexpected response");
  }

  return envelope.data as T;
}

/** Own earnings report: balance, escrow and the trailing 12-month series. */
export async function fetchVendorAnalyticsReport(): Promise<VendorAnalyticsReport> {
  const res = await fetch(`${BACKEND_URL}/analytics/earnings`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  return unwrap<VendorAnalyticsReport>(res, "Failed to fetch earnings report");
}

/** Platform-wide KPIs and growth series (staff only). */
export async function fetchPlatformAnalyticsReport(): Promise<PlatformAnalyticsReport> {
  const res = await fetch(`${BACKEND_URL}/analytics/platform`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  return unwrap<PlatformAnalyticsReport>(
    res,
    "Failed to fetch platform analytics",
  );
}
