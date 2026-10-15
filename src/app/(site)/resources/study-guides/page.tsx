import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, PenTool } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Study Guides",
  description:
    "Level-specific guidance for SSC, HSC and university practicals, assignments and research work on KoreDao.",
  alternates: { canonical: "/resources/study-guides" },
};

interface GuideSection {
  id: string;
  level: string;
  summary: string;
  points: string[];
  assistanceHref: string;
  assistanceLabel: string;
}

const GUIDES: GuideSection[] = [
  {
    id: "ssc",
    level: "SSC",
    summary:
      "School-level practical notebooks and ICT lab records, where neat presentation carries most of the marks.",
    points: [
      "Keep one notebook per subject and date every experiment consistently.",
      "Draw diagrams with a pencil, label them, then ink the observations.",
      "Write the aim, apparatus, procedure, observation table, calculation and result in that order.",
      "Leave the conclusion short and tie it back to the theory you were taught.",
    ],
    assistanceHref: "/assistance/practical/ssc",
    assistanceLabel: "Browse SSC practical assistance",
  },
  {
    id: "hsc",
    level: "HSC",
    summary:
      "Higher-secondary physics, chemistry and biology practicals, where accurate observations and error analysis matter most.",
    points: [
      "Record raw readings first, then compute — never write back-calculated values as raw data.",
      "State the least count of every instrument you use.",
      "Show at least one fully worked calculation, then tabulate the rest.",
      "Mention sources of error and how you minimised them; that is usually where marks are lost.",
    ],
    assistanceHref: "/assistance/practical/hsc",
    assistanceLabel: "Browse HSC practical assistance",
  },
  {
    id: "university",
    level: "University",
    summary:
      "Engineering and computer-science lab reports, simulations and research write-ups assessed against strict rubrics.",
    points: [
      "Follow your department's report template exactly — structure is graded.",
      "Include simulation screenshots, circuit schematics and plots with captioned axes.",
      "Cite every external source; use the referencing style your course requires.",
      "Keep an appendix for raw data, code listings and datasheets.",
    ],
    assistanceHref: "/assistance/practical/university",
    assistanceLabel: "Browse university practical assistance",
  },
];

export default function StudyGuidesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400"
        >
          <BookOpen className="mr-1 h-3 w-3" aria-hidden="true" />
          Study Guides
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          How to structure work that scores
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Level-specific checklists drawn from the work our verified helpers deliver
          every day. Use them whether you are writing the submission yourself or
          briefing a helper.
        </p>
      </header>

      <nav aria-label="Jump to level" className="mt-6 flex flex-wrap gap-2">
        {GUIDES.map((guide) => (
          <a
            key={guide.id}
            href={`#${guide.id}`}
            className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            {guide.level}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-8">
        {GUIDES.map((guide) => (
          <section
            key={guide.id}
            id={guide.id}
            aria-labelledby={`${guide.id}-heading`}
            className="scroll-mt-24"
          >
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h2
                  id={`${guide.id}-heading`}
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  {guide.level} checklist
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.summary}
                </p>
                <ul className="mt-4 space-y-2">
                  {guide.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={guide.assistanceHref}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  {guide.assistanceLabel}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <PenTool className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Need the work delivered instead?
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Post a request describing your rubric and deadline. Verified helpers
              send proposals, and escrow holds your payment until you approve the
              result.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/assignments/create"
              className={cn(
                buttonVariants(),
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Post a request
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
