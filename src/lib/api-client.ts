import { getStoredAuthToken } from "./auth-client";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";

/**
 * Constructs unified request headers for backend API requests.
 * Automatically injects:
 * - Content-Type: application/json (unless overridden)
 * - x-correlation-id for distributed telemetry
 * - Authorization: Bearer <token> from localStorage (bypassing third-party cookie restrictions)
 */
export function getApiHeaders(
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  const correlationId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `cid-${Date.now()}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-correlation-id": correlationId,
    ...customHeaders,
  };

  const token = getStoredAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
