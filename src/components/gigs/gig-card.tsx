"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Clock, PenTool } from "lucide-react";
import { cn } from "cn";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { GigCardProps } from "./gig-types";

/**
 * Reusable gig card.
 *
 * Extracted from `src/app/(site)/gigs/page.tsx` so the same card can be
 * rendered from `/categories/[slug]`, `/gigs`, or later from `(dashboard)`
 * without any changes. All page-level data fetching stays in the page;
 * this component only renders what it receives.
 */
export function GigCard({
  gig,
  detailHref,
  showCta = true,
}: GigCardProps) {
  const href = detailHref ?? `/gigs/${gig.slug}`;

  return (
    <Card className="border-border/60 transition-colors hover:border-indigo-500/40">
      <CardContent className="flex flex-col gap-2 p-4">
        {/* Vendor Badge */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={gig.vendorProfile?.user?.image || ""} />
            <AvatarFallback className="text-[10px] bg-indigo-500/10 text-indigo-600">
              {gig.vendorProfile?.user?.name?.slice(0, 2).toUpperCase() || "KH"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-medium text-foreground truncate block">
              {gig.vendorProfile?.user?.name || "Helper"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate block">
              {gig.vendorProfile?.university}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={href} className="block">
          <CardTitle className="mt-2.5 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {gig.title}
          </CardTitle>
        </Link>

        {/* Subject Tags */}
        {gig.subjectTags && gig.subjectTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {gig.subjectTags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-amber-500" />
            {gig.rating > 0 ? gig.rating.toFixed(1) : "New"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {gig.deliveryDays}d delivery
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 p-4 pt-3">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          From
        </span>
        <div className="text-right">
          <span className="text-base font-extrabold text-foreground">
            ৳{gig.priceFrom}
          </span>
        </div>
        {showCta && (
          <Link
            href={href}
            className="inline-flex w-full items-center justify-center gap-2 border border-border bg-muted text-xs font-semibold py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 transition-colors"
          >
            Order
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
