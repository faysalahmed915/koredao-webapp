"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMembership } from "@/components/providers/membership-provider";
import { useSession } from "@/lib/auth-client";
import { isMembershipExempt } from "@/lib/access-control";

export type GatedAction = "post-job" | "take-job" | "create-gig";

const ACTION_COPY: Record<
  GatedAction,
  { title: string; description: string; unlock: string[] }
> = {
  "post-job": {
    title: "Membership required to post a job",
    description:
      "Publishing a brief on the KoreDao job board is a member action. Your brief reaches every verified helper, and escrow protects the payment until you accept the work.",
    unlock: [
      "Post unlimited job briefs",
      "Receive competitive proposals from verified helpers",
      "Escrow-protected payments released only on your approval",
    ],
  },
  "take-job": {
    title: "Membership required to take a job",
    description:
      "Submitting a proposal on a student brief is a member action. Verified helpers use it to bid, negotiate scope and get paid through escrow.",
    unlock: [
      "Bid on every open assignment",
      "Direct escrow payouts to bKash, Nagad or bank",
      "Milestone tracking and revision protection",
    ],
  },
  "create-gig": {
    title: "Membership required to publish a gig",
    description:
      "Listing a service package in the KoreDao catalogue is a member action. Publish once and let students book you directly.",
    unlock: [
      "Unlimited service packages and pricing tiers",
      "Priority placement in helper search",
      "Reduced platform fee on completions",
    ],
  },
};

/**
 * Returns whether a gated marketplace action is currently locked for this user.
 * Platform staff are never locked out.
 *
 * When the membership lookup itself failed the state is **unknown**, not
 * "locked": the caller must not block or upsell a user whose status we could not
 * read.
 */
export function useMembershipGate(action: GatedAction) {
  const { data: session, isPending: isSessionPending } = useSession();
  const { membership, isLoading, error, refresh } = useMembership();

  const user = session?.user;
  const exempt = isMembershipExempt(user);
  const unlocked = membership.isMember || exempt;
  const isUnknown = Boolean(user) && !isLoading && error !== null;

  return {
    action,
    /** True while we cannot yet answer the question — do not flash the gate. */
    isLoading: isSessionPending || (Boolean(user) && isLoading),
    /** The lookup failed; treat as "unknown" and offer a retry. */
    isUnknown,
    error,
    refresh,
    isAuthenticated: Boolean(user),
    unlocked,
    locked: Boolean(user) && !isLoading && !isUnknown && !unlocked,
    membership,
  };
}

/**
 * Inline, actionable notice shown wherever a paid marketplace action is
 * attempted without an active membership. It never hides the destination — it
 * explains the requirement and offers the upgrade path.
 */
export function MembershipGate({
  action,
  className,
}: {
  action: GatedAction;
  className?: string;
}) {
  const { locked, isUnknown, error, refresh } = useMembershipGate(action);
  const copy = ACTION_COPY[action];

  // A failed lookup must never be presented as "you need to pay".
  if (isUnknown) {
    return (
      <Card className={cn("border-amber-500/30 bg-amber-500/5", className)}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              We could not verify your membership
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {error ??
                "Your membership status is temporarily unavailable."}{" "}
              Nothing has changed about your account — retry before purchasing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 cursor-pointer")}
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!locked) return null;

  return (
    <Card
      className={cn(
        "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent",
        className
      )}
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">{copy.title}</h2>
            <Badge
              variant="outline"
              className="border-indigo-500/40 text-[10px] text-indigo-600 dark:text-indigo-400"
            >
              MEMBER
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
          <ul className="grid gap-1 pt-0.5 sm:grid-cols-2">
            {copy.unlock.map((item) => (
              <li
                key={item}
                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
              >
                <Sparkles
                  className="mt-0.5 h-3 w-3 shrink-0 text-indigo-500"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/membership"
              className={cn(
                buttonVariants({ size: "sm" }),
                "gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Become a Member
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/membership#plans"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
            >
              Compare plans
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Submit button for a gated action.
 *
 * While locked it renders as a link to the pricing page with an explicit
 * "Membership required" label instead of a disabled, unexplained button. While
 * the surrounding form is submitting it is genuinely disabled and shows a
 * spinner, so a slow request can never be double-submitted into two
 * assignments/gigs.
 */
export function MembershipAwareSubmit({
  action,
  label,
  lockedLabel,
  className,
  isSubmitting = false,
}: {
  action: GatedAction;
  label: string;
  lockedLabel?: string;
  className?: string;
  /** The owning form's in-flight state. */
  isSubmitting?: boolean;
}) {
  const { locked, isLoading, isUnknown, error, refresh } =
    useMembershipGate(action);

  if (locked) {
    return (
      <Link
        href="/membership"
        className={cn(buttonVariants({ size: "default" }), "gap-2", className)}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {lockedLabel ?? "Membership required"}
      </Link>
    );
  }

  // Unknown state: keep the action available (the API is the real gate) but make
  // the uncertainty visible instead of silently disabling the button.
  if (isUnknown) {
    return (
      <button
        type="button"
        onClick={() => void refresh()}
        title={error ?? "Membership status unavailable"}
        className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2", className)}
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        Retry membership check
      </button>
    );
  }

  const disabled = isSubmitting || isLoading;

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={isSubmitting}
      className={cn(
        buttonVariants({ size: "default" }),
        "gap-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
