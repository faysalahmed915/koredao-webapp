export interface DraftAssignment {
  id: string;
  userId: string;
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
  sampleFileUrls: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export async function fetchMyDrafts(): Promise<DraftAssignment[]> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts/me`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to load drafts");
  }

  return Array.isArray(envelope?.data) ? envelope.data : [];
}

export async function fetchDraft(id: string): Promise<DraftAssignment> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts/${id}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Draft not found");
  }

  return envelope.data;
}

export interface CreateDraftPayload {
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
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export async function createDraft(payload: CreateDraftPayload): Promise<DraftAssignment> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to create draft");
  }

  return envelope.data;
}

export interface UpdateDraftPayload {
  title?: string;
  description?: string;
  category?: string;
  subject?: string;
  type?: "SOFTCOPY" | "HARDCOPY";
  deadline?: string;
  budgetMin?: number;
  budgetMax?: number;
  deliveryAddress?: string | null;
  preferredCampus?: string | null;
  preferredHandwritingStyle?: string | null;
  sampleFileUrls?: string[];
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export async function updateDraft(
  id: string,
  payload: UpdateDraftPayload,
): Promise<DraftAssignment> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts/${id}`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update draft");
  }

  return envelope.data;
}

export async function deleteDraft(id: string): Promise<{ id: string; deleted: boolean }> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to delete draft");
  }

  return envelope.data;
}

export interface PublishDraftPayload {
  title?: string;
  description?: string;
}

export async function publishDraft(
  id: string,
  payload?: PublishDraftPayload,
): Promise<{ assignment: { id: string }; draftId: string }> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/drafts/${id}/publish`, {
    method: "POST",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload ?? {}),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to publish draft");
  }

  return envelope.data;
}
