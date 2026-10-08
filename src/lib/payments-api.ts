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
