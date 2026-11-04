"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Gig } from "@/lib/gigs-api";
import { GigCard } from "./gig-card";
import type { GigsGridProps } from "./gig-types";

/**
 * Reusable gig listing grid.
 *
 * Renders a responsive grid of `GigCard` components. Accepts an optional
 * `detailHref` mapper so callers (e.g. dashboard) can point cards at their
 * own detail routes. No page-level data fetching — purely presentational.
 */
export function GigsGrid({
  gigs,
  loading = false,
  emptyMessage = "No gigs found matching your filters.",
  detailHref,
  showCta = true,
}: GigsGridProps) {
  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig) => (
          <GigCard
            key={gig.id}
            gig={gig}
            detailHref={detailHref ? detailHref(gig) : undefined}
            showCta={showCta}
          />
        ))}
      </div>
    </div>
  );
}
