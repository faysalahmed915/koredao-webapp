import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

/**
 * Safe subset of a user account as returned by the NestJS users module
 * (`USER_SAFE_SELECT`). Never contains password hashes or provider tokens.
 */
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  realName?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches the authenticated user's own account via `GET /users/profile`.
 * Returns null when the session is missing or the request fails so callers
 * can fall back to the better-auth session payload.
 */
export async function fetchMyUserAccount(): Promise<UserAccount | null> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
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

/**
 * Fetches any user's public account record via `GET /users/:id`.
 */
export async function fetchUserAccountById(id: string): Promise<UserAccount> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to fetch user account");
  }

  return envelope.data;
}

/**
 * Updates the user's own account (display name, email, avatar) via
 * `PATCH /users/:id`. Self-service updates are allowed by the backend's
 * `@AllowSelf('id')` guard. `role` is intentionally not accepted here —
 * the backend restricts role changes to administrators.
 */
export async function updateMyUserAccount(payload: {
  name?: string;
  email?: string;
  image?: string;
}): Promise<UserAccount> {
  const id = (await fetchMyUserAccount())?.id;
  if (!id) {
    throw new Error("You must be signed in to update your account");
  }

  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update account");
  }

  return envelope.data;
}

/**
 * Updates an arbitrary user's account by id (admin/moderation flows).
 */
export async function updateUserAccount(
  id: string,
  payload: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  },
): Promise<UserAccount> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to update account");
  }

  return envelope.data;
}
