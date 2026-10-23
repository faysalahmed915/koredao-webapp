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
  Save,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { createAssignment } from "@/lib/assignments-api";
import { buildLoginHref } from "@/lib/auth-redirect";
import {
  MembershipAwareSubmit,
  MembershipGate,
} from "@/components/membership/membership-gate";
import {
  fetchMyDrafts,
  fetchDraft,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
  DraftAssignment,
  CreateDraftPayload,
} from "@/lib/drafts-api";

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

  // Draft persistence state
  const [drafts, setDrafts] = React.useState<DraftAssignment[]>([]);
  const [draftsLoading, setDraftsLoading] = React.useState(false);
  const [activeDraftId, setActiveDraftId] = React.useState<string | null>(null);
  const [draftSaving, setDraftSaving] = React.useState(false);

  React.useEffect(() => {
    if (!sessionLoading && !session?.user) {
      toast.error("Please log in to post an assignment request");
      router.push(buildLoginHref());
    }
  }, [session, sessionLoading, router]);

  // Load the user's saved drafts on mount so one can be resumed.
  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setDraftsLoading(true);
      fetchMyDrafts()
        .then((data) => {
          if (!cancelled) setDrafts(data);
        })
        .catch(() => {
          if (!cancelled) toast.error("Could not load saved drafts");
        })
        .finally(() => {
          if (!cancelled) setDraftsLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-save: persist the form as a draft whenever the user edits.
  const persistDraft = React.useCallback(
    async (isExplicit: boolean) => {
      if (!session?.user) return;

      const payload: CreateDraftPayload = {
        title,
        description,
        category,
        subject,
        type,
        deadline,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deliveryAddress: type === "HARDCOPY" ? deliveryAddress : undefined,
        preferredCampus: preferredCampus || undefined,
        preferredHandwritingStyle:
          type === "HARDCOPY" ? handwritingStyle : undefined,
        sampleFileUrls: sampleUrl ? [sampleUrl] : [],
        status: "DRAFT",
      };

      try {
        setDraftSaving(true);
        let saved: DraftAssignment;
        if (activeDraftId) {
          saved = await updateDraft(activeDraftId, payload);
        } else {
          saved = await createDraft(payload);
          setActiveDraftId(saved.id);
        }
        if (isExplicit) {
          toast.success("Draft saved");
        }
      } catch (err: any) {
        if (isExplicit) {
          toast.error(err.message || "Failed to save draft");
        }
      } finally {
        setDraftSaving(false);
      }
    },
    [
      title,
      description,
      category,
      subject,
      type,
      deadline,
      budgetMin,
      budgetMax,
      deliveryAddress,
      preferredCampus,
      handwritingStyle,
      sampleUrl,
      activeDraftId,
      session?.user,
    ],
  );

  // Wire every form field to the debounced auto-save.
  const makeSetter =
    (fn: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      fn(e.target.value);
      persistDraft(false);
    };

  const handleLoadDraft = async (draft: DraftAssignment) => {
    setTitle(draft.title);
    setDescription(draft.description);
    setCategory(draft.category as any);
    setSubject(draft.subject);
    setType(draft.type as any);
    setDeadline(draft.deadline.slice(0, 10));
    setBudgetMin(draft.budgetMin);
    setBudgetMax(draft.budgetMax);
    setDeliveryAddress(draft.deliveryAddress ?? "");
    setPreferredCampus(draft.preferredCampus ?? "");
    setHandwritingStyle(
      draft.preferredHandwritingStyle as any || "PRINT",
    );
    setSampleUrl((draft.sampleFileUrls?.[0] ?? ""));
    setActiveDraftId(draft.id);
    toast.success("Draft resumed — continue editing where you left off.");
  };

  const handleDeleteDraft = async (id: string) => {
    if (!window.confirm("Delete this draft?")) return;
    try {
      await deleteDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (activeDraftId === id) setActiveDraftId(null);
      toast.success("Draft deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete draft");
    }
  };

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
      // Always persist a final draft first so nothing is lost, then publish.
      await persistDraft(true);

      if (activeDraftId) {
        const result = await publishDraft(activeDraftId, {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        });
        toast.success(
          "Assignment request posted successfully! Bids will appear on your post.",
        );
        router.push(`/assignments/${result.assignment.id}`);
      } else {
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
          preferredHandwritingStyle:
            type === "HARDCOPY" ? handwritingStyle : undefined,
          sampleFileUrls: sampleUrl ? [sampleUrl] : [],
        });
        toast.success(
          "Assignment request posted successfully! Bids will appear on your post.",
        );
        router.push(`/assignments/${assignment.id}`);
      }
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
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

      {/* Draft resume workspace */}
      <Card className="border-indigo-500/30 bg-indigo-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Save className="h-4 w-4" />
            Your saved drafts
          </CardTitle>
          <div className="flex items-center gap-1">
            {draftsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={draftsLoading || draftSaving}
                onClick={() => {
                  setDraftsLoading(true);
                  fetchMyDrafts()
                    .then((data) => setDrafts(data))
                    .finally(() => setDraftsLoading(false));
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {draftsLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Loading drafts…
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No saved drafts yet. Start typing to auto-save.
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-xs ${
                    activeDraftId === draft.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <button
                    onClick={() => handleLoadDraft(draft)}
                    className="flex-1 text-left truncate hover:underline text-sm font-medium"
                  >
                    {draft.title}
                  </button>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(draft.updatedAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDraft(draft.id);
                    }}
                    className="p-1 text-rose-600 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-border/40 pt-3 px-4">
          <span className="text-xs text-muted-foreground">
            Drafts auto-save as you type.{" "}
            {activeDraftId ? (
              <>
                Currently editing:{" "}
                <span className="font-semibold">
                  {drafts.find((d) => d.id === activeDraftId)?.title}
                </span>
              </>
            ) : (
              "Start a draft to auto-save your progress."
            )}
          </span>
          {activeDraftId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveDraftId(null)}
              className="text-xs gap-1"
            >
              Clear draft
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Paid marketplace gate */}
      <MembershipGate action="post-job" />

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
                onChange={makeSetter(setTitle)}
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
                  onChange={makeSetter(setSubject)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    persistDraft(false);
                  }}
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
                onChange={makeSetter(setDescription)}
                required
              />
            </div>

            {/* Deliverable Type Picker */}
            <div className="space-y-2">
              <Label>Deliverable Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setType("SOFTCOPY");
                    persistDraft(false);
                  }}
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
                  onClick={() => {
                    setType("HARDCOPY");
                    persistDraft(false);
                  }}
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
                    onChange={makeSetter(setDeliveryAddress)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Handwriting Style</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    value={handwritingStyle}
                    onChange={(e) => {
                      setHandwritingStyle(e.target.value as any);
                      persistDraft(false);
                    }}
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
                onChange={makeSetter(setPreferredCampus)}
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
                  onChange={makeSetter(setDeadline)}
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
                  onChange={(e) => {
                    setBudgetMin(Number(e.target.value));
                    persistDraft(false);
                  }}
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
                  onChange={(e) => {
                    setBudgetMax(Number(e.target.value));
                    persistDraft(false);
                  }}
                  required
                />
              </div>
            </div>

            {/* Problem file URL */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="sampleUrl">Question Sheet / Rubric File URL (Optional)</Label>
              <Input
                id="sampleUrl"
                placeholder="https://storage.koredao.com/assignments/lab-manual.pdf"
                value={sampleUrl}
                onChange={makeSetter(setSampleUrl)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                persistDraft(true);
              }}
              disabled={submitting || draftSaving}
              className="gap-1"
            >
              {draftSaving ? (
                <Save className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save Draft
            </Button>
            <MembershipAwareSubmit
              action="post-job"
              isSubmitting={submitting}
              lockedLabel="Membership required to post"
              label="Publish Assignment Request"
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
            />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
