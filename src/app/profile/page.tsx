"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Lock,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Laptop,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  BookOpen,
  Phone,
  Building2,
  MapPin,
  Clock,
  Star,
  FileCheck,
  FileText,
  Wallet,
  Edit3,
  Award,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession, signOut } from "@/lib/auth-client";
import { BACKEND_URL, getApiHeaders } from "@/lib/api-client";
import {
  fetchMyCustomerProfile,
  fetchMyVendorProfile,
  updateMyCustomerProfile,
  updateMyVendorProfile,
  CustomerProfile,
  VendorProfile,
} from "@/lib/profiles-api";
import { toast } from "sonner";
import { cn } from "cn";

interface BackendProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "CUSTOMER" | "VENDOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN" | string;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{
    id: string;
    providerId: string;
    createdAt: string;
  }>;
  sessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: string;
    createdAt: string;
  }>;
  customerProfile?: CustomerProfile | null;
  vendorProfile?: VendorProfile | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = React.useState<BackendProfile | null>(null);
  const [customerData, setCustomerData] = React.useState<CustomerProfile | null>(null);
  const [vendorData, setVendorData] = React.useState<VendorProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  // Edit Modals
  const [isEditCustomerOpen, setIsEditCustomerOpen] = React.useState(false);
  const [customerForm, setCustomerForm] = React.useState({
    university: "",
    department: "",
    campus: "",
    phone: "",
  });

  const [isEditVendorOpen, setIsEditVendorOpen] = React.useState(false);
  const [vendorForm, setVendorForm] = React.useState({
    university: "",
    department: "",
    academicLevel: "UNDERGRADUATE",
    degree: "",
    passingYear: "",
    bio: "",
    skills: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "GET",
        headers: getApiHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const envelope = await response.json();
        if (envelope?.data) {
          const uProfile = envelope.data as BackendProfile;
          setProfile(uProfile);

          if (uProfile.customerProfile) {
            setCustomerData(uProfile.customerProfile);
            setCustomerForm({
              university: uProfile.customerProfile.university || "",
              department: uProfile.customerProfile.department || "",
              campus: uProfile.customerProfile.campus || "",
              phone: uProfile.customerProfile.phone || "",
            });
          }

          if (uProfile.vendorProfile) {
            setVendorData(uProfile.vendorProfile);
            setVendorForm({
              university: uProfile.vendorProfile.university || "",
              department: uProfile.vendorProfile.department || "",
              academicLevel: uProfile.vendorProfile.academicLevel || "UNDERGRADUATE",
              degree: uProfile.vendorProfile.degree || "",
              passingYear: uProfile.vendorProfile.passingYear ? String(uProfile.vendorProfile.passingYear) : "",
              bio: uProfile.vendorProfile.bio || "",
              skills: (uProfile.vendorProfile.skills || []).join(", "),
            });
          }
        }
      }

      // If user is CUSTOMER and customerProfile not populated yet, fetch directly
      const currentRole = (session?.user as any)?.role || "CUSTOMER";
      if (currentRole === "CUSTOMER") {
        const c = await fetchMyCustomerProfile();
        if (c) {
          setCustomerData(c);
          setCustomerForm({
            university: c.university || "",
            department: c.department || "",
            campus: c.campus || "",
            phone: c.phone || "",
          });
        }
      } else if (currentRole === "VENDOR") {
        const v = await fetchMyVendorProfile();
        if (v) {
          setVendorData(v);
          setVendorForm({
            university: v.university || "",
            department: v.department || "",
            academicLevel: v.academicLevel || "UNDERGRADUATE",
            degree: v.degree || "",
            passingYear: v.passingYear ? String(v.passingYear) : "",
            bio: v.bio || "",
            skills: (v.skills || []).join(", "),
          });
        }
      }
    } catch {
      // Graceful fallback
    }
  }, [(session?.user as any)?.role]);

  React.useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session?.user, loadData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast.success("Profile re-synchronized with backend");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const copyUserId = () => {
    const idToCopy = profile?.id || session?.user?.id;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      toast.success("User ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSaveCustomerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEdit(true);
    try {
      const updated = await updateMyCustomerProfile({
        university: customerForm.university.trim() || undefined,
        department: customerForm.department.trim() || undefined,
        campus: customerForm.campus.trim() || undefined,
        phone: customerForm.phone.trim() || undefined,
      });
      setCustomerData(updated);
      setIsEditCustomerOpen(false);
      toast.success("Student academic information updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleSaveVendorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEdit(true);
    try {
      const skillsArray = vendorForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateMyVendorProfile({
        university: vendorForm.university.trim() || undefined,
        department: vendorForm.department.trim() || undefined,
        academicLevel: vendorForm.academicLevel || undefined,
        degree: vendorForm.degree.trim() || undefined,
        passingYear: vendorForm.passingYear ? parseInt(vendorForm.passingYear, 10) : undefined,
        bio: vendorForm.bio.trim() || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      });
      setVendorData(updated);
      setIsEditVendorOpen(false);
      toast.success("Academic helper profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update vendor profile");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[65vh] flex-col items-center justify-center px-4 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-mono text-muted-foreground">Verifying role profile with backend...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Authentication Required
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          You must be signed in to access your role-based profile dashboard.
        </p>
        <Link
          href="/login?redirect=/profile"
          className={cn(buttonVariants(), "gap-2 bg-indigo-600 hover:bg-indigo-700 text-white")}
        >
          <span>Sign In to Your Account</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const role: string = (profile?.role || (session.user as any)?.role || "CUSTOMER").toUpperCase();
  const userDisplayName = profile?.name || session.user.name || "KoreDao User";
  const userEmail = profile?.email || session.user.email;
  const isEmailVerified = profile?.emailVerified ?? false;
  const createdAtFormatted = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Recently";

  // Role visual attributes
  const isCustomer = role === "CUSTOMER";
  const isVendor = role === "VENDOR";
  const isModerator = role === "MODERATOR";
  const isAdmin = role === "ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const roleLabel =
    isSuperAdmin ? "Super Administrator (Root)" :
      isAdmin ? "Platform Administrator" :
        isModerator ? "Compliance & Safety Officer" :
          isVendor ? "Verified Academic Helper" :
            "Student / Learner";

  const roleGradient =
    isSuperAdmin ? "from-purple-600 via-indigo-600 to-slate-900" :
      isAdmin ? "from-rose-600 via-pink-600 to-indigo-900" :
        isModerator ? "from-amber-600 via-orange-600 to-slate-900" :
          isVendor ? "from-emerald-600 via-teal-600 to-indigo-950" :
            "from-indigo-600 via-purple-600 to-blue-900";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-8 space-y-8">
      {/* Top Banner Card */}
      <Card className="border border-border/60 bg-gradient-to-r from-card/90 via-card/60 to-indigo-950/20 backdrop-blur-md shadow-md overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className={cn(
              "flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-white font-extrabold text-2xl sm:text-3xl shadow-lg",
              roleGradient
            )}>
              {userDisplayName[0]?.toUpperCase() || "U"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {userDisplayName}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs uppercase font-mono tracking-wider font-semibold",
                    isSuperAdmin ? "border-purple-500/40 text-purple-400 bg-purple-500/10" :
                      isAdmin ? "border-rose-500/40 text-rose-500 bg-rose-500/10" :
                        isModerator ? "border-amber-500/40 text-amber-500 bg-amber-500/10" :
                          isVendor ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10" :
                            "border-indigo-500/40 text-indigo-500 bg-indigo-500/10"
                  )}
                >
                  {role}
                </Badge>
                {isVendor && vendorData?.verificationStatus && (
                  <Badge
                    variant={vendorData.verificationStatus === "APPROVED" ? "default" : "secondary"}
                    className={cn(
                      "text-[11px]",
                      vendorData.verificationStatus === "APPROVED" ? "bg-emerald-600 text-white" :
                        vendorData.verificationStatus === "PENDING" ? "bg-amber-600 text-white" :
                          "bg-rose-600 text-white"
                    )}
                  >
                    {vendorData.verificationStatus}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{userEmail}</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-medium text-foreground/80">{roleLabel}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Member since {createdAtFormatted}
                </span>
                <span className="flex items-center gap-1">
                  {isEmailVerified ? (
                    <span className="text-emerald-500 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Email Verified
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 font-medium">
                      <XCircle className="h-3.5 w-3.5" /> Unverified Email
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm")}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* ROLE-SPECIFIC VIEWS */}
      {/* ======================================================== */}

      {/* 1. STUDENT / CUSTOMER PROFILE */}
      {isCustomer && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Information Card */}
            <Card className="md:col-span-2 border-border/60 bg-card/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    Student Academic Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Campus credentials used for local assignment pairing and matching
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditCustomerOpen(true)}
                  className="gap-1.5 text-xs cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Edit Academic Info</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" /> University
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {customerData?.university || "Not provided yet"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Department / Major
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {customerData?.department || "Not provided yet"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Campus / Hall
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {customerData?.campus || "Main Campus"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Phone className="h-3.5 w-3.5 text-indigo-500" /> Contact Phone
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {customerData?.phone || "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Want to earn by writing assignments for other students?
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Apply as an Academic Helper with your student ID & handwriting sample.
                    </div>
                  </div>
                  <Link
                    href="/vendor/apply"
                    className={cn(buttonVariants({ size: "sm" }), "text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0")}
                  >
                    <span>Become a Helper</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Student Tools */}
            <Card className="border-border/60 bg-card/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Student Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <Link
                  href="/assignments/create"
                  className="p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Post New Assignment</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/gigs"
                  className="p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span>Browse Academic Services</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/handwriting-matcher"
                  className="p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <Award className="h-4 w-4 text-indigo-500" />
                    <span>Match Handwriting Style</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/orders"
                  className="p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <FileCheck className="h-4 w-4 text-indigo-500" />
                    <span>View Orders & Escrow</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. VENDOR / ACADEMIC HELPER PROFILE */}
      {isVendor && (
        <div className="space-y-6">
          {/* Helper Verification Status Alert */}
          {vendorData?.verificationStatus === "PENDING" && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  Application Under Review
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your academic ID card and handwriting sample have been received by the compliance team. Once verified, your gigs will be visible to students across campus.
                </p>
              </div>
            </div>
          )}

          {vendorData?.verificationStatus === "REJECTED" && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    Application Needs Re-submission
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {vendorData.rejectionReason || "Please verify that your university ID card and sample are clearly legible."}
                  </p>
                </div>
              </div>
              <Link
                href="/vendor/apply"
                className={cn(buttonVariants({ size: "sm" }), "bg-rose-600 hover:bg-rose-700 text-white text-xs shrink-0")}
              >
                Re-apply Now
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Credentials & Bio Card */}
            <Card className="md:col-span-2 border-border/60 bg-card/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                    Academic Helper Credentials
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Academic verification records & subject expertise
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditVendorOpen(true)}
                  className="gap-1.5 text-xs cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Edit Profile</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      University
                    </div>
                    <div className="text-sm font-bold text-foreground truncate">
                      {vendorData?.university || "Not set"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Department
                    </div>
                    <div className="text-sm font-bold text-foreground truncate">
                      {vendorData?.department || "Not set"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Academic Level
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {vendorData?.academicLevel || "Undergraduate"}
                    </div>
                  </div>
                </div>

                {vendorData?.bio && (
                  <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-1.5">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Academic Biography
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {vendorData.bio}
                    </p>
                  </div>
                )}

                {/* Skills tags */}
                {vendorData?.skills && vendorData.skills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Skills & Subjects
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vendorData.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-muted border border-border/40">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Helper Performance Stats */}
            <Card className="border-border/60 bg-card/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Helper Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
                  <span className="text-xs font-medium text-muted-foreground">Rating Score</span>
                  <div className="flex items-center gap-1 font-bold text-sm text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span>{(vendorData?.rating ?? 5.0).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({vendorData?.totalReviews ?? 0})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
                  <span className="text-xs font-medium text-muted-foreground">Completed Tasks</span>
                  <span className="text-sm font-bold text-foreground">
                    {vendorData?.completedOrders ?? 0} orders
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/vendor/wallet"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between gap-2 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}
                  >
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Earnings & Wallet</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/vendor/gigs/create"
                    className={cn(buttonVariants({ size: "sm" }), "w-full justify-between gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white")}
                  >
                    <span>+ Publish New Gig</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Handwriting Samples Portfolio */}
          {vendorData?.handwritingSamples && vendorData.handwritingSamples.length > 0 && (
            <Card className="border-border/60 bg-card/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Verified Handwriting Portfolio ({vendorData.handwritingSamples.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Writing samples showcased for handwriting consistency matching
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {vendorData.handwritingSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {sample.style}
                        </Badge>
                        <span className="text-xs font-semibold text-emerald-500">
                          Neatness: {sample.neatnessScore}/10
                        </span>
                      </div>
                      {sample.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sample.description}
                        </p>
                      )}
                      <div className="pt-1">
                        <a
                          href={sample.sampleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                        >
                          View Sample Scan <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 3. MODERATOR PROFILE */}
      {isModerator && (
        <div className="space-y-6">
          <Card className="border-amber-500/20 bg-card/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Moderation & Quality Assurance Clearance
              </CardTitle>
              <CardDescription className="text-xs">
                Level 3 Platform Officer clearance to inspect applications and enforce academic integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Verification Authority
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Inspect academic student IDs and approve/reject helper applications.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Content & Gig Review
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Audit gig listings and assignment briefs for quality & code of conduct compliance.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Dispute Arbitration
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Arbitrate draft checkpoint disagreements and student-helper escrow milestones.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/admin/verifications"
                  className={cn(buttonVariants(), "bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold")}
                >
                  <span>Review Pending Applications</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-xs")}
                >
                  <span>Open Moderation Dashboard</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. ADMIN & SUPER_ADMIN PROFILE */}
      {(isAdmin || isSuperAdmin) && (
        <div className="space-y-6">
          <Card className={cn(
            "border shadow-sm",
            isSuperAdmin ? "border-purple-500/30 bg-card/60" : "border-rose-500/30 bg-card/60"
          )}>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <ShieldCheck className={cn("h-5 w-5", isSuperAdmin ? "text-purple-400" : "text-rose-500")} />
                {isSuperAdmin ? "Super Administrator Root Clearance (Level 5)" : "Platform Administrator Clearance (Level 4)"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isSuperAdmin
                  ? "Unrestricted governance, database ledger audits, system role elevation, and zero-trust policy control"
                  : "Platform financial escrow oversight, helper verification approval, and operational dispute management"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Escrow Oversight
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Full monitoring of locked & released student funds.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Helper Approvals
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Direct approval or rejection of academic credentials.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Financial Ledger
                  </div>
                  <div className="text-xs text-muted-foreground">
                    10% platform commission accounting & bKash ledger audits.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    {isSuperAdmin ? "Root Authority" : "Operations Control"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isSuperAdmin ? "Direct database and role delegation access." : "Community & dispute arbitration."}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/verifications"
                  className={cn(
                    buttonVariants(),
                    isSuperAdmin ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white",
                    "gap-2 text-xs font-semibold"
                  )}
                >
                  <span>Helper Verification Queue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-xs")}
                >
                  <span>Command Center Telemetry</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* ACCOUNT IDENTIFIERS & ACTIVE SESSIONS (ALL ROLES) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Identifier Card */}
        <Card className="border border-border/60 bg-card/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-500" />
              Account Identifier
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">User CUID:</span>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/40 font-mono text-[11px]">
                <span className="truncate max-w-[190px]">{profile?.id || session.user.id}</span>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="text-muted-foreground hover:text-foreground cursor-pointer ml-1"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block mb-1">Backend Pairing:</span>
              <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NestJS Microservice Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="md:col-span-2 border border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-2">
                <Laptop className="h-4 w-4 text-indigo-500" />
                Active Sessions ({profile?.sessions?.length || 1})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Sessions persisted in PostgreSQL via the NestJS Better-Auth adapter
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {profile?.sessions && profile.sessions.length > 0 ? (
              profile.sessions.map((sess, idx) => (
                <div
                  key={sess.id || idx}
                  className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground font-mono">
                          {sess.userAgent || "Web Browser"}
                        </span>
                        {idx === 0 && (
                          <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Expires: {new Date(sess.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Laptop className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-mono text-foreground">Current Active Session</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                  Live
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* EDIT MODAL: STUDENT CUSTOMER PROFILE */}
      {/* ======================================================== */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Academic Information</DialogTitle>
            <DialogDescription>
              Keep your campus details up to date for relevant job matching.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCustomerProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="univ" className="text-xs font-semibold">University</Label>
              <Input
                id="univ"
                placeholder="e.g. University of Dhaka"
                value={customerForm.university}
                onChange={(e) => setCustomerForm({ ...customerForm, university: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept" className="text-xs font-semibold">Department / Major</Label>
              <Input
                id="dept"
                placeholder="e.g. Computer Science & Engineering"
                value={customerForm.department}
                onChange={(e) => setCustomerForm({ ...customerForm, department: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campus" className="text-xs font-semibold">Campus / Hall</Label>
              <Input
                id="campus"
                placeholder="e.g. Curzon Hall / Shahidullah Hall"
                value={customerForm.campus}
                onChange={(e) => setCustomerForm({ ...customerForm, campus: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="e.g. +880 17XXXXXXXX"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditCustomerOpen(false)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Academic Info
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* EDIT MODAL: ACADEMIC HELPER PROFILE */}
      {/* ======================================================== */}
      <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Academic Helper Credentials</DialogTitle>
            <DialogDescription>
              Update your qualifications, skills, and academic biography.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveVendorProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-univ" className="text-xs font-semibold">University</Label>
                <Input
                  id="v-univ"
                  placeholder="e.g. BUET / DU"
                  value={vendorForm.university}
                  onChange={(e) => setVendorForm({ ...vendorForm, university: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-dept" className="text-xs font-semibold">Department</Label>
                <Input
                  id="v-dept"
                  placeholder="e.g. Electrical Engineering"
                  value={vendorForm.department}
                  onChange={(e) => setVendorForm({ ...vendorForm, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-degree" className="text-xs font-semibold">Degree Program</Label>
                <Input
                  id="v-degree"
                  placeholder="e.g. B.Sc in Engineering"
                  value={vendorForm.degree}
                  onChange={(e) => setVendorForm({ ...vendorForm, degree: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-year" className="text-xs font-semibold">Passing Year</Label>
                <Input
                  id="v-year"
                  type="number"
                  placeholder="e.g. 2026"
                  value={vendorForm.passingYear}
                  onChange={(e) => setVendorForm({ ...vendorForm, passingYear: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-skills" className="text-xs font-semibold">Skills / Subjects (comma separated)</Label>
              <Input
                id="v-skills"
                placeholder="e.g. Calculus, Physics Lab, Circuit Design, Organic Chemistry"
                value={vendorForm.skills}
                onChange={(e) => setVendorForm({ ...vendorForm, skills: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-bio" className="text-xs font-semibold">Bio / Qualifications</Label>
              <textarea
                id="v-bio"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describe your academic strengths, neat handwriting experience, and turnaround times..."
                value={vendorForm.bio}
                onChange={(e) => setVendorForm({ ...vendorForm, bio: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditVendorOpen(false)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
