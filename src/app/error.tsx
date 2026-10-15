"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

/**
 * Root error boundary.
 *
 * Without this, any render-time exception blanks the whole route. It renders its
 * own minimal chrome because the root layout is providers-only.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the failure for observability without leaking it to the user.
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-16">
      <Card className="w-full max-w-lg border-destructive/30">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This page failed to render. Your account, orders and escrow are
              unaffected — try again, and contact support if it keeps happening.
            </p>
            {error.digest && (
              <p className="font-mono text-[11px] text-muted-foreground">
                Reference: {error.digest}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants(), "cursor-pointer gap-2")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
