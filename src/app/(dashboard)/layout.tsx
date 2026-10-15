"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { useSession } from "@/lib/auth-client";

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
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const isAuthenticated = Boolean(session?.user);

  React.useEffect(() => {
    if (isPending || isAuthenticated) return;

    toast.error("Please sign in to continue");
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isPending, isAuthenticated, pathname, router]);

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

  return <DashboardShell>{children}</DashboardShell>;
}
