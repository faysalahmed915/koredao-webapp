"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  fetchMyVendorProfile,
  submitVendorApplication,
  VendorProfile,
} from "@/lib/profiles-api";

export default function VendorApplyPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [existingProfile, setExistingProfile] = React.useState<VendorProfile | null>(null);

  // Form State
  const [university, setUniversity] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [academicLevel, setAcademicLevel] = React.useState("UNDERGRADUATE");
  const [degree, setDegree] = React.useState("");
  const [passingYear, setPassingYear] = React.useState<number>(new Date().getFullYear());
  const [bio, setBio] = React.useState("");
  const [skillsInput, setSkillsInput] = React.useState("");
  const [idCardUrl, setIdCardUrl] = React.useState("");

  // Handwriting Samples
  const [samples, setSamples] = React.useState<
    Array<{
      sampleUrl: string;
      style: "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION";
      neatnessScore: number;
      description: string;
    }>
  >([
    {
      sampleUrl: "",
      style: "CURSIVE",
      neatnessScore: 8,
      description: "Class notebook / assignment sample",
    },
  ]);

  React.useEffect(() => {
    if (session?.user) {
      fetchMyVendorProfile()
        .then((profile) => {
          if (profile) {
            setExistingProfile(profile);
            setUniversity(profile.university || "");
            setDepartment(profile.department || "");
            setAcademicLevel(profile.academicLevel || "UNDERGRADUATE");
            setDegree(profile.degree || "");
            setPassingYear(profile.passingYear || new Date().getFullYear());
            setBio(profile.bio || "");
            setSkillsInput(profile.skills?.join(", ") || "");
            setIdCardUrl(profile.idCardUrl || "");
          }
        })
        .finally(() => setLoading(false));
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [session, sessionLoading]);

  const handleAddSample = () => {
    setSamples([
      ...samples,
      {
        sampleUrl: "",
        style: "PRINT",
        neatnessScore: 8,
        description: "",
      },
    ]);
  };

  const handleRemoveSample = (index: number) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please log in to submit a helper application");
      router.push("/login");
      return;
    }

    if (!university.trim() || !department.trim()) {
      toast.error("University and Department are required");
      return;
    }

    if (!idCardUrl.trim()) {
      toast.error("Please provide a valid Student ID proof URL");
      return;
    }

    const validSamples = samples.filter((s) => s.sampleUrl.trim().length > 0);
    if (validSamples.length === 0) {
      toast.error("Please provide at least one handwriting sample URL");
      return;
    }

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const result = await submitVendorApplication({
        university,
        department,
        academicLevel,
        degree,
        passingYear: Number(passingYear),
        bio,
        skills,
        idCardUrl,
        handwritingSamples: validSamples,
      });

      setExistingProfile(result);
      toast.success("Vendor application submitted successfully! Our moderators will review it shortly.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-8">
      {/* Existing Status Banner */}
      {existingProfile && (
        <div className="mb-8">
          {existingProfile.verificationStatus === "PENDING" && (
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

          {existingProfile.verificationStatus === "APPROVED" && (
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
              <Link href={`/helpers/${existingProfile.id}`}>
                <Button variant="outline" size="sm" className="border-emerald-500/30">
                  View Public Profile
                </Button>
              </Link>
            </div>
          )}

          {existingProfile.verificationStatus === "REJECTED" && (
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
                  You can update your details below and re-submit for review.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-8">
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
              <Label htmlFor="university">University / Institution *</Label>
              <Input
                id="university"
                placeholder="e.g. University of Dhaka, BUET, BRAC University, NSU"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department / Faculty *</Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science, Economics, Pharmacy"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicLevel">Academic Level</Label>
              <select
                id="academicLevel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
              >
                <option value="UNDERGRADUATE">Undergraduate (Bachelor)</option>
                <option value="GRADUATE">Graduate (Master)</option>
                <option value="POSTGRADUATE">Postgraduate</option>
                <option value="DOCTORATE">Doctorate / PhD</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree Title (Optional)</Label>
              <Input
                id="degree"
                placeholder="e.g. B.Sc in CSE, BBA, MBBS"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingYear">Graduation / Passing Year</Label>
              <Input
                id="passingYear"
                type="number"
                min="2000"
                max="2035"
                value={passingYear}
                onChange={(e) => setPassingYear(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="skills">Subjects & Skills Expertise (Comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g. Calculus, Organic Chemistry, Python, Lab Reports, Discrete Math"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
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
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
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
            <Label htmlFor="idCardUrl">Student ID / Document Image URL *</Label>
            <Input
              id="idCardUrl"
              placeholder="https://example.com/my-student-id.jpg or Cloudinary/Imgur link"
              value={idCardUrl}
              onChange={(e) => setIdCardUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Make sure your name and university name are clearly legible in the image.
            </p>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSample}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Sample
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {samples.map((sample, idx) => (
              <div
                key={idx}
                className="relative rounded-lg border border-border/60 bg-muted/30 p-4 transition-all"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sample #{idx + 1}
                  </span>
                  {samples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSample(idx)}
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Image URL *</Label>
                    <Input
                      placeholder="https://example.com/handwriting-sample.jpg"
                      value={sample.sampleUrl}
                      onChange={(e) => {
                        const next = [...samples];
                        next[idx].sampleUrl = e.target.value;
                        setSamples(next);
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Handwriting Style</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      value={sample.style}
                      onChange={(e) => {
                        const next = [...samples];
                        next[idx].style = e.target.value as any;
                        setSamples(next);
                      }}
                    >
                      <option value="CURSIVE">Cursive Style</option>
                      <option value="PRINT">Clean Print</option>
                      <option value="MIXED">Mixed Casual</option>
                      <option value="MATH_EQUATION">Math / Equation Heavy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <Label className="text-xs">Sample Description</Label>
                    <Input
                      placeholder="e.g. Ruled notebook page with blue ballpoint pen, 30 lines/page"
                      value={sample.description}
                      onChange={(e) => {
                        const next = [...samples];
                        next[idx].description = e.target.value;
                        setSamples(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 pt-4">
            <span className="text-xs text-muted-foreground">
              Approved handwriting samples will be displayed in your public helper showcase.
            </span>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 font-medium text-white hover:bg-indigo-700"
            >
              {submitting ? (
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
    </div>
  );
}
