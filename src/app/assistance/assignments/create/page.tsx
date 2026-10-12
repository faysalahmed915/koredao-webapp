"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  FileText,
  PenTool,
  Calendar,
  DollarSign,
  MapPin,
  UploadCloud,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { createAssignment } from "@/lib/assignments-api";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("ASSIGNMENT");
  const [subject, setSubject] = React.useState("");
  const [type, setType] = React.useState<"SOFTCOPY" | "HARDCOPY">("SOFTCOPY");
  const [deadline, setDeadline] = React.useState("");
  const [budgetMin, setBudgetMin] = React.useState<number>(500);
  const [budgetMax, setBudgetMax] = React.useState<number>(1000);
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [preferredCampus, setPreferredCampus] = React.useState("");
  const [handwritingStyle, setHandwritingStyle] = React.useState("PRINT");
  const [sampleUrl, setSampleUrl] = React.useState("");

  React.useEffect(() => {
    if (!sessionLoading && !session?.user) {
      toast.error("Please log in to post an assignment request");
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !subject.trim() || !deadline) {
      toast.error("Please complete all required fields");
      return;
    }

    if (budgetMin > budgetMax) {
      toast.error("Minimum budget cannot be greater than maximum budget");
      return;
    }

    setSubmitting(true);
    try {
      const assignment = await createAssignment({
        title,
        description,
        category,
        subject,
        type,
        deadline: new Date(deadline).toISOString(),
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deliveryAddress: type === "HARDCOPY" ? deliveryAddress : undefined,
        preferredCampus: preferredCampus || undefined,
        preferredHandwritingStyle: type === "HARDCOPY" ? handwritingStyle : undefined,
        sampleFileUrls: sampleUrl ? [sampleUrl] : [],
      });

      toast.success("Assignment request posted successfully! Bids will appear on your post.");
      router.push(`/assignments/${assignment.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to post assignment");
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
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/assignments">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Job Board
          </Button>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Upwork Model
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Post an Assignment Request</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Describe what you need, set your budget range, and receive proposals from qualified campus helpers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assignment Overview</CardTitle>
            <CardDescription>
              Provide clear details so helpers can give you accurate turnaround and pricing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Physics 101 Young Modulus Lab Report with error calculations"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Course / Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Calculus, Physics, Economics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

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
                  <option value="OTHER">Other Academic Work</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Instructions & Criteria *</Label>
              <textarea
                id="description"
                rows={5}
                className="flex w-full rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Paste the problem set, required page length, special formulas, or professor guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Deliverable Type Picker */}
            <div className="space-y-2">
              <Label>Deliverable Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setType("SOFTCOPY")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    type === "SOFTCOPY"
                      ? "border-indigo-600 bg-indigo-500/5 shadow-sm"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <FileText className="h-4 w-4 text-indigo-500" /> Softcopy Digital
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, DOCX, or scanned high-res digital sheets.
                  </p>
                </div>

                <div
                  onClick={() => setType("HARDCOPY")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    type === "HARDCOPY"
                      ? "border-purple-600 bg-purple-500/5 shadow-sm"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <PenTool className="h-4 w-4 text-purple-500" /> Physical Hardcopy
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Handwritten lab notebook or bound paper delivered via courier/campus handoff.
                  </p>
                </div>
              </div>
            </div>

            {/* If Hardcopy: Address & Handwriting style */}
            {type === "HARDCOPY" && (
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Courier / Campus Delivery Location *</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="e.g. Curzon Hall, Dhaka University or Courier Branch"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Handwriting Style</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    value={handwritingStyle}
                    onChange={(e) => setHandwritingStyle(e.target.value)}
                  >
                    <option value="PRINT">Clean Print Font</option>
                    <option value="CURSIVE">Cursive Font</option>
                    <option value="MIXED">Mixed Casual</option>
                    <option value="MATH_EQUATION">Math & Equations Heavy</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-muted-foreground text-[11px]">
                      Need a precise handwriting match? Try our{" "}
                      <strong className="text-foreground">Visual Handwriting & Campus Matcher</strong>.
                    </span>
                  </div>
                  <Link
                    href="/handwriting-matcher"
                    target="_blank"
                    className="shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Matcher</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Proximity Matching: Campus */}
            <div className="space-y-2">
              <Label htmlFor="preferredCampus">Preferred University / Campus (Optional)</Label>
              <Input
                id="preferredCampus"
                placeholder="e.g. University of Dhaka, BUET, BRAC University"
                value={preferredCampus}
                onChange={(e) => setPreferredCampus(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Helpers from this university campus will see your post with priority.
              </p>
            </div>

            {/* Deadline & Budget Range */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline Date *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMin">Min Budget (৳) *</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  min={100}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Max Budget (৳) *</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  min={100}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Problem file URL */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="sampleUrl">Question Sheet / Rubric File URL (Optional)</Label>
              <Input
                id="sampleUrl"
                placeholder="https://storage.koredao.com/files/question-sheet.pdf"
                value={sampleUrl}
                onChange={(e) => setSampleUrl(e.target.value)}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                "Post Assignment Request"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
