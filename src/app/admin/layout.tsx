"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { canAccessAdmin } from "@/lib/access-control";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      toast.error("Please log in with administrator credentials");
      router.replace("/login?redirect=/admin");
      return;
    }

    if (!canAccessAdmin(session.user)) {
      toast.error("Access restricted: Administrator role required");
      router.replace("/");
      return;
    }

    setIsAuthorized(true);
  }, [session, isPending, router]);

  if (isPending || !isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-mono text-muted-foreground">
          Verifying administrator permissions...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
