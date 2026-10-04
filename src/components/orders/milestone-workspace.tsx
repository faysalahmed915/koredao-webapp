"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Truck,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  fetchOrderCheckpoints,
  createCheckpoint,
  submitCheckpointProgress,
  reviewCheckpoint,
  deleteCheckpoint,
  type ProjectCheckpoint,
} from "@/lib/milestones-api";

interface MilestoneWorkspaceProps {
  orderId: string;
  isCustomer: boolean;
  isHelper: boolean;
  orderStatus: string;
}

export function MilestoneWorkspace({
  orderId,
  isCustomer,
  isHelper,
  orderStatus,
}: MilestoneWorkspaceProps) {
  const [checkpoints, setCheckpoints] = React.useState<ProjectCheckpoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Add Checkpoint Modal State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newTargetDate, setNewTargetDate] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Submit Progress Modal State
  const [activeCheckpoint, setActiveCheckpoint] = React.useState<ProjectCheckpoint | null>(null);
  const [submitFileUrl, setSubmitFileUrl] = React.useState("");
  const [submitPhotoUrls, setSubmitPhotoUrls] = React.useState("");
  const [submitCourier, setSubmitCourier] = React.useState("");
  const [submitNotes, setSubmitNotes] = React.useState("");
  const [isSubmittingProgress, setIsSubmittingProgress] = React.useState(false);

  // Review Modal State
  const [reviewingCheckpoint, setReviewingCheckpoint] = React.useState<ProjectCheckpoint | null>(null);
  const [reviewDecision, setReviewDecision] = React.useState<"ACCEPTED" | "REVISION_REQUESTED">("ACCEPTED");
  const [reviewFeedback, setReviewFeedback] = React.useState("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  const loadCheckpoints = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrderCheckpoints(orderId);
      setCheckpoints(data);
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    loadCheckpoints();
  }, [loadCheckpoints]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a checkpoint title");
      return;
    }

    setIsCreating(true);
    try {
      await createCheckpoint({
        orderId,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        targetDate: newTargetDate ? new Date(newTargetDate).toISOString() : undefined,
      });
      toast.success("Milestone checkpoint created!");
      setShowAddModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewTargetDate("");
      loadCheckpoints();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create checkpoint");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckpoint) return;

    const photos = submitPhotoUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (!submitFileUrl && photos.length === 0 && !submitCourier && !submitNotes) {
      toast.error("Please provide at least a file, proof photo, or courier update");
      return;
    }

    setIsSubmittingProgress(true);
    try {
      await submitCheckpointProgress(activeCheckpoint.id, {
        submittedFileUrl: submitFileUrl.trim() || undefined,
        proofPhotoUrls: photos.length > 0 ? photos : undefined,
        courierTracking: submitCourier.trim() || undefined,
        vendorNotes: submitNotes.trim() || undefined,
      });
      toast.success("Progress draft submitted for client inspection!");
      setActiveCheckpoint(null);
      setSubmitFileUrl("");
      setSubmitPhotoUrls("");
      setSubmitCourier("");
      setSubmitNotes("");
      loadCheckpoints();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit progress");
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingCheckpoint) return;

    setIsSubmittingReview(true);
    try {
      await reviewCheckpoint(reviewingCheckpoint.id, {
        status: reviewDecision,
        clientFeedback: reviewFeedback.trim() || undefined,
      });
      toast.success(
        reviewDecision === "ACCEPTED"
          ? "Checkpoint accepted! Great progress."
          : "Revision requested on this milestone.",
      );
      setReviewingCheckpoint(null);
      setReviewFeedback("");
      loadCheckpoints();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteCheckpoint = async (id: string) => {
    if (!confirm("Are you sure you want to remove this milestone?")) return;
    try {
      await deleteCheckpoint(id);
      toast.success("Checkpoint removed");
      loadCheckpoints();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete checkpoint");
    }
  };

  const completedCount = checkpoints.filter((cp) => cp.status === "ACCEPTED").length;
  const progressPercent = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;
  const isOrderActive = orderStatus === "ESCROW_HELD" || orderStatus === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      {/* Header and Progress Overview */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-foreground">Project Milestone Checkpoints</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Incremental draft reviews, handwritten neatness preview scans, and courier tracking.
            </p>
          </div>

          {isHelper && isOrderActive && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Checkpoint</span>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {checkpoints.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Milestones Completed:</span>
              <span className="font-bold text-foreground font-mono">
                {completedCount} of {checkpoints.length} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Checkpoints Timeline / List */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <span>Loading milestone checkpoints...</span>
        </div>
      ) : checkpoints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h4 className="font-semibold text-foreground text-sm">No checkpoints defined yet</h4>
          <p className="text-xs max-w-md mx-auto mt-1 mb-4">
            {isHelper
              ? "Add checkpoints (e.g. Outline, 50% Draft, Sample Handwriting Page) so the client can monitor your progress with confidence."
              : "The helper has not yet created milestone checkpoints for this assignment. Casual updates can still be coordinated in the chat."}
          </p>
          {isHelper && isOrderActive && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              variant="outline"
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create First Checkpoint
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {checkpoints.map((cp, idx) => {
            const isAccepted = cp.status === "ACCEPTED";
            const isSubmitted = cp.status === "SUBMITTED";
            const isRevision = cp.status === "REVISION_REQUESTED";

            return (
              <div
                key={cp.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isAccepted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isSubmitted
                    ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                    : isRevision
                    ? "border-rose-500/30 bg-rose-500/5"
                    : "border-border/60 bg-card"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-foreground text-sm">{cp.title}</h4>

                      {/* Status Badges */}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Accepted
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                          <Clock className="h-3 w-3" /> Ready for Review
                        </span>
                      )}
                      {isRevision && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <RotateCcw className="h-3 w-3" /> Revision Requested
                        </span>
                      )}
                      {cp.status === "PENDING" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                          Pending Draft
                        </span>
                      )}
                    </div>

                    {cp.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                        {cp.description}
                      </p>
                    )}

                    {cp.targetDate && (
                      <p className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Target Date:{" "}
                        {new Date(cp.targetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Top-Right Action Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                    {isHelper && isOrderActive && cp.status !== "ACCEPTED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveCheckpoint(cp);
                            setSubmitFileUrl(cp.submittedFileUrl || "");
                            setSubmitPhotoUrls((cp.proofPhotoUrls || []).join("\n"));
                            setSubmitCourier(cp.courierTracking || "");
                            setSubmitNotes(cp.vendorNotes || "");
                          }}
                          className="text-xs h-7 px-2.5 gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                        >
                          <Send className="h-3 w-3" />
                          <span>{isSubmitted ? "Update Submission" : "Submit Progress"}</span>
                        </Button>
                        {cp.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCheckpoint(cp.id)}
                            className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                            title="Delete Checkpoint"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    {isCustomer && isSubmitted && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewingCheckpoint(cp);
                            setReviewDecision("REVISION_REQUESTED");
                          }}
                          className="text-xs h-7 px-2.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                        >
                          Request Revision
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setReviewingCheckpoint(cp);
                            setReviewDecision("ACCEPTED");
                          }}
                          className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions & Deliverable Proofs Section */}
                {(cp.submittedFileUrl ||
                  (cp.proofPhotoUrls && cp.proofPhotoUrls.length > 0) ||
                  cp.courierTracking ||
                  cp.vendorNotes) && (
                  <div className="mt-4 pt-3.5 border-t border-border/40 space-y-3">
                    {/* Helper Notes */}
                    {cp.vendorNotes && (
                      <div className="text-xs bg-muted/40 p-2.5 rounded-xl border border-border/40">
                        <strong className="text-foreground">Helper Note:</strong>{" "}
                        <span className="text-muted-foreground">{cp.vendorNotes}</span>
                      </div>
                    )}

                    {/* Files and Courier badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {cp.submittedFileUrl && (
                        <a
                          href={cp.submittedFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Submitted Draft</span>
                          <Download className="h-3 w-3" />
                        </a>
                      )}

                      {cp.courierTracking && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-mono">
                          <Truck className="h-3.5 w-3.5" />
                          <span>Tracking: {cp.courierTracking}</span>
                        </div>
                      )}
                    </div>

                    {/* Handwriting Proof Photos Gallery */}
                    {cp.proofPhotoUrls && cp.proofPhotoUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>Handwriting Draft Proofs & Scans ({cp.proofPhotoUrls.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cp.proofPhotoUrls.map((url, pIdx) => (
                            <a
                              key={pIdx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative h-20 w-28 rounded-lg overflow-hidden border border-border/80 bg-muted hover:ring-2 hover:ring-indigo-500 transition-all"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Proof ${pIdx + 1}`}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Client Feedback Banner */}
                {cp.clientFeedback && (
                  <div
                    className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      isAccepted
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Client Feedback:</strong> {cp.clientFeedback}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Checkpoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">Add Milestone Checkpoint</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outline & References, 50% Draft, Sample Pages"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Deliverable Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What will you submit in this checkpoint? (e.g. 5 handwritten pages of math derivations)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Expected Target Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  {isCreating ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  Create Checkpoint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Progress Modal */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-bold text-base text-foreground">Submit Milestone Deliverables</h3>
                <p className="text-xs text-muted-foreground font-medium">{activeCheckpoint.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCheckpoint(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProgressSubmit} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Digital Draft File URL (PDF, DOCX, ZIP)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://storage.koredao.com/..."
                  value={submitFileUrl}
                  onChange={(e) => setSubmitFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Handwriting Sample & Proof Photos (1 URL per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="https://images.unsplash.com/... (Upload image URLs of handwriting pages for client style inspection)"
                  value={submitPhotoUrls}
                  onChange={(e) => setSubmitPhotoUrls(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Courier Tracking / Hardcopy Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Courier: SF-1299302, In-person library drop"
                  value={submitCourier}
                  onChange={(e) => setSubmitCourier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Helper Notes for Client
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your progress and what parts you would like the client to check..."
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCheckpoint(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingProgress}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  {isSubmittingProgress ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  Submit Progress
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">
                {reviewDecision === "ACCEPTED" ? "Accept Milestone" : "Request Milestone Changes"}
              </h3>
              <button
                type="button"
                onClick={() => setReviewingCheckpoint(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  {reviewDecision === "ACCEPTED" ? "Congratulatory Note (Optional)" : "Feedback / Correction Notes *"}
                </label>
                <textarea
                  rows={4}
                  required={reviewDecision === "REVISION_REQUESTED"}
                  placeholder={
                    reviewDecision === "ACCEPTED"
                      ? "Great work on this draft! Proceed with the rest."
                      : "Please write more neatly on page 2 and recalculate the matrix eigenvalues..."
                  }
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewingCheckpoint(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingReview}
                  className={
                    reviewDecision === "ACCEPTED"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      : "bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                  }
                >
                  {isSubmittingReview ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  {reviewDecision === "ACCEPTED" ? "Confirm Acceptance" : "Send Revision Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
