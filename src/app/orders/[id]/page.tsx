"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  ArrowLeft,
  DollarSign,
  UploadCloud,
  Send,
  Loader2,
  AlertTriangle,
  Lock,
  Smartphone,
  CreditCard,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  fetchOrderById,
  fundEscrow,
  submitDelivery,
  acceptDelivery,
  requestRevision,
  raiseDispute,
  Order,
} from "@/lib/orders-api";
import {
  initiatePayment,
  verifyPayment,
  PaymentGatewayType,
} from "@/lib/payments-api";
import { MilestoneWorkspace } from "@/components/orders/milestone-workspace";
import { OrderChatDrawer } from "@/components/chat/order-chat-drawer";

export default function OrderWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order | null>(null);

  // Helper Delivery Submission State
  const [deliveryFileUrl, setDeliveryFileUrl] = React.useState("");
  const [deliveryNotes, setDeliveryNotes] = React.useState("");
  const [submittingDelivery, setSubmittingDelivery] = React.useState(false);

  // Client Actions State
  const [actionLoading, setActionLoading] = React.useState(false);
  const [revisionNotes, setRevisionNotes] = React.useState("");
  const [showRevisionModal, setShowRevisionModal] = React.useState(false);

  // Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedGateway, setSelectedGateway] = React.useState<PaymentGatewayType>("AAMARPAY");
  const [isInitiatingPayment, setIsInitiatingPayment] = React.useState(false);
  const searchParams = useSearchParams();

  // Dispute State
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);
  const [disputeReason, setDisputeReason] = React.useState("");

  const loadOrder = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrderById(id);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, loadOrder]);

  const isCustomer = session?.user?.id === order?.customerId;
  const isHelper = session?.user?.id === order?.vendorProfile?.userId;

  React.useEffect(() => {
    const paymentStatus = searchParams?.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment confirmed! Escrow deposit held safely.");
      loadOrder();
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed or was cancelled. Please try again.");
    }
  }, [searchParams, loadOrder]);

  const handleInitiatePayment = async () => {
    if (!order) return;
    setIsInitiatingPayment(true);
    try {
      if (selectedGateway === "MOCK_SANDBOX") {
        await verifyPayment({
          orderId: order.id,
          transactionRef: `MOCK_TXN_${Date.now()}`,
        });
        toast.success("Escrow deposit confirmed via Sandbox! Helper is authorized to begin.");
        setShowPaymentModal(false);
        loadOrder();
      } else {
        const clientReturnUrl = `${window.location.origin}/orders/${order.id}`;
        const res = await initiatePayment({
          orderId: order.id,
          gateway: selectedGateway,
          clientReturnUrl,
        });

        if (res.paymentUrl.includes("sandboxModal=true")) {
          // If server fell back to sandbox simulator due to demo sandbox keys
          await verifyPayment({
            orderId: order.id,
            transactionRef: res.transactionId,
          });
          toast.success(`Escrow funded successfully via simulated ${selectedGateway}!`);
          setShowPaymentModal(false);
          loadOrder();
        } else {
          toast.info(`Redirecting to secure ${selectedGateway} checkout...`);
          window.location.href = res.paymentUrl;
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize payment gateway");
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  // Helper Deliverable Submission
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryFileUrl.trim()) {
      toast.error("Please provide at least one deliverable file URL");
      return;
    }

    setSubmittingDelivery(true);
    try {
      await submitDelivery(id, {
        deliveryFiles: [deliveryFileUrl],
        deliveryNotes,
      });
      toast.success("Deliverables submitted! 72-hour review window has begun.");
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit delivery");
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Customer Accept & Release Escrow
  const handleAcceptDelivery = async () => {
    setActionLoading(true);
    try {
      await acceptDelivery(id);
      toast.success("Order accepted! Escrow funds released to helper wallet.");
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept delivery");
    } finally {
      setActionLoading(false);
    }
  };

  // Customer Request Revision
  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      toast.error("Please explain what requires correction");
      return;
    }

    setActionLoading(true);
    try {
      await requestRevision(id, revisionNotes);
      toast.success("Revision requested. Helper has been notified.");
      setShowRevisionModal(false);
      setRevisionNotes("");
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to request revision");
    } finally {
      setActionLoading(false);
    }
  };

  // Raise Dispute
  const handleRaiseDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      toast.error("Please explain the reason for filing a dispute");
      return;
    }

    setActionLoading(true);
    try {
      await raiseDispute(id, disputeReason);
      toast.success("Dispute raised. KoreDao moderation team will arbitrate.");
      setShowDisputeModal(false);
      setDisputeReason("");
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Failed to raise dispute");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold">Order Not Found</h2>
        <Link href="/orders" className="mt-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  // 72-Hour Timer Calculation
  const autoReleaseHoursLeft = order.autoReleaseAt
    ? Math.max(0, Math.ceil((new Date(order.autoReleaseAt).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{order.title}</h1>
            <span className="font-mono text-xs font-semibold rounded bg-muted px-2 py-1">
              {order.orderNumber}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-muted-foreground block uppercase">Total Escrow</span>
          <span className="text-2xl font-black text-foreground">৳{order.totalAmount}</span>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="mb-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Escrow Milestone Stepper
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-1.5">
              ✓
            </div>
            <span className="font-semibold text-foreground">1. Order Placed</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mb-1.5 ${
                order.status !== "PENDING_PAYMENT"
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white animate-pulse"
              }`}
            >
              {order.status !== "PENDING_PAYMENT" ? "✓" : "2"}
            </div>
            <span className="font-semibold text-foreground">2. Escrow Funded</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mb-1.5 ${
                order.status === "DELIVERED" || order.status === "COMPLETED"
                  ? "bg-emerald-500 text-white"
                  : order.status === "ESCROW_HELD" || order.status === "IN_PROGRESS"
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {order.status === "DELIVERED" || order.status === "COMPLETED" ? "✓" : "3"}
            </div>
            <span className="font-semibold text-foreground">3. In Progress</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mb-1.5 ${
                order.status === "COMPLETED"
                  ? "bg-emerald-500 text-white"
                  : order.status === "DELIVERED"
                  ? "bg-purple-600 text-white animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {order.status === "COMPLETED" ? "✓" : "4"}
            </div>
            <span className="font-semibold text-foreground">4. Under Review (72h)</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mb-1.5 ${
                order.status === "COMPLETED"
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {order.status === "COMPLETED" ? "✓" : "5"}
            </div>
            <span className="font-semibold text-foreground">5. Escrow Released</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Actions, Deliverables & Chat (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Status Alert Banners */}
          {order.status === "PENDING_PAYMENT" && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">
                    Awaiting Upfront Escrow Deposit
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    To protect both parties, the helper cannot submit deliverables until the ৳
                    {order.totalAmount} deposit is confirmed in KoreDao escrow.
                  </p>
                </div>
                {isCustomer && (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-amber-600 text-white hover:bg-amber-700 font-semibold text-xs shrink-0 shadow-sm"
                  >
                    Deposit Escrow (৳{order.totalAmount})
                  </Button>
                )}
              </div>
            </div>
          )}

          {order.status === "DELIVERED" && (
            <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-5">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-purple-700 dark:text-purple-300">
                    72-Hour Auto-Release Review Window Active
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    The completed deliverables have been submitted. Please inspect the work. If no
                    revision is requested or response given, funds will automatically release to the
                    helper in approx{" "}
                    <strong className="text-foreground">{autoReleaseHoursLeft} hours</strong>.
                  </p>
                </div>
              </div>

              {isCustomer && (
                <div className="mt-4 pt-3 border-t border-purple-500/20 flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDisputeModal(true)}
                    className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs"
                  >
                    Raise Dispute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRevisionModal(true)}
                    className="text-xs"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Request Revision (
                    {order.maxRevisions - order.usedRevisions} left)
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptDelivery}
                    disabled={actionLoading}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                  >
                    {actionLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                    Accept & Release Escrow
                  </Button>
                </div>
              )}
            </div>
          )}

          {order.status === "COMPLETED" && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-300">Order Completed</h3>
                <p className="text-xs text-muted-foreground">
                  Escrow payment has been successfully released to the helper&apos;s wallet.
                </p>
              </div>
            </div>
          )}

          {/* Milestone Checkpoints & Progress Workspace */}
          <MilestoneWorkspace
            orderId={order.id}
            isCustomer={isCustomer}
            isHelper={isHelper}
            orderStatus={order.status}
          />

          {/* Deliverables Section */}
          {order.deliveryFiles && order.deliveryFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Download className="h-4 w-4 text-indigo-500" /> Submitted Deliverables
                </CardTitle>
                <CardDescription className="text-xs">
                  Submitted on{" "}
                  {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.deliveryNotes && (
                  <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 whitespace-pre-line">
                    {order.deliveryNotes}
                  </p>
                )}

                <div className="space-y-2">
                  {order.deliveryFiles.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <span>Deliverable #{i + 1}</span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Download File
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Helper Submission Form (When In Progress) */}
          {isHelper && (order.status === "ESCROW_HELD" || order.status === "IN_PROGRESS") && (
            <Card className="border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-indigo-500" /> Submit Completed Deliverables
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload your assignment files (PDF, images, report) to begin the 72-hour review window.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitDelivery} className="p-6 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Deliverable File URL *</Label>
                  <Input
                    placeholder="https://storage.koredao.com/deliveries/final-report.pdf"
                    value={deliveryFileUrl}
                    onChange={(e) => setDeliveryFileUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Submission Notes / Summary</Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs"
                    placeholder="Describe the solution, answer key, and steps completed..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingDelivery}
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs py-5"
                >
                  {submittingDelivery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Deliverable & Start 72h Review
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Escrow Ledger & Summary (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border/80 p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Escrow Protection Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total (Gross)</span>
                <strong className="text-foreground">৳{order.totalAmount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KoreDao Platform Escrow (10%)</span>
                <span>৳{order.platformFee}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2 font-bold">
                <span>Helper Net Payout (90%)</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ৳{order.netVendorAmount}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Escrow Status</span>
                <strong className="text-foreground font-semibold">
                  {order.escrowHolding?.status || "AWAITING_PAYMENT"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Revisions Remaining</span>
                <strong>{order.maxRevisions - order.usedRevisions}</strong>
              </div>
              <div className="flex justify-between">
                <span>Due Date</span>
                <strong>{new Date(order.deadline).toLocaleDateString()}</strong>
              </div>
            </div>
          </Card>

          {/* Participant Info */}
          <Card className="border-border/80 p-5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-3">
              {isCustomer ? "Academic Helper" : "Client"}
            </span>

            <div className="text-xs space-y-1">
              <strong className="text-foreground text-sm block">
                {isCustomer ? order.vendorProfile?.user?.name : order.customer?.name}
              </strong>
              {isCustomer && (
                <>
                  <p className="text-muted-foreground">{order.vendorProfile?.university}</p>
                  <p className="text-muted-foreground">{order.vendorProfile?.department}</p>
                </>
              )}
            </div>
          </Card>

          {/* Real-time Order Workspace Chat */}
          <OrderChatDrawer
            orderId={order.id}
            vendorProfileId={order.vendorProfileId}
            currentUserId={session?.user?.id || ""}
            currentUserName={session?.user?.name || "Me"}
            otherPartyName={
              isCustomer
                ? order.vendorProfile?.user?.name || "Helper"
                : order.customer?.name || "Client"
            }
          />
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-bold">Request Revision</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Revisions remaining: {order.maxRevisions - order.usedRevisions}. Explain the needed
              changes clearly.
            </p>

            <form onSubmit={handleRequestRevisionSubmit} className="mt-4 space-y-4">
              <textarea
                rows={4}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs"
                placeholder="Specify the exact errors, equations, or parts needing rework..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRevisionModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Submit Revision Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Checkout Modal */}
      {showPaymentModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Fund KoreDao Escrow Deposit</h3>
                  <p className="text-xs text-muted-foreground">
                    100% Protected — Released only after your approval
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Gateway selector */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Select Payment Gateway
                </Label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Aamarpay Option */}
                  <div
                    onClick={() => setSelectedGateway("AAMARPAY")}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      selectedGateway === "AAMARPAY"
                        ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500"
                        : "border-border/60 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Aamarpay</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 font-semibold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          bKash, Nagad, Rocket, Visa/Mastercard, Net Banking
                        </p>
                      </div>
                    </div>
                    {selectedGateway === "AAMARPAY" && (
                      <div className="h-5 w-5 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* PipraPay Option */}
                  <div
                    onClick={() => setSelectedGateway("PIPRAPAY")}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      selectedGateway === "PIPRAPAY"
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-border/60 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">PipraPay</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                            Instant
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automated Merchant Direct Checkout
                        </p>
                      </div>
                    </div>
                    {selectedGateway === "PIPRAPAY" && (
                      <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Sandbox Option */}
                  <div
                    onClick={() => setSelectedGateway("MOCK_SANDBOX")}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      selectedGateway === "MOCK_SANDBOX"
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500"
                        : "border-border/60 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Local Dev Sandbox</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                            Developer Simulator
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Instant simulated deposit without real money
                        </p>
                      </div>
                    </div>
                    {selectedGateway === "MOCK_SANDBOX" && (
                      <div className="h-5 w-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Project Deliverable Subtotal:</span>
                  <span className="font-mono text-foreground">৳{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Processing Surcharge:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ৳0 (Free for Students)
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>KoreDao Escrow Protection:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    100% Guaranteed
                  </span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Due Now:</span>
                  <span className="font-mono text-base text-amber-600 dark:text-amber-400">
                    ৳{order.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInitiatePayment}
                disabled={isInitiatingPayment}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md"
              >
                {isInitiatingPayment ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Connecting Gateway...
                  </>
                ) : (
                  <>Proceed to {selectedGateway === "MOCK_SANDBOX" ? "Simulate Payment" : selectedGateway}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-bold text-rose-600">File a Dispute</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              A KoreDao moderator will review the project, instructions, and submitted files to
              arbitrate the escrow release or refund.
            </p>

            <form onSubmit={handleRaiseDisputeSubmit} className="mt-4 space-y-4">
              <textarea
                rows={4}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs"
                placeholder="Explain the dispute issue..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDisputeModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Confirm Dispute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
