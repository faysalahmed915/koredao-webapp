"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  Sparkles,
  PenTool,
  Star,
  Clock,
  Filter,
  ArrowRight,
  BookOpen,
  Loader2,
  FileText,
  FlaskConical,
  Calculator,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchGigs, Gig } from "@/lib/gigs-api";

const CATEGORIES = [
  { label: "All Services", value: "" },
  { label: "Assignments", value: "ASSIGNMENT", icon: FileText },
  { label: "Lab Reports", value: "LAB_REPORT", icon: FlaskConical },
  { label: "Thesis & Research", value: "THESIS_RESEARCH", icon: BookOpen },
  { label: "Handwritten Hardcopy", value: "HANDWRITTEN_HARDCOPY", icon: PenTool },
  { label: "Math & Problem Solving", value: "MATH_PROBLEM_SOLVING", icon: Calculator },
];

export default function GigsMarketplacePage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [requiresHardcopy, setRequiresHardcopy] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState("rating");
  const [loading, setLoading] = React.useState(true);
  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [total, setTotal] = React.useState(0);

  const loadGigs = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchGigs({
        search: search.trim() || undefined,
        category: category || undefined,
        university: university.trim() || undefined,
        requiresHardcopy,
        sortBy,
      });
      setGigs(data.items);
      setTotal(data.total);
    } catch {
      setGigs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, category, university, requiresHardcopy, sortBy]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadGigs();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadGigs]);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-8">
      {/* Hero Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Academic Services Marketplace
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Order Custom Assignments, Reports & Handwritten Notes
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Browse specialized gigs posted by verified top students and academic researchers across Bangladesh.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border border-border/60 bg-card text-muted-foreground hover:border-indigo-500/30 hover:text-foreground"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by topic (e.g. Calculus, Physics, Discrete Math)..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* University Filter */}
          <div className="relative sm:col-span-4">
            <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by university (e.g. BUET, Dhaka)..."
              className="pl-9"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="orders">Most Orders</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setRequiresHardcopy((prev) => (prev === true ? undefined : true))
              }
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                requiresHardcopy === true
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <PenTool className="inline-block mr-1 h-3 w-3" /> Handwritten Hardcopy Available
            </button>
          </div>

          <Link href="/vendor/gigs/create">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              Post a Service Gig <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{gigs.length}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> academic services
        </p>
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : gigs.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No academic gigs found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search query, selecting another category, or clearing the university filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gigs.map((gig) => {
            const cover = gig.coverImages?.[0];
            return (
              <Card
                key={gig.id}
                className="group flex flex-col justify-between overflow-hidden border-border/70 transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Cover Image or Themed Gradient Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={gig.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4 text-center">
                        <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                          {gig.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}

                    {gig.requiresHardcopy && (
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 backdrop-blur-sm shadow-sm">
                        <PenTool className="inline-block mr-1 h-2.5 w-2.5" /> Hardcopy
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-4 pb-2">
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
                    <Link href={`/gigs/${gig.slug}`}>
                      <CardTitle className="mt-2.5 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {gig.title}
                      </CardTitle>
                    </Link>
                  </CardHeader>

                  <CardContent className="px-4 py-2 space-y-2">
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
                </div>

                <CardFooter className="flex items-center justify-between border-t border-border/40 p-4 pt-3">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    From
                  </span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-foreground">
                      ৳{gig.priceFrom}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
