"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  PenTool,
  Clock,
  RotateCcw,
  Check,
  Star,
  CheckCircle2,
  FileText,
  Download,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fetchGigBySlug, Gig, GigPackage } from "@/lib/gigs-api";

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [loading, setLoading] = React.useState(true);
  const [gig, setGig] = React.useState<Gig | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = React.useState(0);

  React.useEffect(() => {
    if (slug) {
      fetchGigBySlug(slug)
        .then((data) => setGig(data))
        .catch(() => setGig(null))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold">Service Gig Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This service may have been deactivated or the URL is incorrect.
        </p>
        <Link href="/gigs" className="mt-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse Gigs
          </Button>
        </Link>
      </div>
    );
  }

  const selectedPackage: GigPackage | undefined =
    gig.packages && gig.packages.length > 0
      ? gig.packages[selectedTierIndex] || gig.packages[0]
      : undefined;

  const handleOrderClick = () => {
    toast.info(
      `Package '${selectedPackage?.name}' selected. Escrow checkout will be available in Phase 4!`,
    );
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/gigs" className="hover:text-foreground">
          Services
        </Link>
        <span>/</span>
        <span className="capitalize">{gig.category.toLowerCase().replace(/_/g, " ")}</span>
        <span>/</span>
        <span className="truncate max-w-[200px] text-foreground font-medium">{gig.title}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Gig Details & Media (7 cols) */}
        <div className="space-y-8 lg:col-span-7">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl leading-snug">
              {gig.title}
            </h1>

            {/* Helper Quick Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/50 pb-4">
              <Link
                href={`/helpers/${gig.vendorProfile?.id}`}
                className="flex items-center gap-2 group"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={gig.vendorProfile?.user?.image || ""} />
                  <AvatarFallback className="text-xs bg-indigo-500/10 text-indigo-600 font-bold">
                    {gig.vendorProfile?.user?.name?.slice(0, 2).toUpperCase() || "KH"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors">
                  {gig.vendorProfile?.user?.name}
                </span>
              </Link>

              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {gig.rating > 0 ? gig.rating.toFixed(1) : "New"}{" "}
                <span className="text-muted-foreground font-normal">({gig.totalReviews})</span>
              </span>

              <span className="flex items-center gap-1 text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                {gig.vendorProfile?.university}
              </span>

              {gig.requiresHardcopy && (
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                  <PenTool className="inline-block mr-1 h-2.5 w-2.5" /> Hardcopy Delivery
                </span>
              )}
            </div>
          </div>

          {/* Cover Images Showcase */}
          {gig.coverImages && gig.coverImages.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gig.coverImages[0]}
                alt={gig.title}
                className="max-h-[380px] w-full object-cover"
              />
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">About This Service</h2>
            <div className="rounded-xl border border-border/60 bg-card p-5 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {gig.description}
            </div>
          </div>

          {/* Subject Tags */}
          {gig.subjectTags && gig.subjectTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject & Topic Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {gig.subjectTags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Demo Attachments & Samples */}
          {gig.attachments && gig.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold">Demo Work & Sample Attachments</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {gig.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{att.fileName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{att.fileType || "File"}</p>
                      </div>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-indigo-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing Tiers & Escrow Checkout (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="sticky top-24 border-border/80 shadow-md">
            {/* Package Tabs */}
            {gig.packages && gig.packages.length > 1 && (
              <div className="grid grid-cols-3 border-b border-border/60 bg-muted/30 p-1.5 text-xs font-semibold">
                {gig.packages.map((pkg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTierIndex(idx)}
                    className={`rounded-lg py-2 transition-all ${
                      selectedTierIndex === idx
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>
            )}

            {selectedPackage && (
              <>
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="text-lg font-bold">{selectedPackage.name}</CardTitle>
                    <div className="text-2xl font-extrabold text-foreground">
                      ৳{selectedPackage.price}
                    </div>
                  </div>
                  {selectedPackage.description && (
                    <CardDescription className="text-xs mt-2 text-foreground/80 leading-relaxed">
                      {selectedPackage.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                  {/* Delivery & Revisions Info */}
                  <div className="flex items-center gap-6 text-xs text-muted-foreground border-y border-border/40 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      {selectedPackage.deliveryDays} Days Delivery
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <RotateCcw className="h-4 w-4 text-indigo-500" />
                      {selectedPackage.revisions ?? 1} Revisions
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  {selectedPackage.features && selectedPackage.features.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {selectedPackage.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Escrow Guarantee Pill */}
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      KoreDao 100% Escrow Protection
                    </div>
                    Money is held securely in escrow until you inspect and approve the completed
                    assignment.
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={handleOrderClick}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-6 text-base shadow-md shadow-indigo-600/20"
                  >
                    Continue (৳{selectedPackage.price})
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>

          {/* Helper Card Summary */}
          {gig.vendorProfile && (
            <Card className="border-border/70 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={gig.vendorProfile.user?.image || ""} />
                  <AvatarFallback className="bg-indigo-500/10 text-indigo-600 font-bold">
                    {gig.vendorProfile.user?.name?.slice(0, 2).toUpperCase() || "KH"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{gig.vendorProfile.user?.name}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">{gig.vendorProfile.department}</p>
                  <p className="text-[11px] text-muted-foreground">{gig.vendorProfile.university}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Rating: <strong>{gig.vendorProfile.rating > 0 ? gig.vendorProfile.rating.toFixed(1) : "New"}</strong></span>
                <Link href={`/helpers/${gig.vendorProfile.id}`}>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    View Full Profile
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
