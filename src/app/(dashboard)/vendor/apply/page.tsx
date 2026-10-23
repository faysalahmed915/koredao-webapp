"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GraduationCap,
  PenTool,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { z } from "zod";
import {
  fetchMyVendorProfile,
  submitVendorApplication,
  VendorProfile,
} from "@/lib/profiles-api";
import {
  vendorApplicationSchema,
  VendorApplicationInput,
} from "@/lib/schemas/vendor-application.schema";

type Sample = VendorApplicationInput["handwritingSamples"][number];
type FormValues = z.input<typeof vendorApplicationSchema>;

const STEP_LABELS: Record<string, string> = {
  PENDING: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Needs Revision",
};

const stepOrder: { key: string; label: string }[] = [
  { key: "account", label: "Account Created" },
  { key: "apply", label: "Apply" },
  { key: "review", label: "Under Review" },
  { key: "approved", label: "Approved" },
];

function currentStep(status: VendorProfile["verificationStatus"] | null) {
  if (status === "APPROVED") return 4;
  if (status === "PENDING") return 3;
  if (status === "REJECTED") return 2;
  return 2;
}

function ImagePreview({ url }: { url: string }) {
  return (
    <div className="relative rounded-lg border border-border/60 bg-muted/30 aspect-square overflow-hidden">
      <img
        src={url}
        alt="Preview"
        className="h-full w-full object-cover"
        sizes="(max-width: 768px) 100vw, 300px"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xs">Preview</span>
      </div>
    </div>
  );
}

function stepBadgeClass(active: boolean, completed: boolean) {
  return completed
    ? "bg-emerald-500 border-emerald-500 text-emerald-700"
    : active
    ? "bg-indigo-500 border-indigo-500 text-white"
    : "border-border/30 bg-muted/50 text-muted-foreground";
}

export default function VendorApplyPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading, refetch } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [existingProfile, setExistingProfile] = React.useState<VendorProfile | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(vendorApplicationSchema),
    defaultValues: {
      realName: "",
      university: "",
      department: "",
      academicLevel: "UNDERGRADUATE",
      degree: "",
      passingYear: new Date().getFullYear(),
      bio: "",
      skills: "",
      idCardUrl: "",
      handwritingSamples: [
        {
          sampleUrl: "",
          style: "PRINT",
          neatnessScore: 8,
          description: "",
        },
      ],
    },
  });

  const { fields: sampleFields, append, remove } = useFieldArray({
    control,
    name: "handwritingSamples",
  });

  const samplesValue = watch("handwritingSamples") || [];

  React.useEffect(() => {
    if (session?.user) {
      fetchMyVendorProfile()
        .then((profile) => {
          if (profile) {
            setExistingProfile(profile);
            setValue("realName", profile.user?.realName || "");
            setValue("university", profile.university || "");
            setValue("department", profile.department || "");
            setValue("academicLevel", (profile.academicLevel || "UNDERGRADUATE") as any);
            setValue("degree", profile.degree || "");
            setValue("passingYear", profile.passingYear || new Date().getFullYear());
            setValue("bio", profile.bio || "");
            setValue("skills", profile.skills?.join(", ") || "");
            setValue("idCardUrl", profile.idCardUrl || "");
            // Reset samples to profile samples, defaulting one empty if none.
            const samples: Sample[] = profile.handwritingSamples?.length
              ? profile.handwritingSamples.map((s) => ({
                  sampleUrl: s.sampleUrl,
                  style: s.style as Sample["style"],
                  neatnessScore: s.neatnessScore ?? 8,
                  description: s.description || "",
                }))
              : [{ sampleUrl: "", style: "PRINT", neatnessScore: 8, description: "" }];
            // React-hook-form field array reset is not directly exposed; replace via setValue.
            setValue("handwritingSamples", samples);
          }
        })
        .catch(() => {
          toast.error("Failed to load your helper profile. Please try again.");
        })
        .finally(() => setLoading(false));
    } else if (!sessionLoading) {
      queueMicrotask(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, sessionLoading, setValue]);

  const handleAddSample = () => {
    append({ sampleUrl: "", style: "PRINT", neatnessScore: 8, description: "" });
  };

  const handleRemoveSample = (index: number) => {
    remove(index);
  };

  const onSubmit = async (data: FormValues) => {
    if (!session?.user) {
      toast.error("Please log in to submit a helper application");
      router.push("/login");
      return;
    }

    const payload = {
      realName: data.realName,
      university: data.university,
      department: data.department,
      academicLevel: data.academicLevel,
      degree: data.degree || undefined,
      passingYear: data.passingYear ? Number(data.passingYear) : undefined,
      bio: data.bio || undefined,
      skills: (data.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      idCardUrl: data.idCardUrl,
      handwritingSamples: data.handwritingSamples.map((s) => ({
        sampleUrl: s.sampleUrl,
        style: s.style,
        neatnessScore: s.neatnessScore == null ? undefined : Number(s.neatnessScore),
        description: s.description,
      })),
    };

    setSubmitting(true);
    try {
      const result = await submitVendorApplication(payload);
      setExistingProfile(result);
      toast.success("Vendor application submitted successfully! Our moderators will review it shortly.");
      // Refresh the auth session so the role badge (VENDOR) replaces the stale CUSTOMER role.
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  // Verified vendors should not see the application form — send them to the dashboard.
  React.useEffect(() => {
    if (existingProfile?.verificationStatus === "APPROVED") {
      router.replace("/dashboard");
    }
  }, [existingProfile, router]);

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const status = existingProfile?.verificationStatus ?? null;
  const canEdit = status === null || status === "REJECTED";
  const step = currentStep(status);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-8">
      {/* Onboarding stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-1 px-1">
          {stepOrder.map((s, i) => {
            const active = i + 1 === step;
            const completed = i + 1 < step;
            return (
              <React.Fragment key={s.key}>
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${stepBadgeClass(
                    active,
                    completed
                  )}`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-current shrink-0" />
                  )}
                  <span>{s.label}</span>
                </div>
                {i < stepOrder.length - 1 && (
                  <Separator orientation="vertical" className="h-3.5 shrink-0 opacity-40" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Existing status banner */}
      {existingProfile && (
        <div className="mb-8">
          {status === "PENDING" && (
            <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-sm">
              <Clock className="mt-0.5 h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                  Application Under Review
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your helper application for{" "}
                  <strong className="text-foreground">{existingProfile.university}</strong> (
                  {existingProfile.department}) was submitted on{" "}
                  {new Date(existingProfile.createdAt).toLocaleDateString()}. Our moderation team is
                  verifying your academic credentials and handwriting samples. You will receive access
                  to create gigs and bid on assignments once approved.
                </p>
              </div>
            </div>
          )}

          {status === "APPROVED" && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Verified KoreDao Academic Helper
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Congratulations! Your profile is verified and active. You can now create service
                    gigs, accept student assignments, and bid on projects.
                  </p>
                </div>
              </div>
              <Link href={`/assistance/${existingProfile.id}`}>
                <Button variant="outline" size="sm" className="border-emerald-500/30">
                  View Public Profile
                </Button>
              </Link>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="flex items-start gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur-sm">
              <XCircle className="mt-0.5 h-6 w-6 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-rose-700 dark:text-rose-400">
                  Application Needs Revision
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reason provided by moderator:{" "}
                  <span className="font-medium text-foreground">
                    {existingProfile.rejectionReason || "Credentials could not be verified."}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Update your details below and re-submit for review.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "APPROVED" && (
        <div className="mb-8 rounded-xl border border-border/60 bg-muted/50 p-6 text-center">
          <h3 className="font-semibold text-foreground">Application complete</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your helper profile is active. You can now create gigs and bid on assignments.
          </p>
        </div>
      )}

      {!status || status === "REJECTED" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              KoreDao Academic Helper Network
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Apply to Become an Academic Helper
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Help fellow university students with handwritten assignments, lab reports, research, and
              thesis formatting. Get paid safely with upfront escrow protection.
            </p>
          </div>

          {/* Step 1: Academic Background */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Academic Credentials</CardTitle>
                  <CardDescription>
                    Your university and department allow students from your campus to find you easily.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="realName">Verified Real Name *</Label>
                <Input
                  id="realName"
                  placeholder="e.g. John Doe"
                  {...register("realName")}
                  required
                  disabled={!canEdit}
                />
                {errors.realName && (
                  <p className="text-xs text-destructive">{errors.realName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Obligatory for academic helpers. This is your verified legal name
                  used during moderator verification.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="university">University / Institution *</Label>
                <Input
                  id="university"
                  placeholder="e.g. University of Dhaka, BUET, BRAC University, NSU"
                  {...register("university")}
                  required
                  disabled={!canEdit}
                />
                {errors.university && (
                  <p className="text-xs text-destructive">{errors.university.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department / Faculty *</Label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Science, Economics, Pharmacy"
                  {...register("department")}
                  required
                  disabled={!canEdit}
                />
                {errors.department && (
                  <p className="text-xs text-destructive">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicLevel">Academic Level</Label>
                <Controller
                  name="academicLevel"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="academicLevel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      disabled={!canEdit}
                    >
                      <option value="UNDERGRADUATE">Undergraduate (Bachelor)</option>
                      <option value="GRADUATE">Graduate (Master)</option>
                      <option value="POSTGRADUATE">Postgraduate</option>
                      <option value="DOCTORATE">Doctorate / PhD</option>
                      <option value="OTHER">Other</option>
                    </select>
                  )}
                />
                {errors.academicLevel && (
                  <p className="text-xs text-destructive">{errors.academicLevel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree Title (Optional)</Label>
                <Input
                  id="degree"
                  placeholder="e.g. B.Sc in CSE, BBA, MBBS"
                  {...register("degree")}
                  disabled={!canEdit}
                />
                {errors.degree && <p className="text-xs text-destructive">{errors.degree.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingYear">Graduation / Passing Year</Label>
                <Input
                  id="passingYear"
                  type="number"
                  min="2000"
                  max="2100"
                  {...register("passingYear")}
                  disabled={!canEdit}
                />
                {errors.passingYear && (
                  <p className="text-xs text-destructive">{errors.passingYear.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="skills">Subjects & Skills Expertise (Comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g. Calculus, Organic Chemistry, Python, Lab Reports, Discrete Math"
                  {...register("skills")}
                  disabled={!canEdit}
                />
                {errors.skills && <p className="text-xs text-destructive">{errors.skills.message}</p>}
                <p className="text-xs text-muted-foreground">
                  These tags help match you to relevant student assignment requests in the search engine.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Academic Bio & Experience</Label>
                <textarea
                  id="bio"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Highlight your academic achievements, assignment experience, and turnaround speed..."
                  {...register("bio", { maxLength: 1000 })}
                  disabled={!canEdit}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {(watch("bio") || "").length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Verification Proof */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student Verification Document</CardTitle>
                  <CardDescription>
                    Upload your University ID card photo or admission slip. This is private and only
                    viewable by KoreDao moderators.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="idCardUrl">Student ID / Document Image URL *</Label>
                <Input
                  id="idCardUrl"
                  placeholder="https://example.com/my-student-id.jpg or Cloudinary/Imgur link"
                  {...register("idCardUrl")}
                  required
                  disabled={!canEdit}
                />
                {errors.idCardUrl && (
                  <p className="text-xs text-destructive">{errors.idCardUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Make sure your name and university name are clearly legible in the image.
                </p>
              </div>
              {validUrl(watch("idCardUrl")) && (
                <ImagePreview url={watch("idCardUrl")} />
              )}
            </CardContent>
          </Card>

          {/* Step 3: Handwriting Samples Showcase */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <PenTool className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Handwriting Samples Showcase</CardTitle>
                    <CardDescription>
                      Provide clear photos of your handwriting for assignments and lab notebooks.
                    </CardDescription>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSample}
                    className="gap-1.5 text-xs"
                    disabled={isSubmitting}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Sample
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleFields.map((field, idx) => {
                const sample = samplesValue[idx];
                const sampleErrors = errors.handwritingSamples?.[idx];
                return (
                  <div
                    key={field.id}
                    className="relative rounded-lg border border-border/60 bg-muted/30 p-4 transition-all"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sample #{idx + 1}
                      </span>
                      {sampleFields.length > 1 && canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSample(idx)}
                          className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Image URL *</Label>
                        <Input
                          placeholder="https://example.com/handwriting-sample.jpg"
                          {...register(`handwritingSamples.${idx}.sampleUrl`)}
                          required
                          disabled={!canEdit || isSubmitting}
                        />
                        {sampleErrors?.sampleUrl && (
                          <p className="text-xs text-destructive">{sampleErrors.sampleUrl.message}</p>
                        )}
                        {validUrl(samplesValue[idx]?.sampleUrl) && (
                          <ImagePreview url={samplesValue[idx]!.sampleUrl} />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Handwriting Style</Label>
                        <Controller
                          name={`handwritingSamples.${idx}.style`}
                          control={control}
                          render={({ field: f }) => (
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                              {...f}
                              disabled={!canEdit || isSubmitting}
                            >
                              <option value="CURSIVE">Cursive Style</option>
                              <option value="PRINT">Clean Print</option>
                              <option value="MIXED">Mixed Casual</option>
                              <option value="MATH_EQUATION">Math / Equation Heavy</option>
                            </select>
                          )}
                        />
                        {sampleErrors?.style && (
                          <p className="text-xs text-destructive">{sampleErrors.style.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Neatness (1-10)</Label>
                        <Controller
                          name={`handwritingSamples.${idx}.neatnessScore`}
                          control={control}
                          render={({ field: f }) => (
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={(f.value ?? "") as unknown as string}
                              name={f.name}
                              onChange={(e) => f.onChange(Number(e.target.value) || undefined)}
                              disabled={!canEdit || isSubmitting}
                            />
                          )}
                        />
                        {sampleErrors?.neatnessScore && (
                          <p className="text-xs text-destructive">{sampleErrors.neatnessScore.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-4">
                        <Label className="text-xs">Sample Description</Label>
                        <Input
                          placeholder="e.g. Ruled notebook page with blue ballpoint pen, 30 lines/page"
                          {...register(`handwritingSamples.${idx}.description`)}
                          disabled={!canEdit || isSubmitting}
                        />
                        {sampleErrors?.description && (
                          <p className="text-xs text-destructive">{sampleErrors.description.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/40 pt-4">
              <span className="text-xs text-muted-foreground">
                Approved handwriting samples will be displayed in your public helper showcase.
              </span>
              <Button
                type="submit"
                disabled={!canEdit || !isValid || isSubmitting}
                className="bg-indigo-600 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : existingProfile?.verificationStatus === "REJECTED" ? (
                  "Re-submit Application"
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : null}
    </div>
  );
}

function validUrl(value: string | undefined) {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
