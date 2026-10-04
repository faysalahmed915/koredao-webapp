"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  Sparkles,
  PenTool,
  Star,
  CheckCircle2,
  Filter,
  ArrowRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchVendors, VendorProfile } from "@/lib/profiles-api";

const STYLE_OPTIONS = [
  { label: "All Styles", value: "" },
  { label: "Cursive", value: "CURSIVE" },
  { label: "Clean Print", value: "PRINT" },
  { label: "Mixed Casual", value: "MIXED" },
  { label: "Math & Equations", value: "MATH_EQUATION" },
];

export default function HelpersDirectoryPage() {
  const [search, setSearch] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [handwritingStyle, setHandwritingStyle] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [vendors, setVendors] = React.useState<VendorProfile[]>([]);
  const [total, setTotal] = React.useState(0);

  const loadVendors = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchVendors({
        search: search.trim() || undefined,
        university: university.trim() || undefined,
        handwritingStyle: handwritingStyle || undefined,
      });
      setVendors(data.items);
      setTotal(data.total);
    } catch {
      setVendors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, university, handwritingStyle]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadVendors]);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-8">
      {/* Hero / Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Verified Campus Academic Helpers
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Find Top Academic Helpers & Handwriting Matches
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Browse verified university students skilled in your subjects, handwriting styles, and
          course assignments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject, skills, helper name, or department..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* University Filter */}
          <div className="relative sm:col-span-6">
            <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by university (e.g. Dhaka, BUET, BRAC)..."
              className="pl-9"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
        </div>

        {/* Handwriting Style Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mr-2">
            <PenTool className="h-3.5 w-3.5 text-indigo-500" /> Handwriting Style:
          </span>
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setHandwritingStyle(style.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                handwritingStyle === style.value
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{vendors.length}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> verified helpers
        </p>
        <Link href="/vendor/apply">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Join as Helper <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No verified helpers found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try adjusting your subject keyword, university search, or handwriting style filter.
          </p>
        </div>
      ) : (
        /* Helper Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => {
            const primarySample = vendor.handwritingSamples?.[0];
            return (
              <Card
                key={vendor.id}
                className="group flex flex-col justify-between overflow-hidden border-border/70 transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-border/60">
                          <AvatarImage src={vendor.user?.image || ""} />
                          <AvatarFallback className="bg-indigo-500/10 text-indigo-600 font-semibold">
                            {vendor.user?.name?.slice(0, 2).toUpperCase() || "KH"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {vendor.user?.name || "Academic Helper"}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {vendor.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3">
                    {/* University Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="truncate">{vendor.university}</span>
                    </div>

                    {/* Bio */}
                    {vendor.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {vendor.bio}
                      </p>
                    )}

                    {/* Skills pills */}
                    {vendor.skills && vendor.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {vendor.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {vendor.skills.length > 3 && (
                          <span className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            +{vendor.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Handwriting Preview Pill */}
                    {primarySample && (
                      <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 p-2 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <PenTool className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Style: <strong className="text-foreground">{primarySample.style}</strong></span>
                        </div>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {primarySample.neatnessScore}/10 Neat
                        </span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="border-t border-border/40 pt-3">
                  <Link href={`/helpers/${vendor.id}`} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      View Profile & Handwriting <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
