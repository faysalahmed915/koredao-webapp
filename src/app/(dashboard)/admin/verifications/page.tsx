"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GraduationCap,
  PenTool,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
  User,
  UserPlus,
  MessageCircle,
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
  fetchPendingApplications,
  reviewVendorApplication,
  VendorProfile,
} from "@/lib/profiles-api";
import { getOrCreateConversation } from "@/lib/chat-api";
import { buildLoginHref } from "@/lib/auth-redirect";

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [applications, setApplications] = React.useState<VendorProfile[]>([]);
  const [total, setTotal] = React.useState(0);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [filterUniversity, setFilterUniversity] = React.useState("");
  const [filterDepartment, setFilterDepartment] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Reject Modal state
  const [rejectingProfile, setRejectingProfile] = React.useState<VendorProfile | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  // Real name input per pending application (staff-only identity verification field)
  const [realNameInputs, setRealNameInputs] = React.useState<Record<string, string>>({});

  const loadPending = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingApplications();
      setApplications(data.items);
      setTotal(data.total);
      setFilterUniversity("");
      setFilterDepartment("");
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to load pending applications");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredApplications = React.useMemo(
    () =>
      applications.filter((app) => {
        if (filterUniversity && app.university !== filterUniversity)
          return false;
        if (filterDepartment && app.department !== filterDepartment)
          return false;
        return true;
      }),
    [applications, filterUniversity, filterDepartment],
  );

  const isSelectionEmpty = selectedIds.size === 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (isSelectionEmpty) {
      setSelectedIds(new Set(filteredApplications.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessingId("bulk");
    let ok = 0;
    let fail = 0;
    for (const id of ids) {
      try {
        await reviewVendorApplication(id, "APPROVED", undefined, undefined);
        ok++;
      } catch {
        fail++;
      }
    }
    setSelectedIds(new Set());
    setProcessingId(null);
    toast.success(
      `Bulk approve complete: ${ok} approved${fail > 0 ? `, ${fail} failed` : ""}`,
    );
    void loadPending();
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Reject ${selectedIds.size} selected applications?`)) return;
    const ids = Array.from(selectedIds);
    setProcessingId("bulk");
    let ok = 0;
    let fail = 0;
    for (const id of ids) {
      try {
        await reviewVendorApplication(id, "REJECTED", "Bulk rejection by moderator", undefined);
        ok++;
      } catch {
        fail++;
      }
    }
    setSelectedIds(new Set());
    setProcessingId(null);
    toast.success(
      `Bulk reject complete: ${ok} rejected${fail > 0 ? `, ${fail} failed` : ""}`,
    );
    void loadPending();
  };

  React.useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        toast.error("Access restricted: Administrator role required");
        router.push("/");
        return;
      }
      // Defer so the loader's setState is not synchronous within this effect.
      queueMicrotask(() => loadPending());
    } else if (!sessionLoading) {
      toast.error("Please log in as an administrator");
      router.push(buildLoginHref());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, sessionLoading, router]);

  const handleApprove = async (profileId: string, realName?: string) => {
    setProcessingId(profileId);
    try {
      await reviewVendorApplication(profileId, "APPROVED", undefined, realName);
      toast.success("Vendor application approved! User promoted to Helper.");
      setApplications((prev) => prev.filter((app) => app.id !== profileId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProfile) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for the applicant");
      return;
    }

    setProcessingId(rejectingProfile.id);
    try {
      await reviewVendorApplication(rejectingProfile.id, "REJECTED", rejectionReason);
      toast.success("Application marked as rejected with feedback sent");
      setApplications((prev) => prev.filter((app) => app.id !== rejectingProfile.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setRejectingProfile(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Administration & Moderation
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Helper Verification Applications
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Review student credentials, university ID documents, and handwriting samples before
          granting helper permissions.
        </p>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500/50" />
          <h3 className="mt-4 text-lg font-semibold">Queue is Clear!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No pending vendor verification applications right now.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-wrap gap-3">
              <Label htmlFor="filter-university" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block sm:hidden">
                University
              </Label>
              <Input
                id="filter-university"
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                placeholder="Filter by university…"
                className="h-9 w-48 text-xs sm:w-auto"
              />
              <Label htmlFor="filter-department" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block sm:hidden">
                Department
              </Label>
              <Input
                id="filter-department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                placeholder="Filter by department…"
                className="h-9 w-48 text-xs sm:w-auto"
              />
              {(filterUniversity || filterDepartment) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFilterUniversity("");
                    setFilterDepartment("");
                    setSelectedIds(new Set());
                  }}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border/60">
                <span className="text-xs font-semibold text-foreground">
                  {selectedIds.size} selected
                </span>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={processingId === "bulk"}
                  className="bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  {processingId === "bulk" ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  )}
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={processingId === "bulk"}
                  className="text-xs font-semibold"
                >
                  Bulk Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs"
                >
                  Clear selection
                </Button>
              </div>
            )}
          </div>

          {filteredApplications.map((app) => (
            <Card
              key={app.id}
              className={`overflow-hidden border-border/80 ${
                selectedIds.has(app.id) ? "ring-1 ring-indigo-500" : ""
              }`}
            >
              <CardHeader className="bg-muted/20 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="h-4 w-4 shrink-0 rounded border-border text-indigo-600 focus:ring-indigo-500"
                      aria-label={`Select ${app.user?.name}`}
                    />
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={app.user?.image || ""} />
                      <AvatarFallback className="bg-indigo-500/10 text-indigo-600 font-bold">
                        {app.user?.name?.slice(0, 2).toUpperCase() || "AP"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">{app.user?.name}</CardTitle>
                      <CardDescription className="text-xs">{app.user?.email}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Pending Review
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Academic Background */}
                <div className="grid gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">University</span>
                    <strong className="text-foreground">{app.university}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Department</span>
                    <strong className="text-foreground">{app.department}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Academic Level / Degree</span>
                    <strong className="text-foreground">
                      {app.academicLevel} {app.degree ? `(${app.degree})` : ""}
                    </strong>
                  </div>
                </div>

                {/* Skills & Bio */}
                {app.skills && app.skills.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Expertise Subjects</span>
                    <div className="flex flex-wrap gap-1">
                      {app.skills.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-muted/80 px-2 py-0.5 text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Documents & Handwriting */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/40">
                  {/* Student ID Proof */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-2">
                      Student ID Card Document
                    </span>
                    {app.idCardUrl ? (
                      <div className="rounded-lg border border-border/60 overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={app.idCardUrl}
                          alt="Student ID Proof"
                          className="max-h-48 w-full object-contain"
                        />
                        <div className="p-2 border-t border-border/40 flex justify-end">
                          <a
                            href={app.idCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 font-medium"
                          >
                            Open Full Image <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No document uploaded.</p>
                    )}
                  </div>

                  {/* Handwriting Samples */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-2">
                      Submitted Handwriting Samples ({app.handwritingSamples?.length || 0})
                    </span>
                    <div className="space-y-2">
                      {app.handwritingSamples?.map((sample) => (
                        <div
                          key={sample.id}
                          className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sample.sampleUrl}
                            alt="Sample"
                            className="h-12 w-12 rounded object-cover border"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{sample.style}</span>
                              <span className="text-muted-foreground">{sample.neatnessScore}/10 Neat</span>
                            </div>
                            {sample.description && (
                              <p className="truncate text-muted-foreground text-[11px]">
                                {sample.description}
                              </p>
                            )}
                          </div>
                          <a
                            href={sample.sampleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Verified Real Name (staff-only identity verification field) */}
              {app.user?.realName && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-amber-50/50">
                  <User className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Verified Real Name:</span>{" "}
                  <span className="text-sm text-foreground">{app.user.realName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <label className="text-xs font-semibold text-muted-foreground">
                  Enter Verified Real Name
                </label>
                <Input
                  value={realNameInputs[app.id] || ""}
                  onChange={(e) =>
                    setRealNameInputs({
                      ...realNameInputs,
                      [app.id]: e.target.value,
                    })
                  }
                  placeholder="e.g. John Doe"
                  disabled={processingId === app.id}
                />
              </div>

              {/* Staff actions: visit the helper's public profile or start a chat */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <Link
                  href={`/assistance/${app.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit Public Profile
                </Link>
                <Button
                  size="sm"
                  onClick={() => {
                    void getOrCreateConversation({
                      vendorProfileId: app.id,
                    }).then(() => {
                      router.push("/messages");
                    });
                  }}
                  disabled={processingId === app.id}
                  className="text-sm bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Chat with Helper
                </Button>
              </div>

              <CardFooter className="flex justify-end gap-3 border-t border-border/40 pt-4 bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingProfile(app)}
                  disabled={processingId === app.id}
                  className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject with Reason
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(app.id, realNameInputs[app.id] || undefined)}
                  disabled={processingId === app.id}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                >
                  {processingId === app.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}
                  Approve Application
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold">Reject Application</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Provide feedback for <strong className="text-foreground">{rejectingProfile.user?.name}</strong>{" "}
              explaining what needs correction (e.g. illegible ID card, missing clear samples).
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <textarea
                rows={3}
                className="w-full rounded-md border border-input bg-background p-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. ID card image is blurred and expiry date is missing. Please re-submit with a clear photo."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectingProfile(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  disabled={processingId === rejectingProfile.id}
                >
                  {processingId === rejectingProfile.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
