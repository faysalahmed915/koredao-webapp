"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  PenTool,
  FileText,
  DollarSign,
  CheckCircle2,
  Download,
  ArrowLeft,
  Users,
  Star,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  fetchAssignmentById,
  submitBid,
  acceptBid,
  Assignment,
  Bid,
} from "@/lib/assignments-api";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [assignment, setAssignment] = React.useState<Assignment | null>(null);

  // Proposal Form State (for helpers)
  const [proposedPrice, setProposedPrice] = React.useState<number>(800);
  const [deliveryDays, setDeliveryDays] = React.useState<number>(2);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [sampleUrl, setSampleUrl] = React.useState("");
  const [submittingBid, setSubmittingBid] = React.useState(false);
  const [acceptingBidId, setAcceptingBidId] = React.useState<string | null>(null);

  const loadAssignment = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAssignmentById(id);
      setAssignment(data);
      if (data.budgetMin) {
        setProposedPrice(data.budgetMin);
      }
    } catch {
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id, loadAssignment]);

  const isOwner = session?.user?.id && assignment?.customerId === session.user.id;
  const isHelper = (session?.user as any)?.role === "VENDOR";

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please log in to submit a proposal");
      router.push("/login");
      return;
    }

    if (!isHelper) {
      toast.error("Only approved academic helpers can submit bids. Please apply first!");
      router.push("/vendor/apply");
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please write a brief cover letter for the student");
      return;
    }

    setSubmittingBid(true);
    try {
      await submitBid(id, {
        proposedPrice: Number(proposedPrice),
        deliveryDays: Number(deliveryDays),
        coverLetter,
        sampleUrls: sampleUrl ? [sampleUrl] : [],
      });

      toast.success("Proposal submitted successfully!");
      setCoverLetter("");
      setSampleUrl("");
      loadAssignment();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit proposal");
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      await acceptBid(id, bidId);
      toast.success("Proposal accepted! Helper is now hired for this project.");
      loadAssignment();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept proposal");
    } finally {
      setAcceptingBidId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold">Assignment Request Not Found</h2>
        <Link href="/assignments" className="mt-6 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Board
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/assignments">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all assignments
          </Button>
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Assignment Details & Proposals (7 cols) */}
        <div className="space-y-8 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {assignment.subject}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {assignment.category.replace(/_/g, " ")}
              </span>
              {assignment.type === "HARDCOPY" ? (
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <PenTool className="h-3 w-3" /> Hardcopy Required
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Softcopy
                </span>
              )}
              {assignment.status === "ASSIGNED" && (
                <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
                  Assigned / In Progress
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl leading-snug">
              {assignment.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/50 pb-4">
              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Due {new Date(assignment.deadline).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {assignment.bidsCount} Proposals
              </span>
              {assignment.preferredCampus && (
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Campus: {assignment.preferredCampus}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-base font-bold">Assignment Instructions</h2>
            <div className="rounded-xl border border-border/60 bg-card p-5 text-sm leading-relaxed whitespace-pre-line">
              {assignment.description}
            </div>
          </div>

          {/* Attached Files */}
          {assignment.sampleFileUrls && assignment.sampleFileUrls.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold">Problem Sheets & Attachments</h3>
              <div className="space-y-2">
                {assignment.sampleFileUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Attachment #{i + 1}</span>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proposals Section (Only visible to owner or bidding helper) */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" /> Received Proposals ({assignment.bids?.length || 0})
            </h2>

            {assignment.bids && assignment.bids.length > 0 ? (
              <div className="space-y-4">
                {assignment.bids.map((bid) => (
                  <Card
                    key={bid.id}
                    className={`border-border/70 p-5 ${
                      bid.status === "ACCEPTED" ? "border-emerald-500/60 bg-emerald-500/5" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={bid.vendorProfile?.user?.image || ""} />
                          <AvatarFallback className="text-xs font-bold bg-indigo-500/10 text-indigo-600">
                            {bid.vendorProfile?.user?.name?.slice(0, 2).toUpperCase() || "KH"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">
                              {bid.vendorProfile?.user?.name || "Helper"}
                            </span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bid.vendorProfile?.university} • {bid.vendorProfile?.department}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-base font-extrabold text-foreground">
                          ৳{bid.proposedPrice}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          in {bid.deliveryDays} days
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {bid.coverLetter}
                    </div>

                    {isOwner && assignment.status === "OPEN" && (
                      <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                        <Button
                          size="sm"
                          disabled={acceptingBidId === bid.id}
                          onClick={() => handleAcceptBid(bid.id)}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                        >
                          {acceptingBidId === bid.id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Accept Proposal & Hire
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">
                No proposals submitted yet. Verified helpers will bid shortly!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Budget & Bid Submission Drawer (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Budget Summary Card */}
          <Card className="border-border/80 p-6 shadow-sm">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Client Budget
            </span>
            <div className="mt-1 text-2xl font-extrabold text-foreground">
              ৳{assignment.budgetMin} - ৳{assignment.budgetMax}
            </div>

            <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
              <div className="flex justify-between">
                <span>Deliverable Type</span>
                <strong className="text-foreground">{assignment.type}</strong>
              </div>
              <div className="flex justify-between">
                <span>Subject</span>
                <strong className="text-foreground">{assignment.subject}</strong>
              </div>
              {assignment.deliveryAddress && (
                <div className="flex justify-between">
                  <span>Courier Address</span>
                  <span className="text-foreground text-right truncate max-w-[200px]">
                    {assignment.deliveryAddress}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Proposal Submission Form (Visible to Helpers) */}
          {!isOwner && assignment.status === "OPEN" && (
            <Card className="border-indigo-500/30 p-6 shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-500" /> Submit a Proposal
                </CardTitle>
                <CardDescription className="text-xs">
                  Propose your price and turnaround speed. You may submit counter-offers if needed.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Your Price (৳) *</Label>
                    <Input
                      type="number"
                      min={50}
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Delivery (Days) *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Cover Letter / Approach *</Label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Explain why you are qualified, your expected workflow, and any guarantees..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Sample / Demo URL (Optional)</Label>
                  <Input
                    placeholder="https://example.com/sample-lab.pdf"
                    value={sampleUrl}
                    onChange={(e) => setSampleUrl(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingBid}
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs py-5"
                >
                  {submittingBid ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3.5 w-3.5" />
                  )}
                  Submit Proposal
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
