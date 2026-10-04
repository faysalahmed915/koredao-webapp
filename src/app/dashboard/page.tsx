"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Wallet,
  Briefcase,
  FileText,
  MessageSquare,
  PenTool,
  Star,
  Users,
  Layers,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import {
  fetchDashboardMetrics,
  DashboardResponse,
  CustomerDashboardMetrics,
  VendorDashboardMetrics,
  AdminDashboardMetrics,
} from "@/lib/dashboard-api";
import { cn } from "cn";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [metrics, setMetrics] = React.useState<DashboardResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    if (session?.user) {
      fetchDashboardMetrics()
        .then((data) => setMetrics(data))
        .catch((err) => setError(err.message || "Failed to load dashboard data"))
        .finally(() => setLoading(false));
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading your personalized workspace...
        </p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Unable to Load Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-2">{error || "No metrics returned."}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 md:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
        {metrics.role === "CUSTOMER" && (
          <StudentDashboardView metrics={metrics} userName={session?.user?.name || "Student"} />
        )}
        {metrics.role === "VENDOR" && (
          <VendorDashboardView metrics={metrics} userName={session?.user?.name || "Academic Helper"} />
        )}
        {(metrics.role === "ADMIN" ||
          metrics.role === "SUPER_ADMIN" ||
          metrics.role === "MODERATOR") && (
          <AdminDashboardView metrics={metrics} userName={session?.user?.name || "Admin"} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// 1. STUDENT / CUSTOMER VIEW
// ==========================================
function StudentDashboardView({
  metrics,
  userName,
}: {
  metrics: CustomerDashboardMetrics;
  userName: string;
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md backdrop-blur-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">
            <GraduationCap className="h-4 w-4" /> Student Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Track your assignments, monitor escrow-funded projects, review draft handwriting scans, and collaborate with verified campus peers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/assignments/create"
            className={cn(buttonVariants({ size: "default" }), "bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-md shadow-indigo-600/20")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post Assignment</span>
          </Link>
          <Link
            href="/gigs"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <span>Browse Services</span>
          </Link>
          <Link
            href="/handwriting-matcher"
            className={cn(buttonVariants({ variant: "secondary" }), "gap-2 text-indigo-600 dark:text-indigo-400")}
          >
            <PenTool className="h-4 w-4" />
            <span>Match Handwriting</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Active Orders</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            {metrics.stats.activeOrdersCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">{metrics.stats.underReviewOrdersCount} awaiting review</span>
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Open Jobs</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            {metrics.stats.openAssignmentsCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.totalBidsReceived} total bids received
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Protected Spent</span>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            ৳{metrics.stats.totalSpent}
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            100% Escrow Protected
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            {metrics.stats.completedOrdersCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.unreadMessagesCount} unread messages
          </div>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Orders & Open Assignments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Orders */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Active Orders & Workspaces</CardTitle>
                <CardDescription className="text-xs">
                  Direct access to milestone checkpoints, deliveries, and payment release
                </CardDescription>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No orders placed yet. Browse services or post an assignment to get started!
                </div>
              ) : (
                metrics.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-border/50 bg-background/60 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {order.orderNumber}
                        </span>
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "default"
                              : order.status === "DELIVERED"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-foreground line-clamp-1">
                        {order.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Helper: {order.vendorName} ({order.vendorUniversity})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="font-bold text-sm text-foreground">৳{order.totalAmount}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          Due {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className={cn(buttonVariants({ size: "sm" }), "text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white")}
                      >
                        Workspace
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Open Assignments */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">My Posted Assignments</CardTitle>
                <CardDescription className="text-xs">
                  Review bids submitted by verified helpers
                </CardDescription>
              </div>
              <Link
                href="/assignments"
                className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
              >
                Job Board <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.recentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  You have no active assignment briefs posted.
                </div>
              ) : (
                metrics.recentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl border border-border/50 bg-background/60 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-foreground line-clamp-1">
                        {a.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{a.subject}</Badge>
                        <span>Budget: ৳{a.budgetMin} - ৳{a.budgetMax}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-xs">
                        {a.bidsCount} Bids Received
                      </Badge>
                      <Link
                        href={`/assignments/${a.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8")}
                      >
                        View Bids
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recommended Services */}
        <div className="space-y-8">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Recommended Helpers</CardTitle>
              <CardDescription className="text-xs">Top campus gigs ready for instant booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.recommendedGigs.map((gig) => (
                <div key={gig.id} className="p-3 rounded-lg border border-border/50 bg-background/40 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-indigo-500 truncate max-w-[150px]">
                      {gig.vendorUniversity}
                    </span>
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> {gig.rating.toFixed(1)}
                    </span>
                  </div>
                  <Link
                    href={`/gigs/${gig.slug}`}
                    className="text-xs font-bold text-foreground hover:text-indigo-600 line-clamp-2"
                  >
                    {gig.title}
                  </Link>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">By {gig.vendorName}</span>
                    <span className="font-extrabold text-foreground">৳{gig.priceFrom}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. VENDOR / ACADEMIC HELPER VIEW
// ==========================================
function VendorDashboardView({
  metrics,
  userName,
}: {
  metrics: VendorDashboardMetrics;
  userName: string;
}) {
  return (
    <div className="space-y-8">
      {/* Welcome & Status Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500">
              <Briefcase className="h-4 w-4" /> Academic Helper Workspace
            </span>
            <Badge
              variant={metrics.isApproved ? "default" : "secondary"}
              className="text-[10px]"
            >
              {metrics.isApproved ? "Verified Helper" : "Pending Verification"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {userName}! 🚀
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage your gig orders, submit milestone proof scans, bid on campus assignments, and withdraw earnings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/vendor/wallet"
            className={cn(buttonVariants({ size: "default" }), "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-md shadow-emerald-600/20")}
          >
            <Wallet className="h-4 w-4" />
            <span>Wallet (৳{metrics.stats.availableBalance})</span>
          </Link>
          <Link
            href="/vendor/gigs/create"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Gig</span>
          </Link>
          <Link
            href="/assignments"
            className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
          >
            <span>Find Jobs</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Available for Payout</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ৳{metrics.stats.availableBalance}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            ৳{metrics.stats.totalWithdrawn} withdrawn via bKash/Nagad
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Escrow In-Progress</span>
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            ৳{metrics.stats.pendingEscrowBalance}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.inProgressOrdersCount} active orders in progress
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Lifetime Earned</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            ৳{metrics.stats.totalEarned}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.completedOrdersCount} orders completed
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Rating & Reviews</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            {metrics.stats.rating ? metrics.stats.rating.toFixed(2) : "5.00"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Based on {metrics.stats.totalReviews} verified student reviews
          </div>
        </Card>
      </div>

      {/* Main Vendor Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Urgent Orders & Milestones */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Urgent Orders & Deadlines</CardTitle>
                <CardDescription className="text-xs">
                  Prioritized by earliest completion timeline
                </CardDescription>
              </div>
              <Link href="/orders" className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1">
                All Orders <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.urgentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No active orders right now. Check the job board to place new bids!
                </div>
              ) : (
                metrics.urgentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-border/50 bg-background/60 hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{o.orderNumber}</span>
                        <Badge
                          variant={o.status === "DELIVERED" ? "secondary" : "default"}
                          className="text-[10px]"
                        >
                          {o.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-foreground line-clamp-1">{o.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Customer: {o.customerName} {o.customerUniversity ? `(${o.customerUniversity})` : ""}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="font-bold text-sm text-foreground">৳{o.totalAmount}</span>
                        <span className="text-[10px] text-amber-500 font-semibold block">
                          Due {new Date(o.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${o.id}`}
                        className={cn(buttonVariants({ size: "sm" }), "text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white")}
                      >
                        Workspace
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Gigs Catalog */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">My Published Gigs</CardTitle>
                <CardDescription className="text-xs">
                  Your active catalog services visible to students
                </CardDescription>
              </div>
              <Link href="/vendor/gigs/create" className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1">
                + New Gig
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.myGigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  You haven&apos;t published any gigs yet.
                </div>
              ) : (
                metrics.myGigs.map((g) => (
                  <div key={g.id} className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-foreground line-clamp-1">{g.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {g.orderCount} orders completed • ★ {g.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-foreground block">৳{g.priceFrom}</span>
                      <Link href={`/gigs/${g.slug}`} className="text-[10px] text-indigo-500 hover:underline">
                        View Gig
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Submitted Bids & Proposals */}
        <div className="space-y-8">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">My Submitted Proposals</CardTitle>
              <CardDescription className="text-xs">Bids placed on student assignment requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.recentBids.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No active bids. Check the job board to find open projects!
                </div>
              ) : (
                metrics.recentBids.map((bid) => (
                  <div key={bid.id} className="p-3 rounded-lg border border-border/50 bg-background/40">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <Badge
                        variant={bid.status === "ACCEPTED" ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {bid.status}
                      </Badge>
                      <span className="font-bold text-foreground">৳{bid.proposedPrice}</span>
                    </div>
                    <div className="text-xs font-semibold text-foreground line-clamp-1">
                      {bid.assignmentTitle}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>Delivery in {bid.deliveryDays} days</span>
                      <Link href={`/assignments/${bid.assignmentId}`} className="text-indigo-500 hover:underline">
                        View Job
                      </Link>
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

// ==========================================
// 3. ADMIN / SUPER ADMIN VIEW
// ==========================================
function AdminDashboardView({
  metrics,
  userName,
}: {
  metrics: AdminDashboardMetrics;
  userName: string;
}) {
  return (
    <div className="space-y-8">
      {/* Admin Command Center Banner */}
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-r from-slate-900 via-rose-950/20 to-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-500">
              <ShieldCheck className="h-4 w-4" /> Platform Command Center
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
              Zero-Trust Guard Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Administrator: {userName}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Real-time platform financial telemetry, pending helper verifications, escrow status, and fraud protection alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/verifications"
            className={cn(buttonVariants({ size: "default" }), "bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2 shadow-md shadow-rose-600/20")}
          >
            <span>Review Applications ({metrics.stats.pendingVerificationsCount})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* High-Level Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Escrow Locked</span>
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            ৳{metrics.stats.totalEscrowHeld}
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            Held in secure escrow accounts
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Platform 10% Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ৳{metrics.stats.totalPlatformRevenue}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            From ৳{metrics.stats.totalGMV} completed GMV
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Users</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-foreground">
            {metrics.stats.totalUsers}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.totalVendors} helpers • {metrics.stats.totalCustomers} students
          </div>
        </Card>

        <Card className="border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Security & Safety Flags</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
            {metrics.stats.safetyAlertsCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.stats.disputedOrdersCount} disputes requiring arbitration
          </div>
        </Card>
      </div>

      {/* Admin Actionable Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Verifications Queue */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold">Helper Verifications Queue</CardTitle>
              <CardDescription className="text-xs">
                Academic helper applications awaiting review
              </CardDescription>
            </div>
            <Link
              href="/admin/verifications"
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              Open Queue
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.pendingVerifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Verification queue is empty. All helper applications have been processed!
              </div>
            ) : (
              metrics.pendingVerifications.map((pv) => (
                <div
                  key={pv.id}
                  className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-foreground">{pv.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {pv.university} • {pv.department}
                    </div>
                  </div>
                  <Link
                    href="/admin/verifications"
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs h-7")}
                  >
                    Inspect
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Financial & Escrow Transactions */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold">Recent Ledger Activity</CardTitle>
              <CardDescription className="text-xs">
                Escrow locks, releases, and bKash/Nagad payouts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No recent transactions recorded.
              </div>
            ) : (
              metrics.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">{tx.description}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    ৳{tx.amount}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
