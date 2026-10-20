import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export type PaymentGatewayType = "AAMARPAY" | "PIPRAPAY" | "MOCK_SANDBOX";

export interface InitiatePaymentPayload {
  orderId: string;
  gateway: PaymentGatewayType;
  clientReturnUrl?: string;
}

export interface PaymentInitiationResponse {
  paymentUrl: string;
  gateway: PaymentGatewayType;
  transactionId: string;
  orderId: string;
  amount: number;
}

export interface VerifyPaymentPayload {
  orderId: string;
  transactionRef?: string;
}

export interface VerifyPaymentResponse {
  funded: boolean;
  orderId: string;
  status: string;
  escrow?: any;
}

export async function initiatePayment(
  payload: InitiatePaymentPayload,
): Promise<PaymentInitiationResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/payments/initiate`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to initialize payment gateway");
  }

  return envelope.data;
}

export async function verifyPayment(
  payload: VerifyPaymentPayload,
): Promise<VerifyPaymentResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/payments/verify`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to verify payment status");
  }

  return envelope.data;
}

/**
 * Customer / Member wallet ledger — escrow deposits, releases, refunds and
 * membership subscription payments derived from the caller's own orders.
 */
export interface PaymentHistoryEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  amount: number;
  type: "ESCROW_DEPOSIT" | "ESCROW_RELEASE" | "REFUND" | "SUBSCRIPTION";
  status: string;
  gateway: string | null;
  transactionRef: string | null;
  occurredAt: string;
  vendorName: string | null;
}

export interface PaymentHistoryResponse {
  summary: {
    totalSpent: number;
    inEscrow: number;
    totalRefunded: number;
    pendingPaymentCount: number;
    subscriptionSpend: number;
    ordersCount: number;
  };
  entries: PaymentHistoryEntry[];
  orders: Array<{
    id: string;
    orderNumber: string;
    title: string;
    totalAmount: number;
    platformFee: number;
    status: string;
    escrowStatus: string | null;
    gateway: string | null;
    transactionRef: string | null;
    fundedAt: string | null;
    releasedAt: string | null;
    refundedAt: string | null;
    vendorName: string | null;
    deadline: string;
    createdAt: string;
  }>;
}

export async function fetchPaymentHistory(): Promise<PaymentHistoryResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/payments/history`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (typeof envelope?.message === "string" && envelope.message) ||
        "Failed to fetch payment history",
    );
  }

  return envelope.data;
}

/**
 * Staff-only platform ledger — every vendor wallet movement, escrow holdings
 * and revenue / withdrawal totals.
 */
export interface PlatformLedgerResponse {
  summary: {
    totalEscrowHeld: number;
    totalPlatformRevenue: number;
    totalGMV: number;
    totalWithdrawn: number;
    escrowHeldCount: number;
    completedOrdersCount: number;
  };
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    payoutMethod: string | null;
    payoutAccount: string | null;
    vendorName: string | null;
    vendorEmail: string | null;
    vendorUniversity: string | null;
    createdAt: string;
  }>;
  escrowMovements: Array<{
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    status: string;
    gateway: string | null;
    customerName: string | null;
    releasedAt: string | null;
    refundedAt: string | null;
    updatedAt: string;
  }>;
}

export async function fetchPlatformLedger(): Promise<PlatformLedgerResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/payments/ledger`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (typeof envelope?.message === "string" && envelope.message) ||
        "Failed to fetch platform ledger",
    );
  }

  return envelope.data;
}
