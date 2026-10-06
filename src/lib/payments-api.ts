const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api/v1";

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
  const res = await fetch(`${BACKEND_URL}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
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
  const res = await fetch(`${BACKEND_URL}/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to verify payment status");
  }

  return envelope.data;
}
