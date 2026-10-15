"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

/**
 * Workspace-scoped error boundary.
 *
 * Keeps a single failing dashboard view from taking down the whole app shell,
 * so the user can still navigate to another section via the sidebar.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard route error boundary caught:", error);
  }, [error]);

  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">
              This view could not be loaded
            </h2>
            <p className="text-xs text-muted-foreground">
              The rest of your workspace is still available from the sidebar.
            </p>
          </div>
        </div>
        {error.digest && (
          <p className="font-mono text-[11px] text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className={cn(buttonVariants({ size: "sm" }), "cursor-pointer gap-1.5")}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
