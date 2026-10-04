"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  DollarSign,
  Briefcase,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { fetchMyOrders, Order } from "@/lib/orders-api";

export default function OrdersDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [filterTab, setFilterTab] = React.useState<string>("ALL");

  React.useEffect(() => {
    if (session?.user) {
      fetchMyOrders()
        .then((data) => setOrders(data))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else if (!sessionLoading) {
      toast.error("Please log in to view your orders");
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  const filteredOrders = React.useMemo(() => {
    if (filterTab === "ACTIVE") {
      return orders.filter(
        (o) =>
          o.status === "ESCROW_HELD" ||
          o.status === "IN_PROGRESS" ||
          o.status === "DELIVERED" ||
          o.status === "UNDER_REVIEW",
      );
    }
    if (filterTab === "COMPLETED") {
      return orders.filter((o) => o.status === "COMPLETED");
    }
    if (filterTab === "DISPUTED") {
      return orders.filter((o) => o.status === "DISPUTED" || o.status === "REFUNDED");
    }
    return orders;
  }, [orders, filterTab]);

  const isHelper = (session?.user as any)?.role === "VENDOR";

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% Escrow Protected
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Orders & Projects</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Track your ongoing assignments, deliveries, and escrow releases.
          </p>
        </div>

        {isHelper && (
          <Link href="/vendor/wallet">
            <Button variant="outline" className="gap-2 text-xs font-semibold">
              <Wallet className="h-4 w-4 text-emerald-600" /> My Helper Wallet
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border/50 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterTab("ALL")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterTab === "ALL"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("ACTIVE")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterTab === "ACTIVE"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Escrows / In Progress
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("COMPLETED")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterTab === "COMPLETED"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("DISPUTED")}
          className={`rounded-lg px-4 py-2 transition-all ${
            filterTab === "DISPUTED"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Disputed
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No orders found in this category</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Explore academic services or browse open assignment requests on the job board.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/gigs">
              <Button size="sm" variant="outline">
                Browse Services
              </Button>
            </Link>
            <Link href="/assignments">
              <Button size="sm" className="bg-indigo-600 text-white">
                Job Board
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isClient = session?.user?.id === order.customerId;
            return (
              <Card
                key={order.id}
                className="group border-border/70 p-5 transition-all hover:border-indigo-500/50 hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {order.orderNumber}
                      </span>
                      {order.status === "PENDING_PAYMENT" && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Awaiting Payment
                        </span>
                      )}
                      {order.status === "ESCROW_HELD" && (
                        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          Escrow Funded
                        </span>
                      )}
                      {order.status === "DELIVERED" && (
                        <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          Delivered / Under Review (72h)
                        </span>
                      )}
                      {order.status === "COMPLETED" && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Completed & Escrow Released
                        </span>
                      )}
                      {order.status === "DISPUTED" && (
                        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Disputed
                        </span>
                      )}
                    </div>

                    <Link href={`/orders/${order.id}`}>
                      <h2 className="text-base font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {order.title}
                      </h2>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>
                        {isClient
                          ? `Helper: ${order.vendorProfile?.user?.name || "Helper"}`
                          : `Client: ${order.customer?.name || "Client"}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Due:{" "}
                        {new Date(order.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground block uppercase">
                        {isClient ? "Amount Paid" : "Net Earnings (90%)"}
                      </span>
                      <span className="text-lg font-extrabold text-foreground">
                        ৳{isClient ? order.totalAmount : order.netVendorAmount}
                      </span>
                    </div>

                    <Link href={`/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        View Order Workspace <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
