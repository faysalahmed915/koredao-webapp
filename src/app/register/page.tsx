"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  CheckCircle2,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth.schema";
import { useLanguage } from "@/components/providers/language-provider";
import { signUp, useSession } from "@/lib/auth-client";
import { cn } from "cn";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, isPending: isSessionPending } = useSession();
  const [showPassword, setShowPassword] = React.useState(false);
  const [accountType, setAccountType] = React.useState<"STUDENT" | "HELPER">("STUDENT");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";

  // Password Strength Calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(passwordValue);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: "Too Weak", color: "bg-red-500", text: "text-red-500" };
    if (score <= 3) return { label: "Moderate", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 4) return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
    return { label: "Enterprise Hardened", color: "bg-indigo-500", text: "text-indigo-500" };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result?.error) {
        toast.error("Registration failed", {
          description: result.error.message || "Failed to create account. Email may already be registered.",
        });
        return;
      }

      toast.success("Account created successfully!", {
        description: `Welcome to KoreDao, ${result.data?.user?.name || data.name}!`,
      });

      if (accountType === "HELPER") {
        router.push("/vendor/apply");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to authentication server.";
      toast.error("Registration Error", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-muted-foreground">Already signed in. Redirecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-6 w-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground font-mono">
              Kore<span className="text-indigo-600 dark:text-indigo-400">Dao</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Join KoreDao Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bangladesh&apos;s premier platform for academic assistance, lab reports & handwritten hardcopy notes.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl border border-border/60 bg-muted/30">
          <button
            type="button"
            onClick={() => setAccountType("STUDENT")}
            className={cn(
              "flex flex-col items-center text-center p-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              accountType === "STUDENT"
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4 mb-1 text-indigo-500" />
            <span>I am a Student</span>
            <span className="text-[10px] text-muted-foreground font-normal">Need help with assignments</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("HELPER")}
            className={cn(
              "flex flex-col items-center text-center p-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              accountType === "HELPER"
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="h-4 w-4 mb-1 text-emerald-500" />
            <span>I am an Academic Helper</span>
            <span className="text-[10px] text-muted-foreground font-normal">Earn money solving assignments</span>
          </button>
        </div>

        {/* Registration Card */}
        <Card className="border border-border/60 bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-base font-semibold text-foreground">
              {accountType === "STUDENT" ? "Create Student Account" : "Register as Academic Helper"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {accountType === "STUDENT"
                ? "Post custom assignments, order verified gigs, and enjoy 100% escrow protection."
                : "Earn up to ৳25,000+/mo helping campus peers with assignments, lab reports, and hardcopy handwriting."}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  {t.auth.nameLabel} *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. Tanvir Hasan"
                    className={`pl-9 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  University or Personal Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@university.edu.bd"
                    className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  {t.auth.passwordLabel} *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}

                {/* Password Strength Meter */}
                {passwordValue.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Security Rating:</span>
                      <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${strengthScore >= 1 ? strengthInfo.color : "bg-muted"}`} />
                      <div className={`h-full ${strengthScore >= 3 ? strengthInfo.color : "bg-muted"}`} />
                      <div className={`h-full ${strengthScore >= 4 ? strengthInfo.color : "bg-muted"}`} />
                      <div className={`h-full ${strengthScore >= 5 ? strengthInfo.color : "bg-muted"}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  {t.auth.confirmPasswordLabel} *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className={`pl-9 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...register("acceptTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="acceptTerms" className="text-xs text-muted-foreground cursor-pointer leading-tight">
                  I agree to KoreDao&apos;s Academic Integrity Code, Escrow Terms, and Privacy Policy.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Workspace...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{accountType === "HELPER" ? "Register & Apply as Helper" : "Create Student Account"}</span>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
            <span>{t.auth.alreadyHaveAccount}</span>
            <Link href="/login" className="ml-1 font-semibold text-indigo-500 hover:underline">
              {t.nav.login}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
