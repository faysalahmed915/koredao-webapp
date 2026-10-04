"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  PenTool,
  Star,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Loader2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchPublicVendorProfile, VendorProfile } from "@/lib/profiles-api";

export default function HelperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [vendor, setVendor] = React.useState<VendorProfile | null>(null);

  React.useEffect(() => {
    if (id) {
      fetchPublicVendorProfile(id)
        .then((data) => setVendor(data))
        .catch(() => setVendor(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold">Helper Profile Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This helper might not be verified yet or the profile link is invalid.
        </p>
        <Link href="/helpers" className="mt-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Helpers Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/helpers">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all helpers
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Profile Card & Credentials */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="overflow-hidden border-border/80">
            <div className="h-24 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
            <CardContent className="relative pt-0 pb-6">
              <Avatar className="-mt-12 h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={vendor.user?.image || ""} />
                <AvatarFallback className="bg-indigo-500/10 text-indigo-600 text-xl font-bold">
                  {vendor.user?.name?.slice(0, 2).toUpperCase() || "KH"}
                </AvatarFallback>
              </Avatar>

              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold">{vendor.user?.name || "Academic Helper"}</h1>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {vendor.department}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vendor.university}</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border/50 py-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500" />
                    {vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    ({vendor.totalReviews} reviews)
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold">{vendor.completedOrders}</div>
                  <span className="text-[11px] text-muted-foreground">Orders Completed</span>
                </div>
              </div>

              {/* Bio */}
              {vendor.bio && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    About
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {vendor.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {vendor.skills && vendor.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Subjects & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Details List */}
              <div className="mt-5 space-y-2 border-t border-border/50 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Academic Level</span>
                  <span className="font-medium">{vendor.academicLevel}</span>
                </div>
                {vendor.degree && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Degree</span>
                    <span className="font-medium">{vendor.degree}</span>
                  </div>
                )}
                {vendor.passingYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Year</span>
                    <span className="font-medium">{vendor.passingYear}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Handwriting Showcase */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <PenTool className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Verified Handwriting Showcase</CardTitle>
                  <CardDescription>
                    Compare handwriting styles to match your university assignment or notebook needs.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {vendor.handwritingSamples && vendor.handwritingSamples.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {vendor.handwritingSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="group overflow-hidden rounded-xl border border-border/70 bg-muted/20 transition-all hover:border-indigo-500/50 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sample.sampleUrl}
                          alt="Handwriting Sample"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                          {sample.neatnessScore}/10 Neat
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                            {sample.style}
                          </span>
                          {sample.isVerified && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                        {sample.description && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {sample.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No verified handwriting samples uploaded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
