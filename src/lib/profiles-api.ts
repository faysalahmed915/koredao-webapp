export interface HandwritingSample {
  id: string;
  sampleUrl: string;
  style: "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION";
  neatnessScore: number;
  description?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  university: string;
  department: string;
  academicLevel: "UNDERGRADUATE" | "GRADUATE" | "POSTGRADUATE" | "DOCTORATE" | "OTHER";
  degree?: string;
  passingYear?: number;
  bio?: string;
  skills: string[];
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  idCardUrl?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  rating: number;
  totalReviews: number;
  completedOrders: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    image?: string;
    role?: string;
  };
  handwritingSamples?: HandwritingSample[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  university?: string;
  department?: string;
  phone?: string;
  campus?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";

export async function fetchMyVendorProfile(): Promise<VendorProfile | null> {
  const res = await fetch(`${BACKEND_URL}/profiles/vendor/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const envelope = await res.json();
  return envelope?.data ?? null;
}

export async function submitVendorApplication(payload: {
  university: string;
  department: string;
  academicLevel?: string;
  degree?: string;
  passingYear?: number;
  bio?: string;
  skills?: string[];
  idCardUrl: string;
  handwritingSamples?: Array<{
    sampleUrl: string;
    style: string;
    neatnessScore?: number;
    description?: string;
  }>;
}): Promise<VendorProfile> {
  const res = await fetch(`${BACKEND_URL}/profiles/vendor/apply`, {
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
    throw new Error(envelope?.message || "Failed to submit vendor application");
  }

  return envelope.data;
}

export async function searchVendors(params: {
  search?: string;
  university?: string;
  department?: string;
  handwritingStyle?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: VendorProfile[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.university) query.set("university", params.university);
  if (params.department) query.set("department", params.department);
  if (params.handwritingStyle) query.set("handwritingStyle", params.handwritingStyle);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/profiles/vendor/search?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to search vendors");
  }

  return envelope.data;
}

export async function fetchPublicVendorProfile(id: string): Promise<VendorProfile> {
  const res = await fetch(`${BACKEND_URL}/profiles/vendor/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Vendor not found");
  }

  return envelope.data;
}

export async function fetchPendingApplications(page = 1, limit = 10): Promise<{
  items: VendorProfile[];
  total: number;
  totalPages: number;
}> {
  const res = await fetch(`${BACKEND_URL}/profiles/admin/pending?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch pending applications");
  }

  return envelope.data;
}

export async function reviewVendorApplication(
  profileId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
): Promise<VendorProfile> {
  const res = await fetch(`${BACKEND_URL}/profiles/admin/review/${profileId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify({ status, rejectionReason }),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to review application");
  }

  return envelope.data;
}
