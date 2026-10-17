"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { canAccessAdminArea } from "@/lib/access-control";
import { buildLoginHref } from "@/lib/auth-redirect";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Guard for the shared `/admin` operations area.
 *
 * Uses `canAccessAdminArea` so moderators — who own the moderation queue and the
 * helper-verification desk, and whose dashboard sidebar links straight to these
 * routes — are not bounced to the public home page. Destructive admin-only
 * actions remain protected by `@MinRole` on the API.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Derive authorization during render instead of storing it in state + an effect
  // (avoids set-state-in-effect and is a pure function of the session).
  const currentUser = session?.user;
  const isAuthorized =
    !isPending && currentUser != null && canAccessAdminArea(currentUser);

  // Redirect unauthenticated / unauthorized users as a side effect.
  React.useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      toast.error("Please log in with staff credentials");
      // buildLoginHref captures the exact admin sub-path the visitor tried to
      // reach (e.g. /admin/verifications), so re-login resumes there.
      router.replace(buildLoginHref());
      return;
    }

    if (!canAccessAdminArea(session.user)) {
      toast.error("Access restricted: staff role required");
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending || !isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-mono text-muted-foreground">
          Verifying staff permissions...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
