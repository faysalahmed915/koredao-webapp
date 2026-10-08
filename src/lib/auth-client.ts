"use client";

import { createAuthClient } from "better-auth/react";

export const AUTH_STORAGE_KEY = "better-auth.session_token";

/**
 * Returns stored session token from browser localStorage
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      localStorage.getItem("bearer_token") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Persists or clears active session token in browser localStorage
 */
export function setStoredAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem("bearer_token", token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("bearer_token");
    }
  } catch {
    // Graceful fallback if storage quota exceeded or restricted
  }
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: () => getStoredAuthToken() || "",
    },
    onResponse: (context) => {
      if (typeof window !== "undefined") {
        const token =
          context.response.headers.get("set-auth-token") ||
          context.response.headers.get("Set-Auth-Token");
        if (token) {
          setStoredAuthToken(token);
        }
      }
    },
  },
});

const rawSignOut = authClient.signOut;

export const signOut: typeof rawSignOut = async (options) => {
  setStoredAuthToken(null);
  return rawSignOut(options);
};

export const {
  signIn,
  signUp,
  useSession,
} = authClient;

