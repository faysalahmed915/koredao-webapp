"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMembership } from "@/components/providers/membership-provider";
import { useSession } from "@/lib/auth-client";
import { buildLoginHref, saveReturnPoint } from "@/lib/auth-redirect";
import {
  checkoutMembership,
  confirmMembership,
  cancelMembership,
  fetchMembershipPlans,
  formatBdt,
  type MembershipCheckoutResult,
  type MembershipPlan,
  type SubscriptionGateway,
} from "@/lib/subscriptions-api";
import { isSafeExternalUrl } from "@/lib/safe-redirect";

type CheckoutPhase = "idle" | "starting" | "awaiting-payment" | "confirming";

/**
 * Sandbox checkout only exists for local development. In a production build the
 * UI must never offer it, otherwise a membership could be obtained without
 * payment — the backend refuses sandbox in production too, so this is
 * defence-in-depth rather than the only control.
 */
const SANDBOX_ENABLED = process.env.NODE_ENV !== "production";
const DEFAULT_GATEWAY: SubscriptionGateway = SANDBOX_ENABLED
  ? "sandbox"
  : "aamarpay";

/**
 * `useSearchParams()` opts a route into client-side rendering, so the content is
 * wrapped in a Suspense boundary below (Next.js requires this for prerendering).
 */
export default function MembershipPage() {
  return (
    <React.Suspense fallback={<MembershipPageSkeleton />}>
      <MembershipPageContent />
    </React.Suspense>
  );
}

function MembershipPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" aria-hidden="true" />
      </div>
    </div>
  );
}

function MembershipPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const { membership, isLoading: isMembershipLoading, refresh } = useMembership();

  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [plansError, setPlansError] = React.useState<string | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = React.useState(true);

  const [phase, setPhase] = React.useState<CheckoutPhase>("idle");
  const [pendingCheckout, setPendingCheckout] =
    React.useState<MembershipCheckoutResult | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  const user = session?.user;

  React.useEffect(() => {
    let cancelled = false;
    fetchMembershipPlans()
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((error: Error) => {
        if (!cancelled) setPlansError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPlans(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Surface the gateway redirect outcome, then clear the param so a reload does
  // not re-toast or re-refresh forever.
  React.useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;

    if (status === "success") {
      toast.success("Membership activated", {
        description: "Your MEMBER role is now active.",
      });
      void refresh();
    } else if (status === "failed") {
      toast.error("Payment not completed", {
        description: "The gateway could not verify the payment. No membership was granted.",
      });
    }

    router.replace("/membership");
  }, [searchParams, refresh, router]);

  const requireLogin = React.useCallback(() => {
    toast.info("Please sign in first", {
      description: "You need an account to activate a membership.",
    });
    // Preserves the current page (with query) + scroll for the return trip.
    router.push(buildLoginHref());
  }, [router]);

  const handleChoosePlan = React.useCallback(
    async (plan: MembershipPlan, gateway: SubscriptionGateway) => {
      if (!user) {
        requireLogin();
        return;
      }

      setSelectedPlan(plan.plan);
      setPhase("starting");
      try {
        const checkout = await checkoutMembership(plan.plan, gateway);

        // Real gateways hand back a hosted page — send the browser there.
        if (checkout.paymentUrl) {
          if (!isSafeExternalUrl(checkout.paymentUrl)) {
            toast.error("Unsafe checkout link rejected", {
              description:
                "The payment gateway returned an unexpected address. No payment was taken.",
            });
            setPhase("idle");
            setSelectedPlan(null);
            return;
          }
          window.location.assign(checkout.paymentUrl);
          return;
        }

        // A sandbox response in a production build means the backend is
        // misconfigured; never let the browser activate a free membership.
        if (checkout.sandbox && !SANDBOX_ENABLED) {
          toast.error("Checkout unavailable", {
            description:
              "This deployment is not accepting online payments right now. Please contact support.",
          });
          setPhase("idle");
          setSelectedPlan(null);
          return;
        }

        // Sandbox: no hosted page exists, so surface an explicit confirmation step.
        setPendingCheckout(checkout);
        setPhase("awaiting-payment");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not start checkout";
        toast.error("Checkout failed", { description: message });
        setPhase("idle");
        setSelectedPlan(null);
      }
    },
    [requireLogin, user]
  );

  const handleConfirmSandbox = React.useCallback(async () => {
    if (!pendingCheckout) return;

    // Hard stop: a production build must never self-activate a membership.
    if (!SANDBOX_ENABLED) {
      toast.error("Sandbox checkout is disabled", {
        description: "Please complete payment through the payment gateway.",
      });
      setPendingCheckout(null);
      setPhase("idle");
      setSelectedPlan(null);
      return;
    }

    setPhase("confirming");
    try {
      const result = await confirmMembership(pendingCheckout.subscriptionId);
      await refresh();
      toast.success("Welcome, Member!", {
        description: `${result.planName ?? "Membership"} is active — you can now post and take jobs.`,
      });
      setPendingCheckout(null);
      setPhase("idle");
      setSelectedPlan(null);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not confirm the payment";
      toast.error("Activation failed", {
        description: `${message} You can retry the confirmation below.`,
      });
      setPhase("awaiting-payment");
    }
  }, [pendingCheckout, refresh, router]);

  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancelAutoRenew = React.useCallback(async () => {
    setIsCancelling(true);
    try {
      await cancelMembership();
      await refresh();
      toast.success("Auto-renew cancelled", {
        description: "You keep access until the paid period ends.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not cancel auto-renewal";
      toast.error("Cancellation failed", { description: message });
    } finally {
      setIsCancelling(false);
    }
  }, [refresh]);

  const isBusy = phase !== "idle";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-8">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400"
        >
          <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
          KoreDao Membership
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          One membership. Full marketplace access.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Browsing KoreDao is always free. An active membership grants the{" "}
          <span className="font-semibold text-foreground">MEMBER</span> role, which
          unlocks the two paid actions on the platform:{" "}
          <span className="font-semibold text-foreground">posting a job</span> and{" "}
          <span className="font-semibold text-foreground">taking a job</span>.
        </p>
      </div>

      {/* Current status */}
      {!isSessionPending && user && (
        <div className="mx-auto mt-8 max-w-2xl">
          {isMembershipLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/50 p-4 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking your membership…
            </div>
          ) : membership.isMember ? (
            <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <BadgeCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {membership.planName ?? "Membership"} is active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {membership.daysRemaining ?? 0} day
                    {(membership.daysRemaining ?? 0) === 1 ? "" : "s"} remaining
                    {membership.expiresAt
                      ? ` • renews on ${new Date(membership.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {membership.autoRenew && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    onClick={handleCancelAutoRenew}
                    disabled={isCancelling}
                  >
                    {isCancelling && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    )}
                    Cancel auto-renew
                  </Button>
                )}
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                >
                  Go to dashboard
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-center text-xs text-muted-foreground">
              You do not have an active membership yet. Choose a plan below to
              unlock posting and taking jobs.
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div id="plans" className="mt-12 scroll-mt-24">
        {isLoadingPlans ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading plans…
          </div>
        ) : plansError ? (
          <div className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-semibold text-destructive">
              Plans are unavailable right now
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{plansError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = membership.isMember && membership.plan === plan.plan;
              const isThisBusy = isBusy && selectedPlan === plan.plan;

              return (
                <Card
                  key={plan.plan}
                  className={cn(
                    "relative flex flex-col border-border/60",
                    plan.highlight &&
                      "border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  )}
                >
                  {plan.highlight && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] text-white">
                      Most popular
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    <div className="mt-3 flex items-end gap-1.5">
                      <span className="text-3xl font-black tracking-tight text-foreground">
                        {formatBdt(plan.price)}
                      </span>
                      <span className="pb-1 text-xs text-muted-foreground">
                        / {plan.durationDays} days
                      </span>
                    </div>
                    {plan.savingsPercent > 0 && (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Save {plan.savingsPercent}% •{" "}
                        {formatBdt(plan.monthlyEquivalent)}/month
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <Separator />
                    <ul className="flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs">
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                            aria-hidden="true"
                          />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-2">
                      <Button
                        className={cn(
                          "w-full cursor-pointer gap-2",
                          plan.highlight && "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                        variant={plan.highlight ? "default" : "outline"}
                        disabled={isBusy || isCurrent || isSessionPending}
                        onClick={() => handleChoosePlan(plan, DEFAULT_GATEWAY)}
                      >
                        {isThisBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <CreditCard className="h-4 w-4" aria-hidden="true" />
                        )}
                        {isCurrent ? "Current plan" : "Choose plan"}
                      </Button>
                      {plan.highlight && SANDBOX_ENABLED && (
                        <p className="text-center text-[10px] text-muted-foreground">
                          Sandbox checkout for local development
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sandbox payment step */}
      {pendingCheckout && (
        <div className="mx-auto mt-8 max-w-xl">
          <Card className="border-indigo-500/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Sandbox payment confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-semibold text-foreground">
                    {pendingCheckout.planName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-semibold text-foreground">
                    {formatBdt(pendingCheckout.amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-semibold text-foreground">
                    {pendingCheckout.durationDays} days
                  </dd>
                </div>
              </dl>
              <p className="rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                No real money moves in sandbox mode. Confirming still goes through
                the same server-side verification path, and the membership is
                activated by the backend — never by the browser.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  className="flex-1 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={handleConfirmSandbox}
                  disabled={phase === "confirming"}
                >
                  {phase === "confirming" && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Confirm payment
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => {
                    setPendingCheckout(null);
                    setPhase("idle");
                    setSelectedPlan(null);
                  }}
                  disabled={phase === "confirming"}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!user && !isSessionPending && (
        <div className="mx-auto mt-10 max-w-md text-center">
          <Link
            href="/register?redirect=/membership"
            onClick={() => saveReturnPoint(window.scrollY, "/membership")}
            className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-indigo-600 text-white hover:bg-indigo-700")}
          >
            Create an account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login?redirect=/membership"
              onClick={() => saveReturnPoint(window.scrollY, "/membership")}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
