"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchGigs, type Gig } from "@/lib/gigs-api";
import { GigFilters } from "@/components/gigs/gig-filters";
import { GigsGrid } from "@/components/gigs/gigs-grid";
import type { GigFilterState } from "@/components/gigs/gig-types";
import type { MarketplaceCategory } from "@/config/marketplace/types";
import { Button } from "@/components/ui/button";

const DEFAULT_FILTER: GigFilterState = {
  search: "",
  category: [],
  university: "",
  requiresHardcopy: undefined,
  sortBy: "rating",
  subject: "",
  topic: "",
  department: "",
  institution: "",
  location: "",
  handwritingStyle: "",
};

const PAGE_SIZE = 12;

/**
 * Maps marketplace category slugs to backend GigCategory enum values.
 * Skips categories without a `gigCategory` mapping (they resolve via search).
 */
function slugsToEnumValues(
  slugs: string[],
  allCategories: readonly MarketplaceCategory[],
): string[] {
  const bySlug = new Map(allCategories.map((c) => [c.slug, c]));
  const values = new Set<string>();
  for (const slug of slugs) {
    const cat = bySlug.get(slug);
    if (cat?.gigCategory) {
      values.add(cat.gigCategory);
    }
  }
  return [...values];
}

/**
 * Client component for the `/categories` page.
 *
 * Fetches gigs from the backend with pagination. Supports multiple category
 * filters (one API call per selected category, merged and deduplicated). With
 * no category filter, shows all gigs sorted by rating.
 */
export function CategoryGigsClient({
  initialCategorySlugs,
  allCategories,
}: {
  initialCategorySlugs: string[];
  allCategories: readonly MarketplaceCategory[];
}) {
  const router = useRouter();

  // Keep a stable reference so the URL-sync effect doesn't re-run
  // when the parent passes a new array instance on every render.
  const allCategoriesRef = React.useRef(allCategories);
  React.useEffect(() => {
    allCategoriesRef.current = allCategories;
  }, [allCategories]);

  const [filter, setFilter] = React.useState<GigFilterState>(() => {
    return {
      ...DEFAULT_FILTER,
      category: [...initialCategorySlugs],
      sortBy: "rating",
    };
  });

  // Sync filter from URL search params on client-side navigation (when the
  // component doesn't remount but the parent passes new initialCategorySlugs).
  const initialSlugsRef = React.useRef(initialCategorySlugs);
  React.useEffect(() => {
    const currentSlugs = [...initialCategorySlugs].sort().join(",");
    const prevSlugs = [...initialSlugsRef.current].sort().join(",");
    if (currentSlugs !== prevSlugs) {
      initialSlugsRef.current = initialCategorySlugs;
      setFilter((prev) => ({
        ...prev,
        category: [...initialCategorySlugs],
        sortBy: "rating",
      }));
    }
  }, [initialCategorySlugs]);

  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const pageRef = React.useRef(1);

  const loadGigs = React.useCallback(
    async (append = false) => {
      setLoading(true);
      const requestPage = append ? pageRef.current + 1 : 1;
      if (!append) pageRef.current = 1;
      else pageRef.current += 1;

      // Convert slugs to backend enum values at call time (not during render)
      // to avoid reading refs during render.
      const categoryEnumValues = slugsToEnumValues(
        filter.category,
        allCategoriesRef.current,
      );

      try {
        if (categoryEnumValues.length === 0) {
          const data = await searchGigs({
            search: filter.search.trim() || undefined,
            university: filter.university.trim() || undefined,
            requiresHardcopy: filter.requiresHardcopy,
            sortBy: filter.sortBy || "rating",
            page: requestPage,
            limit: PAGE_SIZE,
          });
          setGigs((prev) => (append ? [...prev, ...data.items] : data.items));
          setTotal(data.total);
          setHasMore(requestPage < data.totalPages);
        } else {
          const results = await Promise.all(
            categoryEnumValues.map((cat) =>
              searchGigs({
                search: filter.search.trim() || undefined,
                category: cat,
                university: filter.university.trim() || undefined,
                requiresHardcopy: filter.requiresHardcopy,
                sortBy: filter.sortBy || "rating",
                page: requestPage,
                limit: PAGE_SIZE,
              }),
            ),
          );

          const merged = results.flatMap((r) => r.items ?? []);
          const deduped = [...new Map(merged.map((g) => [g.id, g])).values()];
          const sorted = deduped.sort((a, b) => b.rating - a.rating);

          setGigs((prev) => (append ? [...prev, ...sorted] : sorted));
          const firstTotal = results[0]?.totalPages ?? 1;
          setTotal(results.reduce((sum, r) => sum + r.total, 0));
          setHasMore(requestPage < firstTotal);
        }
      } catch {
        setGigs([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  // Load on mount and whenever the filter changes.
  React.useEffect(() => {
    pageRef.current = 1;
    const timer = setTimeout(() => loadGigs(false), 0);
    return () => clearTimeout(timer);
  }, [loadGigs]);

  // Sync filter to URL search params (category slugs).
  // Only navigates when the built URL differs from the current one to avoid
  // infinite loops caused by new array references on parent re-renders.
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filter.search.trim()) params.set("search", filter.search);
    const seen = new Set<string>();
    for (const slug of filter.category) {
      if (slug && !seen.has(slug)) {
        params.append("category", slug);
        seen.add(slug);
      }
    }
    if (filter.university.trim()) params.set("university", filter.university);
    if (filter.requiresHardcopy === true)
      params.set("requiresHardcopy", "true");
    params.set("sortBy", filter.sortBy || "rating");

    const nextUrl = `/categories?${params.toString()}`;
    if (nextUrl !== window.location.pathname + window.location.search) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [filter, router]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    loadGigs(true);
  };

  const categoryLabel =
    filter.category.length === 0
      ? "All Services"
      : filter.category
          .map((slug) => {
            const opt = allCategories.find((c) => c.slug === slug);
            return opt ? opt.title : slug;
          })
          .join(", ");

  const isEmpty =
    !loading && gigs.length === 0 && total === 0;

  return (
    <div className="container mx-auto px-4 py-10 sm:px-8 sm:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-foreground">Categories</span>
          </li>
        </ol>
      </nav>

      <header className="max-w-4xl mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
            <Search className="mr-1 h-3 w-3" />
            Academic category
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {categoryLabel}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Browse verified helper service packages. Filter by category, sort by
          rating, price, or newest.
        </p>
      </header>

      {/* Filters */}
      <GigFilters value={filter} onChange={setFilter} />

      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "gig" : "gigs"} found
        </p>
        {filter.category.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilter({ ...filter, category: [] })}
          >
            Clear category filter
          </Button>
        )}
      </div>

      {/* Gig Grid */}
      <GigsGrid
        gigs={gigs}
        loading={loading}
        emptyMessage={
          isEmpty
            ? "No gigs found matching your filters. Try adjusting your filters."
            : "No gigs found in this category."
        }
        detailHref={(gig) => `/gigs/${gig.slug}`}
        showCta={true}
      />

      {gigs.length > 0 && hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            onClick={loadMore}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Load more
          </Button>
        </div>
      )}

      {/* Post-a-job CTA */}
      <section className="mt-14 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ArrowRight className="h-4 w-4 text-indigo-500" />
              Need something specific?
            </h2>
            <p className="text-xs text-muted-foreground">
              Post a custom assignment request and let verified helpers compete
              for it. Requires an active membership.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/assignments/create"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl"
            >
              Post a Request <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/5 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-500/10 rounded-xl"
            >
              Membership Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
