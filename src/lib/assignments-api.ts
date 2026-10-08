export interface Bid {
  id: string;
  assignmentId: string;
  vendorProfileId: string;
  proposedPrice: number;
  deliveryDays: number;
  coverLetter: string;
  sampleUrls: string[];
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  vendorProfile?: {
    id: string;
    university: string;
    department: string;
    academicLevel: string;
    degree?: string;
    rating: number;
    totalReviews: number;
    completedOrders: number;
    user?: {
      id: string;
      name: string;
      image?: string;
    };
    handwritingSamples?: Array<{
      id: string;
      sampleUrl: string;
      style: string;
      neatnessScore: number;
    }>;
  };
}

export interface Assignment {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category:
  | "ASSIGNMENT"
  | "LAB_REPORT"
  | "THESIS_RESEARCH"
  | "HANDWRITTEN_HARDCOPY"
  | "MATH_PROBLEM_SOLVING"
  | "PRESENTATION_SLIDES"
  | "OTHER";
  subject: string;
  type: "SOFTCOPY" | "HARDCOPY";
  deadline: string;
  budgetMin: number;
  budgetMax: number;
  deliveryAddress?: string;
  preferredCampus?: string;
  preferredHandwritingStyle?: "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION";
  sampleFileUrls: string[];
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  bidsCount: number;
  acceptedBidId?: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    image?: string;
    createdAt?: string;
  };
  bids?: Bid[];
}

// const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function searchAssignments(params: {
  search?: string;
  category?: string;
  subject?: string;
  type?: string;
  preferredCampus?: string;
  handwritingStyle?: string;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: Assignment[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.subject) query.set("subject", params.subject);
  if (params.type) query.set("type", params.type);
  if (params.preferredCampus) query.set("preferredCampus", params.preferredCampus);
  if (params.handwritingStyle) query.set("handwritingStyle", params.handwritingStyle);
  if (params.minBudget !== undefined) query.set("minBudget", String(params.minBudget));
  if (params.maxBudget !== undefined) query.set("maxBudget", String(params.maxBudget));
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/assignments/search?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to search assignments");
  }

  return envelope.data;
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/assignments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Assignment not found");
  }

  return envelope.data;
}

export async function createAssignment(payload: {
  title: string;
  description: string;
  category: string;
  subject: string;
  type: "SOFTCOPY" | "HARDCOPY";
  deadline: string;
  budgetMin: number;
  budgetMax: number;
  deliveryAddress?: string;
  preferredCampus?: string;
  preferredHandwritingStyle?: string;
  sampleFileUrls?: string[];
}): Promise<Assignment> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/assignments`, {
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
    throw new Error(envelope?.message || "Failed to post assignment");
  }

  return envelope.data;
}

export async function submitBid(
  assignmentId: string,
  payload: {
    proposedPrice: number;
    deliveryDays: number;
    coverLetter: string;
    sampleUrls?: string[];
  },
): Promise<Bid> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/assignments/${assignmentId}/bids`, {
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
    throw new Error(envelope?.message || "Failed to submit proposal");
  }

  return envelope.data;
}

export async function acceptBid(
  assignmentId: string,
  bidId: string,
): Promise<{ assignment: Assignment; acceptedBid: Bid }> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/assignments/${assignmentId}/bids/${bidId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to accept bid");
  }

  return envelope.data;
}
