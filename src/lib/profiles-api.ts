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

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export async function fetchMyVendorProfile(): Promise<VendorProfile | null> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/vendor/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const envelope = await res.json();
  return envelope?.data ?? null;
}

export async function updateMyVendorProfile(payload: {
  university?: string;
  department?: string;
  academicLevel?: string;
  degree?: string;
  passingYear?: number;
  bio?: string;
  skills?: string[];
}): Promise<VendorProfile> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/vendor/me`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update vendor profile");
  }

  return envelope.data;
}

export async function fetchMyCustomerProfile(): Promise<CustomerProfile | null> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/customer/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const envelope = await res.json();
  return envelope?.data ?? null;
}

export async function updateMyCustomerProfile(payload: {
  university?: string;
  department?: string;
  phone?: string;
  campus?: string;
}): Promise<CustomerProfile> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/customer/me`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update customer profile");
  }

  return envelope.data;
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
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/vendor/apply`, {
    method: "POST",
    headers: getApiHeaders(),
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

  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/vendor/search?${query.toString()}`, {
    method: "GET",
    headers: getApiHeaders(),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to search vendors");
  }

  return envelope.data;
}

export async function fetchPublicVendorProfile(id: string): Promise<VendorProfile> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/vendor/${id}`, {
    method: "GET",
    headers: getApiHeaders(),
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
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/admin/pending?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: getApiHeaders(),
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
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/profiles/admin/review/${profileId}`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify({ status, rejectionReason }),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to review application");
  }

  return envelope.data;
}
