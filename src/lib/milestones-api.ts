export interface ProjectCheckpoint {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  targetDate?: string;
  submittedFileUrl?: string;
  proofPhotoUrls: string[];
  courierTracking?: string;
  vendorNotes?: string;
  clientFeedback?: string;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "ACCEPTED" | "REVISION_REQUESTED";
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api/v1";

export async function fetchOrderCheckpoints(orderId: string): Promise<ProjectCheckpoint[]> {
  const res = await fetch(`${BACKEND_URL}/milestones/order/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch milestones");
  }

  return envelope.data || [];
}

export async function createCheckpoint(payload: {
  orderId: string;
  title: string;
  description?: string;
  targetDate?: string;
}): Promise<ProjectCheckpoint> {
  const res = await fetch(`${BACKEND_URL}/milestones`, {
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
    throw new Error(envelope?.message || "Failed to create checkpoint");
  }

  return envelope.data;
}

export async function submitCheckpointProgress(
  checkpointId: string,
  payload: {
    submittedFileUrl?: string;
    proofPhotoUrls?: string[];
    courierTracking?: string;
    vendorNotes?: string;
  },
): Promise<ProjectCheckpoint> {
  const res = await fetch(`${BACKEND_URL}/milestones/${checkpointId}/submit`, {
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
    throw new Error(envelope?.message || "Failed to submit progress");
  }

  return envelope.data;
}

export async function reviewCheckpoint(
  checkpointId: string,
  payload: {
    status: "ACCEPTED" | "REVISION_REQUESTED";
    clientFeedback?: string;
  },
): Promise<ProjectCheckpoint> {
  const res = await fetch(`${BACKEND_URL}/milestones/${checkpointId}/review`, {
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
    throw new Error(envelope?.message || "Failed to review checkpoint");
  }

  return envelope.data;
}

export async function deleteCheckpoint(checkpointId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BACKEND_URL}/milestones/${checkpointId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to delete checkpoint");
  }

  return envelope.data;
}
