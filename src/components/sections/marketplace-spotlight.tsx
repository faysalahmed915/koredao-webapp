"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  GraduationCap,
  PenTool,
  CheckCircle2,
  FileText,
  FlaskConical,
  Calculator,
  BookOpen,
  Send,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchGigs, Gig } from "@/lib/gigs-api";
import { searchAssignments, Assignment } from "@/lib/assignments-api";
import { cn } from "cn";

export function MarketplaceSpotlight() {
  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [gigsRes, assignmentsRes] = await Promise.all([
          searchGigs({ limit: 4, sortBy: "rating" }).catch(() => ({ items: [], total: 0 })),
          searchAssignments({ limit: 3, status: "OPEN" }).catch(() => ({ items: [], total: 0 })),
        ]);
        setGigs(gigsRes.items || []);
        setAssignments(assignmentsRes.items || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 space-y-16">
        
        {/* SECTION 1: POPULAR ACADEMIC GIGS (FIVERR MODEL) */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Verified Helper Services
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Top Rated Academic Gigs
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fixed-price solutions from verified peer helpers at BUET, DU, IUT & SUST.
              </p>
            </div>
            <Link
              href="/gigs"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 self-start md:self-auto")}
            >
              <span>Explore All {gigs.length > 0 ? "Services" : "Catalog"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gigs.slice(0, 4).map((gig) => (
              <Card key={gig.id} className="group flex flex-col justify-between overflow-hidden border-border/60 hover:border-indigo-500/50 hover:shadow-xl transition-all">
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    {gig.coverImages?.[0] ? (
                      <img
                        src={gig.coverImages[0]}
                        alt={gig.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <GraduationCap className="h-10 w-10 text-indigo-500/40" />
                      </div>
                    )}
                    <Badge className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-background/90 text-foreground backdrop-blur-sm">
                      {gig.category.replace(/_/g, " ")}
                    </Badge>
                    {gig.requiresHardcopy && (
                      <Badge className="absolute bottom-2.5 left-2.5 text-[10px] bg-amber-500 text-white gap-1">
                        <PenTool className="h-3 w-3" /> Hardcopy
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={gig.vendorProfile?.user?.image || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {gig.vendorProfile?.user?.name?.[0] || "H"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-muted-foreground truncate">
                        {gig.vendorProfile?.user?.name || "Helper"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">•</span>
                      <span className="text-[10px] text-indigo-500 font-semibold truncate max-w-[120px]">
                        {gig.vendorProfile?.university?.split(" ")[0] || "University"}
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      <Link href={`/gigs/${gig.slug}`}>
                        {gig.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{gig.rating ? gig.rating.toFixed(1) : "5.0"}</span>
                    <span className="text-muted-foreground font-normal">({gig.totalReviews})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Starting at</span>
                    <span className="font-extrabold text-foreground text-sm">৳{gig.priceFrom}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 2: OPEN ASSIGNMENTS (UPWORK BIDDING MODEL) */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-2">
                <Send className="h-3.5 w-3.5" /> Live Job Board
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Urgent Assignment Requests
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Post your custom project brief or place bids as an approved campus helper.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/assignments/create"
                className={cn(buttonVariants({ size: "sm" }), "bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5")}
              >
                <span>Post Your Assignment</span>
              </Link>
              <Link
                href="/assignments"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                <span>View Job Board</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignments.slice(0, 3).map((a) => (
              <Card key={a.id} className="flex flex-col justify-between border-border/60 hover:border-emerald-500/50 hover:shadow-lg transition-all p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-500/30">
                      {a.type === "HARDCOPY" ? "✍️ Hardcopy Delivery" : "📄 Digital Softcopy"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {a.bidsCount} {a.bidsCount === 1 ? "Bid" : "Bids"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground line-clamp-2 hover:text-emerald-600 transition-colors">
                    <Link href={`/assignments/${a.id}`}>
                      {a.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {a.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {a.subject}
                    </Badge>
                    {a.preferredCampus && (
                      <Badge variant="outline" className="text-[10px] text-indigo-500">
                        📍 {a.preferredCampus}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Student Budget</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{a.budgetMin} - ৳{a.budgetMax}
                    </span>
                  </div>
                  <Link
                    href={`/assignments/${a.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8")}
                  >
                    View & Bid
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 3: HANDWRITING MATCHER BANNER */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30 gap-1.5">
              <PenTool className="h-3.5 w-3.5" /> AI Visual Alignment Engine
            </Badge>
            <h3 className="text-2xl font-bold text-foreground">
              Need Hardcopy Notes in Your Handwriting Style?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload a snapshot of your notebook or test sheet. Our handwriting engine compares cursive loops, slant angle, and equation neatness to find your closest campus match.
            </p>
          </div>
          <Link
            href="/handwriting-matcher"
            className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-lg shadow-indigo-600/30 font-semibold")}
          >
            <span>Launch Handwriting Matcher</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
