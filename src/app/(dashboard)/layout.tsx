"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { useSession } from "@/lib/auth-client";
import { buildLoginHref } from "@/lib/auth-redirect";
import { ChatSocketProvider } from "@/components/chat/socket-provider";

/**
 * Authenticated workspace shell.
 *
 * Every route in this group requires a session, so the guard lives here once
 * instead of being repeated in each page. `redirect` carries the original
 * destination so the login page can send the user straight back.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const isAuthenticated = Boolean(session?.user);

  React.useEffect(() => {
    if (isPending || isAuthenticated) return;

    // buildLoginHref() snapshots the live location (path + query) into
    // `?redirect=` and saves the current scroll position, so re-login returns
    // the visitor to this exact page and offset. Both are read from `window`
    // (not URL params) so there is no injection surface.
    toast.error("Please sign in to continue");
    router.replace(buildLoginHref());
  }, [isPending, isAuthenticated, router]);

  if (isPending || !isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">
          Preparing your workspace…
        </p>
      </div>
    );
  }

  return (
    <ChatSocketProvider userId={session?.user?.id ?? null}>
      <DashboardShell>{children}</DashboardShell>
    </ChatSocketProvider>
  );
}
