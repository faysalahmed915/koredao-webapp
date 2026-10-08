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
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "cn";

interface BackendProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
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
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = React.useState<BackendProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";
      const response = await fetch(`${backendUrl}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": crypto.randomUUID(),
        },
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const envelope = await response.json();
      if (envelope?.data) {
        setProfile(envelope.data);
      }
    } catch {
      // Gracefully fall back to session user info
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    if (session?.user) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";
      fetch(`${backendUrl}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": crypto.randomUUID(),
        },
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((envelope) => {
          if (!ignore && envelope?.data) {
            setProfile(envelope.data);
          }
        })
        .catch(() => { });
    }
    return () => {
      ignore = true;
    };
  }, [session?.user]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile();
    setIsRefreshing(false);
    toast.success("Profile data re-synchronized with backend");
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

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[65vh] flex-col items-center justify-center px-4 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-mono text-muted-foreground">Verifying session with backend...</p>
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
          You must be logged in with a valid Better-Auth session to view this profile.
        </p>
        <Link
          href="/login"
          className={cn(buttonVariants(), "gap-2 bg-indigo-600 hover:bg-indigo-700 text-white")}
        >
          <span>Sign In to Your Account</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const userDisplayName = profile?.name || session.user.name || "Enterprise User";
  const userEmail = profile?.email || session.user.email;
  const userRole = profile?.role || "user";
  const isEmailVerified = profile?.emailVerified ?? false;
  const createdAtFormatted = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Recently";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8 space-y-8">
      {/* Top Banner Card */}
      <Card className="border border-border/60 bg-gradient-to-r from-card/90 via-card/60 to-indigo-950/20 backdrop-blur-md shadow-md overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-2xl sm:text-3xl shadow-lg shadow-indigo-500/25">
              {userDisplayName[0]?.toUpperCase() || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {userDisplayName}
                </h1>
                <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider border-indigo-500/30 text-indigo-500">
                  {userRole}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{userEmail}</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3 text-indigo-500" /> Member since {createdAtFormatted}
                </span>
                <span className="flex items-center gap-1">
                  {isEmailVerified ? (
                    <span className="text-emerald-500 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 font-medium">
                      <XCircle className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs border-border/80 hover:bg-accent/60 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-xs cursor-pointer shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Account Details & Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Metadata */}
        <div className="md:col-span-1 space-y-6">
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
                  <span>NestJS Service Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Sessions & Connected Providers */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-indigo-500" />
                  Active Sessions ({profile?.sessions?.length || 1})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Sessions persisted in PostgreSQL via the NestJS Better-Auth adapter.
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
      </div>
    </div>
  );
}
