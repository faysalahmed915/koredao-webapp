"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loginSchema, LoginInput } from "@/lib/schemas/auth.schema";
import { useLanguage } from "@/components/providers/language-provider";
import { signIn, useSession, setStoredAuthToken } from "@/lib/auth-client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { t } = useLanguage();
  const { data: session, isPending: isSessionPending } = useSession();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (session?.user) {
      router.replace(redirectUrl);
    }
  }, [session, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result?.error) {
        toast.error("Authentication failed", {
          description: result.error.message || "Invalid email or password. Please verify your credentials.",
        });
        return;
      }

      if (result?.data?.token) {
        setStoredAuthToken(result.data.token);
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${result.data?.user?.name || data.email}`,
      });
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to backend authentication service.";
      toast.error("Authentication Error", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "Password123!", { shouldValidate: true });
    toast.info("Demo credentials loaded", {
      description: `Loaded account: ${email}`,
    });
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
      <div className="w-full max-w-md space-y-6">
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
            Sign In to Your Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Academic freelancing, assignment bidding & secure escrow protection
          </p>
        </div>

        {/* Quick Demo Login Chips (High Presentation Utility) */}
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-card to-background p-3.5 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5 text-indigo-500">
              <Sparkles className="h-3.5 w-3.5" /> Quick Presentation Demo Logins
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Password123!</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("saad.student@koredao.com")}
              className="px-2 py-1.5 rounded-lg border border-border/60 bg-background/80 hover:border-indigo-500/60 text-[11px] font-semibold text-foreground transition-all hover:shadow-sm text-left cursor-pointer"
            >
              <span className="block text-[10px] text-indigo-500">👤 Student</span>
              <span className="truncate block font-mono">Saad (DU)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("tanvir.buet@koredao.com")}
              className="px-2 py-1.5 rounded-lg border border-border/60 bg-background/80 hover:border-emerald-500/60 text-[11px] font-semibold text-foreground transition-all hover:shadow-sm text-left cursor-pointer"
            >
              <span className="block text-[10px] text-emerald-500">🎓 Helper</span>
              <span className="truncate block font-mono">Tanvir (BUET)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("admin@koredao.com")}
              className="px-2 py-1.5 rounded-lg border border-border/60 bg-background/80 hover:border-rose-500/60 text-[11px] font-semibold text-foreground transition-all hover:shadow-sm text-left cursor-pointer"
            >
              <span className="block text-[10px] text-rose-500">👑 Admin</span>
              <span className="truncate block font-mono">Command</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-border/60 bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-base font-semibold text-foreground">Sign In with Credentials</h2>
            <p className="text-xs text-muted-foreground">
              Secured with Better-Auth sessions and encrypted token cookies.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  {t.auth.emailLabel}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu.bd"
                    className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    {t.auth.passwordLabel}
                  </Label>
                  <span className="text-xs text-indigo-500 hover:underline cursor-pointer">
                    {t.auth.forgotPassword}
                  </span>
                </div>
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
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
                  {t.auth.rememberMe}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    <span>{t.auth.signInBtn}</span>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
            <span>{t.auth.dontHaveAccount}</span>
            <Link href="/register" className="ml-1 font-semibold text-indigo-500 hover:underline">
              {t.nav.register}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
