"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  PenTool,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { cn } from "cn";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { MemberDashboardMetrics } from "@/lib/dashboard-api";

/**
 * Workspace for a subscribed member.
 *
 * A member is a customer whose subscription unlocked the paid marketplace
 * actions, so this view keeps the student KPIs but leads with the membership
 * state, the perks it activates and the two actions it unlocks.
 */
export function MemberDashboardView({
  metrics,
  userName,
}: {
  metrics: MemberDashboardMetrics;
  userName: string;
}) {
  // Defensive defaults: a malformed payload must degrade, not blank the page.
  const membership = metrics.membership ?? {
    isMember: false,
    plan: null,
    planName: null,
    status: null,
    startedAt: null,
    expiresAt: null,
    daysRemaining: null,
    autoRenew: false,
  };
  const perks = metrics.perks ?? {
    canPostJobs: false,
    canTakeJobs: false,
    platformFeePercent: 10,
    feeDiscountPercent: 0,
  };
  const stats = metrics.stats;
  const recentOrders = metrics.recentOrders ?? [];
  const recentAssignments = metrics.recentAssignments ?? [];
  const recommendedGigs = metrics.recommendedGigs ?? [];

  return (
    <div className="space-y-6">
      {/* Membership banner */}
      <div className="flex flex-col gap-6 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/40 via-purple-950/25 to-card p-6 shadow-md backdrop-blur-sm md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Member Workspace
            </span>
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-[10px] text-emerald-500"
            >
              <BadgeCheck className="mr-1 h-3 w-3" aria-hidden="true" />
              {membership.planName ?? "Active membership"}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {userName}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Your membership unlocks posting jobs and taking jobs. Escrow protects
            every payment, and your reduced platform fee is applied automatically
            on completion.
          </p>
          {membership.expiresAt && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {membership.daysRemaining ?? 0} day
              {(membership.daysRemaining ?? 0) === 1 ? "" : "s"} remaining •
              renews {new Date(membership.expiresAt).toLocaleDateString()}
              {membership.autoRenew ? " (auto-renew on)" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/assignments/create"
            className={cn(
              buttonVariants({ size: "default" }),
              "gap-2 bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
            )}
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Post a Job
          </Link>
          <Link
            href="/assignments"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Take a Job
          </Link>
        </div>
      </div>

      {/* Perks */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">
                {perks.canPostJobs ? "Posting unlocked" : "Posting locked"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Publish unlimited job briefs to every verified helper.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">
                {perks.canTakeJobs ? "Bidding unlocked" : "Bidding locked"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Submit proposals once your helper profile is verified.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-4">
            <Wallet
              className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">
                {perks.platformFeePercent}% platform fee
              </p>
              <p className="text-[11px] text-muted-foreground">
                {perks.feeDiscountPercent} points below the standard rate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/60 p-5">
          <div className="mb-2 flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Orders</span>
            <Clock className="h-4 w-4 text-indigo-500" aria-hidden="true" />
          </div>
          <div className="font-mono text-2xl font-black text-foreground sm:text-3xl">
            {stats.activeOrdersCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-emerald-500">
              {stats.underReviewOrdersCount} awaiting review
            </span>
          </p>
        </Card>

        <Card className="border-border/60 p-5">
          <div className="mb-2 flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">My Open Jobs</span>
            <Briefcase className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="font-mono text-2xl font-black text-foreground sm:text-3xl">
            {stats.openAssignmentsCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {stats.totalBidsReceived} proposals received
          </p>
        </Card>

        <Card className="border-border/60 p-5">
          <div className="mb-2 flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Escrow Protected</span>
            <ShieldCheck className="h-4 w-4 text-purple-500" aria-hidden="true" />
          </div>
          <div className="font-mono text-2xl font-black text-foreground sm:text-3xl">
            ৳{stats.totalSpent}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-emerald-500">
            100% escrow protected
          </p>
        </Card>

        <Card className="border-border/60 p-5">
          <div className="mb-2 flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Completed</span>
            <Receipt className="h-4 w-4 text-blue-500" aria-hidden="true" />
          </div>
          <div className="font-mono text-2xl font-black text-foreground sm:text-3xl">
            {stats.completedOrdersCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {stats.unreadMessagesCount} unread messages
          </p>
        </Card>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Active Workspaces</CardTitle>
                <CardDescription className="text-xs">
                  Milestones, deliveries and escrow release
                </CardDescription>
              </div>
              <Link
                href="/orders"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No orders yet. Browse services or post a job to get started.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-background/60 p-4 transition-colors hover:border-indigo-500/40 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {order.orderNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Helper: {order.vendorName} ({order.vendorUniversity})
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-8 shrink-0 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                      )}
                    >
                      Workspace
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">My Posted Jobs</CardTitle>
                <CardDescription className="text-xs">
                  Review proposals from verified helpers
                </CardDescription>
              </div>
              <Link
                href="/assignments/create"
                className="text-xs font-semibold text-indigo-500 hover:underline"
              >
                + New job
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  You have no active briefs. Post one to receive proposals.
                </p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/60 p-4 transition-colors hover:border-emerald-500/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {assignment.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">
                          {assignment.subject}
                        </Badge>
                        <span>
                          Budget: ৳{assignment.budgetMin} - ৳{assignment.budgetMax}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-xs text-emerald-500"
                      >
                        {assignment.bidsCount} proposals
                      </Badge>
                      <Link
                        href={`/assignments/${assignment.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 text-xs"
                        )}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Member Tools</CardTitle>
              <CardDescription className="text-xs">
                Everything your plan unlocks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/assignments/create", label: "Post a job", icon: PlusCircle },
                { href: "/assignments", label: "Find and take jobs", icon: Briefcase },
                { href: "/handwriting-matcher", label: "Handwriting matcher", icon: PenTool },
                { href: "/membership", label: "Manage membership", icon: Sparkles },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-indigo-500/40 hover:bg-accent/50"
                >
                  <item.icon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  {item.label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Recommended Helpers</CardTitle>
              <CardDescription className="text-xs">
                Top campus gigs ready to book
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedGigs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No services published yet.
                </p>
              ) : (
                recommendedGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="rounded-lg border border-border/50 bg-background/40 p-3 transition-colors hover:border-indigo-500/40"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="max-w-[150px] truncate font-semibold text-indigo-500">
                        {gig.vendorUniversity}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                        {gig.rating.toFixed(1)}
                      </span>
                    </div>
                    <Link
                      href={`/gigs/${gig.slug}`}
                      className="line-clamp-2 text-xs font-bold text-foreground hover:text-indigo-600"
                    >
                      {gig.title}
                    </Link>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">By {gig.vendorName}</span>
                      <span className="font-extrabold text-foreground">
                        ৳{gig.priceFrom}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
