import { BACKEND_URL, getApiHeaders } from "./api-client";

/** Purchasable membership plans, mirroring the backend Prisma enum. */
export type SubscriptionPlan =
  | "MEMBER_MONTHLY"
  | "MEMBER_QUARTERLY"
  | "MEMBER_YEARLY";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export type SubscriptionGateway = "aamarpay" | "piprapay" | "sandbox";

export interface MembershipPlan {
  plan: SubscriptionPlan;
  name: string;
  tagline: string;
  /** Price in poisha (1 BDT = 100 poisha). */
  price: number;
  currency: string;
  durationDays: number;
  monthlyEquivalent: number;
  savingsPercent: number;
  features: string[];
  highlight?: boolean;
}

/**
 * Membership state for the signed-in user, as returned by `/subscriptions/me`.
 * `isMember` is the authoritative answer to "does this user hold the MEMBER role
 * right now" — it already accounts for expiry on the server.
 */
export interface MembershipSummary {
  isMember: boolean;
  plan: SubscriptionPlan | null;
  planName: string | null;
  status: SubscriptionStatus | null;
  startedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  autoRenew: boolean;
  subscriptionId: string | null;
}

export interface MembershipCheckoutResult {
  subscriptionId: string;
  plan: SubscriptionPlan;
  planName: string;
  amount: number;
  currency: string;
  durationDays: number;
  gateway: SubscriptionGateway;
  paymentUrl: string | null;
  transactionRef: string | null;
  sandbox: boolean;
  expiresAt: string;
}

/** Empty membership state used before the first load and for guests. */
export const NO_MEMBERSHIP: MembershipSummary = {
  isMember: false,
  plan: null,
  planName: null,
  status: null,
  startedAt: null,
  expiresAt: null,
  daysRemaining: null,
  autoRenew: false,
  subscriptionId: null,
};

/** Formats a poisha amount as a human BDT string (e.g. 49900 -> "৳499"). */
export function formatBdt(poisha: number, options?: { withPoisha?: boolean }): string {
  const bdt = poisha / 100;
  const fractionDigits =
    options?.withPoisha || !Number.isInteger(bdt) ? 2 : 0;
  return `৳${bdt.toLocaleString("en-BD", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

async function readEnvelope<T>(res: Response): Promise<T> {
  const envelope = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      envelope?.message ||
      envelope?.error ||
      `Request failed with status ${res.status}`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = res.status;
    error.code = envelope?.code;
    throw error;
  }
  return envelope?.data as T;
}

/** Public plan catalogue — safe to call without a session. */
export async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  const res = await fetch(`${BACKEND_URL}/subscriptions/plans`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  const data = await readEnvelope<{ plans: MembershipPlan[] }>(res);
  return data.plans ?? [];
}

/** Current user's membership state. */
export async function fetchMyMembership(): Promise<MembershipSummary> {
  const res = await fetch(`${BACKEND_URL}/subscriptions/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return readEnvelope<MembershipSummary>(res);
}

/**
 * Starts a purchase. Nothing is granted until `confirmMembership` verifies the
 * payment with the gateway server-side.
 */
export async function checkoutMembership(
  plan: SubscriptionPlan,
  gateway: SubscriptionGateway = "sandbox"
): Promise<MembershipCheckoutResult> {
  const res = await fetch(`${BACKEND_URL}/subscriptions/checkout`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify({ plan, gateway }),
  });
  return readEnvelope<MembershipCheckoutResult>(res);
}

/** Confirms and activates a pending purchase (idempotent). */
export async function confirmMembership(
  subscriptionId: string,
  reference?: string
): Promise<MembershipSummary> {
  const res = await fetch(`${BACKEND_URL}/subscriptions/confirm`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify({ subscriptionId, ...(reference ? { reference } : {}) }),
  });
  return readEnvelope<MembershipSummary>(res);
}

/** Turns off auto-renewal; access continues until the paid period ends. */
export async function cancelMembership(): Promise<MembershipSummary> {
  const res = await fetch(`${BACKEND_URL}/subscriptions/cancel`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
  });
  return readEnvelope<MembershipSummary>(res);
}
