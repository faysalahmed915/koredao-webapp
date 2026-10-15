import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Clock,
  FileCheck2,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "How KoreDao Works",
  description:
    "How escrow, helper verification, membership and dispute resolution work on KoreDao — step by step for students and helpers.",
  alternates: { canonical: "/how-it-works" },
};

const STUDENT_STEPS = [
  {
    icon: Search,
    title: "Find the right help",
    body: "Browse ready-made service packages, filter the job board, or use the handwriting matcher to find a helper whose style matches yours.",
  },
  {
    icon: FileCheck2,
    title: "Agree the scope",
    body: "Book a package or post a request and review proposals. Milestone checkpoints let you approve the work in stages instead of all at once.",
  },
  {
    icon: ShieldCheck,
    title: "Pay into escrow",
    body: "Your payment is held by KoreDao, not by the helper. The helper cannot start until escrow is funded.",
  },
  {
    icon: Banknote,
    title: "Approve and release",
    body: "Review the delivery, request revisions if needed, and release the funds. If you do nothing for 72 hours after delivery, escrow auto-releases.",
  },
] as const;

const HELPER_STEPS = [
  {
    icon: UserCheck,
    title: "Get verified",
    body: "Submit your university, department and student ID. An administrator reviews the application before you can bid or publish gigs.",
  },
  {
    icon: Sparkles,
    title: "Activate membership",
    body: "Membership unlocks the paid marketplace actions: submitting proposals on jobs and publishing service packages.",
  },
  {
    icon: Clock,
    title: "Deliver on milestones",
    body: "Upload progress proofs and final files in the order workspace. The customer sees exactly what has been delivered and when.",
  },
  {
    icon: Banknote,
    title: "Get paid out",
    body: "On completion the platform fee is deducted, the remainder lands in your wallet, and you can withdraw to bKash, Nagad or your bank.",
  },
] as const;

const PRICING_ROWS: {
  item: string;
  who: string;
  amount: string;
  href?: string;
}[] = [
  { item: "Browsing & job board", who: "Everyone", amount: "Free" },
  {
    item: "Platform fee on completion",
    who: "Deducted from the helper payout",
    amount: "10%",
  },
  { item: "Member platform fee", who: "Members only", amount: "8%" },
  {
    item: "Membership",
    who: "Students & helpers who post or take jobs",
    amount: "See plans",
    href: "/membership",
  },
  { item: "Gateway processing", who: "KoreDao", amount: "Absorbed" },
];

const FAQ = [  {
    q: "When is money actually taken from the student?",
    a: "At checkout, before the helper starts. It is held in escrow by KoreDao and is only released when the student accepts the delivery, or automatically 72 hours after delivery if the student does not respond.",
  },
  {
    q: "What happens if the work is not acceptable?",
    a: "The student can request a revision while the order allows it. If that fails, either party can raise a dispute and a moderator arbitrates with the full milestone and chat history available.",
  },
  {
    q: "Why does posting or taking a job require membership?",
    a: "Membership funds the escrow, verification and dispute infrastructure that make the marketplace safe. Browsing services and the job board is always free.",
  },
  {
    q: "Is off-platform contact allowed?",
    a: "No. KoreDao scans chat for phone numbers, WhatsApp handles and off-platform payment requests, and warns both parties. Off-platform deals void escrow protection.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400"
        >
          <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
          How it works
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Escrow-protected academic work, end to end
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Both sides get a clear, auditable process: students keep control of the
          money until they are satisfied, and helpers know the funds are already
          secured before they start.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="students-heading">
        <h2 id="students-heading" className="text-xl font-bold tracking-tight text-foreground">
          For students
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDENT_STEPS.map((step, index) => (
            <Card key={step.title} className="h-full border-border/60">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="helpers-heading">
        <h2 id="helpers-heading" className="text-xl font-bold tracking-tight text-foreground">
          For helpers
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HELPER_STEPS.map((step, index) => (
            <Card key={step.title} className="h-full border-border/60">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-xl font-bold tracking-tight text-foreground">
          What it costs
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Transparent, published up front — no surprise deductions.
        </p>
        <Card className="mt-5 overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <caption className="sr-only">
                KoreDao fees, who pays them and the amounts
              </caption>
              <thead className="border-b border-border/60 bg-muted/40">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">
                    Who pays
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRICING_ROWS.map((row) => (
                  <tr key={row.item} className="border-b border-border/50 last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-medium text-foreground"
                    >
                      {row.item}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{row.who}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {row.href ? (
                        <Link href={row.href} className="text-primary hover:underline">
                          {row.amount}
                        </Link>
                      ) : (
                        row.amount
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-xl font-bold tracking-tight text-foreground">
          Common questions
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <Card key={item.q} className="border-border/60">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground">{item.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <BadgeCheck className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Ready to get started?
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Browse the catalogue for free, then activate membership when you are
              ready to post a request or take on work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/gigs"
              className={cn(
                buttonVariants(),
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Browse services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/membership" className={cn(buttonVariants({ variant: "outline" }))}>
              Membership plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
