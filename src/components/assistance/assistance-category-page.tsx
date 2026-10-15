"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Compass,
  Loader2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { cn } from "cn";

import {
  type AssistanceCategoryConfig,
  type AssistanceLevel,
} from "@/components/assistance/categories";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchAssignments, type Assignment } from "@/lib/assignments-api";
import { searchGigs, type Gig } from "@/lib/gigs-api";

/**
 * Landing page for one branch of the "Hire Assistance" taxonomy.
 *
 * Everything shown here comes from the real marketplace APIs filtered by the
 * service categories and level term configured for the branch, so the page can
 * never advertise content that does not exist — an empty result set renders an
 * honest empty state with the actions a visitor can take instead.
 */
export function AssistanceCategoryPage({
  config,
  levelSegments,
}: {
  config: AssistanceCategoryConfig;
  levelSegments: string[];
}) {
  const activeLevel: AssistanceLevel | undefined = React.useMemo(
    () =>
      levelSegments.length > 0
        ? config.levels.find((l) => l.slug === levelSegments[0])
        : undefined,
    [config.levels, levelSegments]
  );

  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [jobs, setJobs] = React.useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const searchTerm = activeLevel?.search;

  React.useEffect(() => {
    let cancelled = false;
    // Defer so the loading setState is not synchronous within the effect body.
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
        setHasError(false);
      }
    });

    // The API accepts a single category, so multi-category branches are merged.
    const gigRequests = config.categories.map((category) =>
      searchGigs({ category, search: searchTerm, limit: 6, sortBy: "rating" })
    );
    const jobRequests = config.categories.map((category) =>
      searchAssignments({ category, search: searchTerm, limit: 6, sortBy: "newest" })
    );

    Promise.all([Promise.all(gigRequests), Promise.all(jobRequests)])
      .then(([gigResults, jobResults]) => {
        if (cancelled) return;
        const dedupeById = <T extends { id: string }>(items: T[]) =>
          [...new Map(items.map((i) => [i.id, i])).values()];
        setGigs(
          dedupeById(gigResults.flatMap((r) => r.items ?? [])).slice(0, 6)
        );
        setJobs(
          dedupeById(jobResults.flatMap((r) => r.items ?? [])).slice(0, 6)
        );
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.categories, searchTerm]);

  const isEmpty = !isLoading && !hasError && gigs.length === 0 && jobs.length === 0;

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
            <Link href="/assistance" className="hover:text-foreground">
              Hire Assistance
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            {activeLevel ? (
              <Link href={`/assistance/${config.slug}`} className="hover:text-foreground">
                {config.title}
              </Link>
            ) : (
              <span className="text-foreground">{config.title}</span>
            )}
          </li>
          {activeLevel && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{activeLevel.label}</li>
            </>
          )}
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl">
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400"
        >
          <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
          Verified campus helpers
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {activeLevel ? activeLevel.label : config.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {activeLevel ? activeLevel.description : config.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {config.highlights.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </header>

      {/* Branch filters */}
      {config.levels.length > 0 && (
        <nav aria-label="Filter by level" className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/assistance/${config.slug}`}
            aria-current={!activeLevel ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              !activeLevel
                ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All levels
          </Link>
          {config.levels.map((level) => {
            const isActive = activeLevel?.slug === level.slug;
            return (
              <Link
                key={level.slug}
                href={`/assistance/${config.slug}/${level.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {level.label}
              </Link>
            );
          })}
        </nav>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading available assistance…
        </div>
      )}

      {!isLoading && hasError && (
        <Card className="mt-10 border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-semibold text-destructive">
              We could not load live listings right now
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please retry in a moment — your session and escrow are unaffected.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {isEmpty && (
        <Card className="mt-10 border-border/60">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              No {activeLevel ? activeLevel.label.toLowerCase() : ""} listings yet
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              Nothing has been posted in this branch so far. Post a request and
              verified helpers will send you proposals, or browse the full
              catalogue in the meantime.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              <Link
                href="/assignments/create"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                Post a request
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link href="/gigs" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Browse all services
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && gigs.length > 0 && (
        <section className="mt-12" aria-labelledby="services-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="services-heading" className="text-lg font-bold text-foreground">
                Helper services
              </h2>
              <p className="text-xs text-muted-foreground">
                Ready-made packages you can book directly.
              </p>
            </div>
            <Link
              href="/gigs"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"
            >
              All services <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <Card
                key={gig.id}
                className="flex flex-col border-border/60 transition-colors hover:border-indigo-500/40"
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="max-w-[60%] truncate font-semibold text-indigo-500">
                      {gig.vendorProfile?.university ?? "Verified helper"}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      {gig.rating.toFixed(1)}
                    </span>
                  </div>
                  <Link
                    href={`/gigs/${gig.slug}`}
                    className="line-clamp-2 text-sm font-bold text-foreground hover:text-indigo-600"
                  >
                    {gig.title}
                  </Link>
                  <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">
                    {gig.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground">
                      by {gig.vendorProfile?.user?.name ?? "Helper"}
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      ৳{gig.priceFrom}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!isLoading && !hasError && jobs.length > 0 && (
        <section className="mt-12" aria-labelledby="jobs-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="jobs-heading" className="text-lg font-bold text-foreground">
                Open job requests
              </h2>
              <p className="text-xs text-muted-foreground">
                Students looking for a helper right now — bidding requires membership.
              </p>
            </div>
            <Link
              href="/assignments"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"
            >
              Job board <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="border-border/60 transition-colors hover:border-emerald-500/40"
              >
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {job.subject}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {job.type === "HARDCOPY" ? "Hardcopy" : "Softcopy"}
                    </Badge>
                  </div>
                  <Link
                    href={`/assignments/${job.id}`}
                    className="line-clamp-1 text-sm font-bold text-foreground hover:text-indigo-600"
                  >
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      Due {new Date(job.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.bidsCount} proposals
                    </span>
                    <span className="font-bold text-foreground">
                      ৳{job.budgetMin}–{job.budgetMax}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="mt-14 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Briefcase className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Need something specific?
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Describe your requirement and let verified helpers compete for it.
              Posting a request needs an active membership, and escrow holds your
              payment until you approve the delivered work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/assignments/create"
              className={cn(
                buttonVariants({ size: "default" }),
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Post a request
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/membership"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Membership plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
