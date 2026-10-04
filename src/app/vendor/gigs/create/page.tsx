"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  Clock,
  RotateCcw,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { createGig, GigPackage } from "@/lib/gigs-api";

export default function CreateGigPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("ASSIGNMENT");
  const [subjectTagsInput, setSubjectTagsInput] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [tierType, setTierType] = React.useState<"SINGLE" | "TIERED">("SINGLE");
  const [requiresHardcopy, setRequiresHardcopy] = React.useState(false);
  const [handwritingStyle, setHandwritingStyle] = React.useState("CURSIVE");

  // Packages State
  const [singlePackage, setSinglePackage] = React.useState<GigPackage>({
    name: "Standard",
    price: 800,
    deliveryDays: 3,
    revisions: 2,
    description: "Full assignment with step-by-step solution and neat presentation",
    features: ["Complete Solution", "Formula Sheet", "100% Plagiarism Free"],
  });

  const [tieredPackages, setTieredPackages] = React.useState<GigPackage[]>([
    {
      name: "Basic",
      price: 500,
      deliveryDays: 2,
      revisions: 1,
      description: "Up to 3 pages assignment / single problem set",
      features: ["3 Pages", "Neat Handwriting"],
    },
    {
      name: "Standard",
      price: 1000,
      deliveryDays: 3,
      revisions: 2,
      description: "Up to 8 pages full lab report or research assignment",
      features: ["8 Pages", "Neat Handwriting", "Formula / Code appendix"],
    },
    {
      name: "Premium",
      price: 1800,
      deliveryDays: 5,
      revisions: 4,
      description: "Full comprehensive project / thesis chapter with references",
      features: ["15+ Pages", "Priority Turnaround", "Unlimited Revisions"],
    },
  ]);

  // Demo Attachments
  const [demoAttachmentUrl, setDemoAttachmentUrl] = React.useState("");
  const [demoAttachmentName, setDemoAttachmentName] = React.useState("");

  React.useEffect(() => {
    if (!sessionLoading && !session?.user) {
      toast.error("Please log in as an approved helper to create a gig");
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and Description are required");
      return;
    }

    const packages = tierType === "SINGLE" ? [singlePackage] : tieredPackages;
    const subjectTags = subjectTagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const gig = await createGig({
        title,
        description,
        category,
        subjectTags,
        coverImages: coverImageUrl ? [coverImageUrl] : [],
        tierType,
        packages,
        requiresHardcopy,
        handwritingStyle: requiresHardcopy ? handwritingStyle : undefined,
        attachments: demoAttachmentUrl
          ? [
              {
                fileUrl: demoAttachmentUrl,
                fileName: demoAttachmentName || "Sample Demo File",
                isPublicDemo: true,
              },
            ]
          : [],
      });

      toast.success("Gig published successfully!");
      router.push(`/gigs/${gig.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish gig");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/gigs">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Services
          </Button>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Fiverr-Style Academic Gigs
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Create a New Service Gig</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Offer your academic expertise to students. Choose between a single fixed rate or 3 tiered
          packages (Basic, Standard, Premium).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gig Overview</CardTitle>
            <CardDescription>
              Catchy title, category, and subject tags for search discoverability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                placeholder="e.g. I will write complete Calculus assignments with step-by-step proofs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="ASSIGNMENT">Assignment Help</option>
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="THESIS_RESEARCH">Thesis & Research</option>
                  <option value="HANDWRITTEN_HARDCOPY">Handwritten Hardcopy</option>
                  <option value="MATH_PROBLEM_SOLVING">Math Problem Solving</option>
                  <option value="PRESENTATION_SLIDES">Presentation Slides</option>
                  <option value="OTHER">Other Academic Service</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectTags">Custom Subject Tags (Comma-separated)</Label>
                <Input
                  id="subjectTags"
                  placeholder="e.g. Calculus, Differential Equations, Linear Algebra"
                  value={subjectTagsInput}
                  onChange={(e) => setSubjectTagsInput(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <textarea
                id="description"
                rows={5}
                className="flex w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Describe your qualifications, methodology, formatting style, and what students will receive..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL (Optional preview card)</Label>
              <Input
                id="coverImageUrl"
                placeholder="https://example.com/cover-image.jpg"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
            </div>

            {/* Hardcopy & Handwriting Toggles */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Physical Hardcopy Available</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable if you can deliver physical handwritten sheets or lab notebook copies.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={requiresHardcopy}
                  onChange={(e) => setRequiresHardcopy(e.target.checked)}
                />
              </div>

              {requiresHardcopy && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-xs">Handwriting Style Offered</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    value={handwritingStyle}
                    onChange={(e) => setHandwritingStyle(e.target.value)}
                  >
                    <option value="CURSIVE">Cursive</option>
                    <option value="PRINT">Clean Print</option>
                    <option value="MIXED">Mixed Casual</option>
                    <option value="MATH_EQUATION">Math & Equations</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Pricing & Package Tiers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pricing & Packages</CardTitle>
                <CardDescription>
                  Choose between a single price or offer 3 flexible tiers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTierType("SINGLE")}
                  className={`rounded-md px-3 py-1.5 transition-all ${
                    tierType === "SINGLE"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Single Price
                </button>
                <button
                  type="button"
                  onClick={() => setTierType("TIERED")}
                  className={`rounded-md px-3 py-1.5 transition-all ${
                    tierType === "TIERED"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  3 Tiers (Basic/Std/Prem)
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tierType === "SINGLE" ? (
              /* Single Package */
              <div className="rounded-xl border border-border/70 p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Price in BDT (৳) *</Label>
                    <Input
                      type="number"
                      min={50}
                      value={singlePackage.price}
                      onChange={(e) =>
                        setSinglePackage({ ...singlePackage, price: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Delivery Days *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={singlePackage.deliveryDays}
                      onChange={(e) =>
                        setSinglePackage({
                          ...singlePackage,
                          deliveryDays: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Revisions Included</Label>
                    <Input
                      type="number"
                      min={0}
                      value={singlePackage.revisions ?? 1}
                      onChange={(e) =>
                        setSinglePackage({ ...singlePackage, revisions: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Package Description</Label>
                  <Input
                    placeholder="Brief description of what is included"
                    value={singlePackage.description || ""}
                    onChange={(e) =>
                      setSinglePackage({ ...singlePackage, description: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              /* 3 Tier Packages */
              <div className="grid gap-4 sm:grid-cols-3">
                {tieredPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/70 p-4 space-y-3 bg-muted/10"
                  >
                    <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {pkg.name} Tier
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Price (৳)</Label>
                      <Input
                        type="number"
                        min={50}
                        value={pkg.price}
                        onChange={(e) => {
                          const next = [...tieredPackages];
                          next[idx].price = Number(e.target.value);
                          setTieredPackages(next);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Delivery (Days)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={pkg.deliveryDays}
                        onChange={(e) => {
                          const next = [...tieredPackages];
                          next[idx].deliveryDays = Number(e.target.value);
                          setTieredPackages(next);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Revisions</Label>
                      <Input
                        type="number"
                        min={0}
                        value={pkg.revisions ?? 1}
                        onChange={(e) => {
                          const next = [...tieredPackages];
                          next[idx].revisions = Number(e.target.value);
                          setTieredPackages(next);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <textarea
                        rows={2}
                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
                        value={pkg.description || ""}
                        onChange={(e) => {
                          const next = [...tieredPackages];
                          next[idx].description = e.target.value;
                          setTieredPackages(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Demo Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Work Attachment</CardTitle>
            <CardDescription>
              Attach a PDF or sample image of previous work so students can verify your quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demoName">Display File Name</Label>
              <Input
                id="demoName"
                placeholder="e.g. Sample_Calculus_Assignment.pdf"
                value={demoAttachmentName}
                onChange={(e) => setDemoAttachmentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoUrl">File URL</Label>
              <Input
                id="demoUrl"
                placeholder="https://example.com/my-sample.pdf"
                value={demoAttachmentUrl}
                onChange={(e) => setDemoAttachmentUrl(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/40 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Service Gig"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
