export interface EscrowHolding {
  id: string;
  orderId: string;
  amount: number;
  status: "AWAITING_PAYMENT" | "HELD" | "RELEASED_TO_VENDOR" | "REFUNDED_TO_CUSTOMER";
  paymentGateway?: string;
  transactionRef?: string;
  fundedAt?: string;
  releasedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorProfileId: string;
  gigId?: string;
  assignmentId?: string;
  bidId?: string;
  packageName?: string;
  title: string;
  totalAmount: number;
  platformFee: number;
  netVendorAmount: number;
  status:
    | "PENDING_PAYMENT"
    | "ESCROW_HELD"
    | "IN_PROGRESS"
    | "DELIVERED"
    | "UNDER_REVIEW"
    | "COMPLETED"
    | "DISPUTED"
    | "REFUNDED"
    | "CANCELLED";
  deadline: string;
  maxRevisions: number;
  usedRevisions: number;
  deliveredAt?: string;
  autoReleaseAt?: string;
  completedAt?: string;
  deliveryFiles: string[];
  deliveryNotes?: string;
  revisionNotes?: string;
  disputeReason?: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    image?: string;
  };
  vendorProfile?: {
    id: string;
    userId: string;
    university: string;
    department: string;
    academicLevel: string;
    rating: number;
    totalReviews: number;
    user?: {
      id: string;
      name: string;
      email?: string;
      image?: string;
    };
  };
  escrowHolding?: EscrowHolding;
  gig?: {
    id: string;
    title: string;
    slug: string;
    category: string;
  };
  assignment?: {
    id: string;
    title: string;
    subject: string;
    type: string;
  };
}

export interface VendorWallet {
  id: string;
  vendorProfileId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: "ESCROW_RELEASE" | "WITHDRAWAL" | "REFUND" | "PLATFORM_FEE";
    description: string;
    payoutMethod?: string;
    payoutAccount?: string;
    createdAt: string;
  }>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";

export async function createOrder(payload: {
  gigId?: string;
  packageIndex?: number;
  assignmentId?: string;
  bidId?: string;
}): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders`, {
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
    throw new Error(envelope?.message || "Failed to create order");
  }

  return envelope.data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch orders");
  }

  return envelope.data || [];
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Order not found");
  }

  return envelope.data;
}

export async function fundEscrow(
  orderId: string,
  gateway = "MOCK_SANDBOX",
  transactionRef?: string,
): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${orderId}/fund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify({ paymentGateway: gateway, transactionRef }),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fund escrow");
  }

  return envelope.data;
}

export async function submitDelivery(
  orderId: string,
  payload: { deliveryFiles: string[]; deliveryNotes?: string },
): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${orderId}/deliver`, {
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
    throw new Error(envelope?.message || "Failed to submit delivery");
  }

  return envelope.data;
}

export async function acceptDelivery(orderId: string): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${orderId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to accept delivery");
  }

  return envelope.data;
}

export async function requestRevision(
  orderId: string,
  revisionNotes: string,
): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${orderId}/revision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify({ revisionNotes }),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to request revision");
  }

  return envelope.data;
}

export async function raiseDispute(
  orderId: string,
  disputeReason: string,
): Promise<Order> {
  const res = await fetch(`${BACKEND_URL}/orders/${orderId}/dispute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify({ disputeReason }),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to raise dispute");
  }

  return envelope.data;
}

export async function fetchVendorWallet(): Promise<VendorWallet> {
  const res = await fetch(`${BACKEND_URL}/orders/wallet`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch vendor wallet");
  }

  return envelope.data;
}

export async function requestWithdrawal(payload: {
  amount: number;
  payoutMethod: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  payoutAccount: string;
}): Promise<{ wallet: VendorWallet; transaction: any }> {
  const res = await fetch(`${BACKEND_URL}/orders/wallet/withdraw`, {
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
    throw new Error(envelope?.message || "Failed to process withdrawal");
  }

  return envelope.data;
}

