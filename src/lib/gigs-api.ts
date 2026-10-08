export interface GigPackage {
  name: string;
  price: number;
  deliveryDays: number;
  revisions?: number;
  description?: string;
  features?: string[];
}

export interface GigAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
}

export interface Gig {
  id: string;
  vendorProfileId: string;
  title: string;
  slug: string;
  description: string;
  category:
  | "ASSIGNMENT"
  | "LAB_REPORT"
  | "THESIS_RESEARCH"
  | "HANDWRITTEN_HARDCOPY"
  | "MATH_PROBLEM_SOLVING"
  | "PRESENTATION_SLIDES"
  | "OTHER";
  subjectTags: string[];
  coverImages: string[];
  tierType: "SINGLE" | "TIERED";
  priceFrom: number;
  deliveryDays: number;
  packages: GigPackage[];
  requiresHardcopy: boolean;
  handwritingStyle?: "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION";
  isActive: boolean;
  orderCount: number;
  rating: number;
  totalReviews: number;
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
      description?: string;
    }>;
  };
  attachments?: GigAttachment[];
}

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export async function searchGigs(params: {
  search?: string;
  category?: string;
  subject?: string;
  university?: string;
  requiresHardcopy?: boolean;
  handwritingStyle?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDeliveryDays?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: Gig[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.subject) query.set("subject", params.subject);
  if (params.university) query.set("university", params.university);
  if (params.requiresHardcopy !== undefined) query.set("requiresHardcopy", String(params.requiresHardcopy));
  if (params.handwritingStyle) query.set("handwritingStyle", params.handwritingStyle);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.maxDeliveryDays !== undefined) query.set("maxDeliveryDays", String(params.maxDeliveryDays));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/gigs/search?${query.toString()}`, {
    method: "GET",
    headers: getApiHeaders(),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to search gigs");
  }

  return envelope.data;
}

export async function fetchGigBySlug(slug: string): Promise<Gig> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/gigs/${slug}`, {
    method: "GET",
    headers: getApiHeaders(),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Gig not found");
  }

  return envelope.data;
}

export async function fetchMyGigs(): Promise<Gig[]> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/gigs/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch vendor gigs");
  }

  return envelope.data || [];
}

export async function createGig(payload: {
  title: string;
  description: string;
  category: string;
  subjectTags?: string[];
  coverImages?: string[];
  tierType: "SINGLE" | "TIERED";
  packages: GigPackage[];
  requiresHardcopy?: boolean;
  handwritingStyle?: string;
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileType?: string;
    fileSize?: number;
    isPublicDemo?: boolean;
  }>;
}): Promise<Gig> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/gigs`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to create gig");
  }

  return envelope.data;
}

export async function deleteGig(id: string): Promise<void> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/gigs/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    const envelope = await res.json();
    throw new Error(envelope?.message || "Failed to delete gig");
  }
}
