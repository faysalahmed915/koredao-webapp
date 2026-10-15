"use client";

import * as React from "react";
import { useSession } from "@/lib/auth-client";
import {
  fetchMyMembership,
  NO_MEMBERSHIP,
  type MembershipSummary,
} from "@/lib/subscriptions-api";

interface MembershipContextValue {
  membership: MembershipSummary;
  /** True while the membership state for a signed-in user is still loading. */
  isLoading: boolean;
  /**
   * Set when the membership lookup failed. Consumers must treat this as
   * "unknown", never as "not a member" — otherwise a paying member is silently
   * shown the upgrade prompts and has their submit buttons removed.
   */
  error: string | null;
  /** Re-reads membership state from the backend (e.g. after a purchase). */
  refresh: () => Promise<void>;
}

const MembershipContext = React.createContext<MembershipContextValue>({
  membership: NO_MEMBERSHIP,
  isLoading: false,
  error: null,
  refresh: async () => {},
});

/**
 * Single source of truth for "is the signed-in user a MEMBER" on the client.
 *
 * Mounted once near the root so the header, the dashboard sidebar, the
 * membership page and every membership gate share one request instead of each
 * firing their own. The provider only fetches for authenticated users, so
 * anonymous browsing costs nothing.
 */
export function MembershipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id ?? null;

  const [membership, setMembership] =
    React.useState<MembershipSummary>(NO_MEMBERSHIP);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Guard against out-of-order responses and unmount writes.
  const requestId = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!userId) {
      setMembership(NO_MEMBERSHIP);
      setIsLoading(false);
      setError(null);
      return;
    }

    const current = ++requestId.current;
    setIsLoading(true);
    try {
      const next = await fetchMyMembership();
      if (current === requestId.current) {
        setMembership(next);
        setError(null);
      }
    } catch (err) {
      // Never read a failed lookup as "is not a member" silently — surface it so
      // the UI can ask the user to retry instead of upselling them.
      if (current === requestId.current) {
        setMembership(NO_MEMBERSHIP);
        setError(
          err instanceof Error
            ? err.message
            : "Could not check your membership status"
        );
      }
    } finally {
      if (current === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  React.useEffect(() => {
    if (isSessionPending) return;
    // Defer so the loading setState inside `load` is not synchronous within the
    // effect body (avoids the cascading-render lint rule and a double paint).
    queueMicrotask(() => {
      void load();
    });
  }, [isSessionPending, load]);

  const refresh = React.useCallback(async () => {
    await load();
  }, [load]);

  const value = React.useMemo(
    () => ({ membership, isLoading, error, refresh }),
    [membership, isLoading, error, refresh]
  );

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership(): MembershipContextValue {
  return React.useContext(MembershipContext);
}
