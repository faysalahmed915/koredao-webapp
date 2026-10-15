import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  PenTool,
  MapPin,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Lock,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "About KoreDao - Bangladesh's Academic & Handwritten Project Platform",
  description:
    "Learn about KoreDao's mission to eliminate student exploitation, guarantee 100% escrow protection, match handwriting styles, and empower peer helpers across BUET, DU, IUT, and SUST.",
  openGraph: {
    title: "About KoreDao - Mission, Team & Campus Network",
    description: "The trusted academic freelance engine for Bangladeshi universities.",
    type: "website",
  },
};

export default function AboutPage() {
  const leadershipTeam = [
    {
      name: "Tanvir Hasan",
      role: "Co-Founder & Engineering Lead",
      university: "BUET (EEE)",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
      focus: "Escrow Engine & Circuit Simulation Architecture",
      bio: "Undergraduate researcher at BUET EEE. Built KoreDao's zero-leakage safety filters and milestone checkpoint verification system.",
    },
    {
      name: "Fahim Chowdhury",
      role: "Academic Solutions Director",
      university: "University of Dhaka (Mathematics)",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      focus: "Mathematical Rigor & Verification Standard",
      bio: "Masters distinction holder at DU Mathematics. Oversees helper vetting, calculus proof standards, and solution quality checks.",
    },
    {
      name: "Samira Akter",
      role: "Hardcopy Operations & Logistics Lead",
      university: "University of Dhaka (Pharmacy)",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
      focus: "Handwritten Hardcopy & Courier Logistics",
      bio: "Renowned for flawless cursive penmanship. Coordinates campus physical handoffs near Curzon Hall and nationwide courier distribution.",
    },
    {
      name: "Adnan Sami",
      role: "Campus Growth & Escrow Strategy",
      university: "North South University (SBE)",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
      focus: "Payment Gateways & Student Ambassador Network",
      bio: "Finance researcher at NSU. Spearheaded Aamarpay and PipraPay gateway integration ensuring zero student transaction surcharges.",
    },
  ];

  const corePillars = [
    {
      title: "100% Escrow Protection",
      desc: "Funds remain safely locked in escrow until the student reviews and accepts deliverables. Includes a 72-hour review window.",
      icon: ShieldCheck,
      badge: "Security",
    },
    {
      title: "Handwriting Visual Alignment",
      desc: "Our visual handwriting engine categorizes cursive, math equation, and print styles so handwritten hardcopy notes match your notebook.",
      icon: PenTool,
      badge: "Precision",
    },
    {
      title: "Campus Proximity Handover",
      desc: "Get hardcopy projects handed over in person at Curzon Hall, Palashi, Merul Badda, Board Bazar, or dispatched via courier.",
      icon: MapPin,
      badge: "Logistics",
    },
    {
      title: "Dual Marketplace Model",
      desc: "Choose between Fiverr-style instant fixed-price gigs or post custom assignment requests for competitive Upwork-style peer bids.",
      icon: Briefcase,
      badge: "Flexibility",
    },
  ];

  const campusList = [
    { name: "Bangladesh University of Engineering and Technology (BUET)", location: "Palashi, Dhaka" },
    { name: "University of Dhaka (DU)", location: "Curzon Hall & Nilkhet" },
    { name: "Islamic University of Technology (IUT)", location: "Board Bazar, Gazipur" },
    { name: "Shahjalal University of Science and Technology (SUST)", location: "Kumargaon, Sylhet" },
    { name: "North South University (NSU)", location: "Bashundhara R/A, Dhaka" },
    { name: "BRAC University (BRACU)", location: "Merul Badda, Dhaka" },
    { name: "Rajshahi University of Engineering and Technology (RUET)", location: "Kazla, Rajshahi" },
    { name: "Chittagong University of Engineering and Technology (CUET)", location: "Raozan, Chittagong" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-8 space-y-20">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-indigo-500 border-indigo-500/30">
          The KoreDao Story
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Empowering Academic Excellence Across Bangladesh
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Built by students for students — eliminating ghosting, fraud, and poor grades with bank-grade escrow, verified campus peers, and authentic handwriting matching.
        </p>
      </div>

      {/* The Origin & Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge className="bg-indigo-600 text-white text-xs">Our Mission</Badge>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Why We Founded KoreDao
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every semester, tens of thousands of university students in Bangladesh face grueling workloads across complex engineering lab reports, calculus problem sets, and massive handwritten term papers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Until now, students relied on unregulated Facebook groups where fraud was rampant: advance payments were stolen, ghost helpers vanished before deadlines, and handwritten notes looked completely foreign.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            KoreDao was engineered to change this forever. By introducing a formal dual freelance marketplace with 100% escrow protection, student ID card verification, and progressive milestone progress scans, we protect both students and hard-working peer helpers.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/gigs"
              className={cn(buttonVariants({ size: "lg" }), "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/30")}
            >
              <span>Explore Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/vendor/apply"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <span>Become a Helper</span>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-card p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">The KoreDao Standard</h3>
                <p className="text-xs text-muted-foreground">Certified academic peer collaboration</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Zero Upfront Loss:</strong> Payments stay in escrow and are only released after student approval.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Authentic Handwriting:</strong> Verified samples showcase loops, neatness, and math formulas.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Campus Proximity:</strong> In-person delivery at Curzon Hall, Palashi, Merul Badda & more.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Zero-Leakage AI Safety:</strong> Keeps student identity confidential and prevents off-platform scams.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Our Four Foundational Pillars
          </h2>
          <p className="text-sm text-muted-foreground">
            The core principles powering our platform architecture and community trust.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} className="border-border/60 hover:border-indigo-500/50 hover:shadow-lg transition-all p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {pillar.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">{pillar.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {pillar.desc}
                </CardDescription>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Campus Network */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Active Campus Network</h2>
            <p className="text-xs text-muted-foreground mt-1">Verified helpers available across Bangladesh&apos;s leading universities</p>
          </div>
          <Badge variant="secondary" className="self-start sm:self-auto text-xs">
            15+ Universities Connected
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {campusList.map((campus, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-background/50 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-foreground line-clamp-1">{campus.name.split("(")[0]}</span>
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                📍 {campus.location}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Leadership & Academic Advisors */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
            Student Leadership
          </Badge>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Academic Advisory & Leadership
          </h2>
          <p className="text-sm text-muted-foreground">
            Led by top university achievers committed to academic integrity, fairness, and student empowerment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadershipTeam.map((member, idx) => (
            <Card key={idx} className="border-border/60 p-5 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-indigo-500/20 shadow-sm">
                  <AvatarImage src={member.image} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{member.name}</h3>
                  <p className="text-xs text-indigo-500 font-semibold">{member.role}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {member.university}
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {member.bio}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-background p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
          Ready to experience stress-free academic help?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Join thousands of students and helpers from BUET, DU, IUT, and NSU on Bangladesh&apos;s safest academic marketplace.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/gigs"
            className={cn(buttonVariants({ size: "lg" }), "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30 gap-2")}
          >
            <span>Browse Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/assignments/create"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <span>Post an Assignment</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
