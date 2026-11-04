"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Layers } from "lucide-react";
import { cn } from "cn";

import {
  type DeliveryMode,
  type DeliverableFormat,
  type MarketplaceCategory,
} from "@/config/marketplace/types";
import { enabledEducationTracks } from "@/config/marketplace/education";
import { DELIVERY_MODE_LABELS, DELIVERABLE_FORMAT_LABELS } from "@/config/marketplace/delivery";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Generic landing page for a marketplace category.
 *
 * Powered by the marketplace taxonomy config. It exposes discovery filters
 * (education track, delivery mode, deliverable format) and links into the
 * real gigs and job-board search APIs, so the page is never an empty shell.
 *
 * Subcategory links point at `/assistance/<category-slug>/<subcategory-slug>`
 * and are left as discovery entry points; the backend filters listings by
 * category/subcategory/level.
 */
export function MarketplaceCategoryPage({
  category,
}: {
  category: MarketplaceCategory;
}) {
  const tracks = enabledEducationTracks();

  const gigsUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (category.gigCategory) params.set("category", category.gigCategory);
    return `/gigs?${params.toString()}`;
  }, [category.gigCategory]);

  const jobsUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (category.gigCategory) params.set("category", category.gigCategory);
    return `/assignments?${params.toString()}`;
  }, [category.gigCategory]);

  const deliveryModes = category.defaultDeliveryModes ?? [];
  const deliverableFormats = category.defaultDeliverableFormats ?? [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-foreground">{category.title}</span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mb-10">
        <Badge variant="outline" className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400">
          <Layers className="mr-1 h-3 w-3" aria-hidden="true" />
          Academic category
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {category.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {category.description}
        </p>

        {category.policyClassification && category.defaultPolicy && (
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Default service policy:{" "}
            <span className="capitalize">{category.defaultPolicy}</span>
          </p>
        )}
      </header>

      {/* Discovery filters */}
      <section className="mb-10 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold text-muted-foreground">
            Filter discovery
          </span>
          {tracks.map((track) => (
            <Link
              key={track.slug}
              href={`/gigs?track=${track.slug}&category=${category.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-border hover:text-foreground"
            >
              {track.title}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Delivery mode
            </h3>
            <div className="flex flex-wrap gap-1">
              {deliveryModes.map((mode) => (
                <span
                  key={mode}
                  className="rounded-full border border-border/60 px-2.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {DELIVERY_MODE_LABELS[mode]}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Deliverable format
            </h3>
            <div className="flex flex-wrap gap-1">
              {deliverableFormats.map((format) => (
                <span
                  key={format}
                  className="rounded-full border border-border/60 px-2.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {DELIVERABLE_FORMAT_LABELS[format]}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Location (Bangladesh)
            </h3>
            <p className="text-xs text-muted-foreground">
              Filter in-person services by division, district, city or area.
            </p>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <section className="mb-10" aria-labelledby="subcategories-heading">
          <h2 id="subcategories-heading" className="text-lg font-bold text-foreground mb-4">
            Subcategories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {category.subcategories.map((sub) => (
              <Card
                key={sub.slug}
                className="border-border/60 hover:border-indigo-500/40 transition-colors"
              >
                <CardContent className="p-5">
                  <Link
                    href={`/assistance/${category.slug}/${sub.slug}`}
                    className="block"
                  >
                    <CardTitle className="text-sm font-semibold">{sub.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {sub.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:underline">
                      Browse <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Calls to action */}
      <section className="mt-14 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Browse available services
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Ready-made service packages from verified helpers. Filter by
              education track, subject and delivery mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={gigsUrl}
              className={cn(
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700",
                "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
              )}
            >
              Service gigs <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href={jobsUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Open job requests <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export type { DeliveryMode, DeliverableFormat };
