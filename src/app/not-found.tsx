import Link from "next/link";
import { ShieldAlert, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-6">
        <ShieldAlert className="h-8 w-8 stroke-[2]" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-indigo-500 font-semibold mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
        Resource Not Found
      </h1>
      <p className="text-muted-foreground max-w-md text-sm mb-8">
        The requested endpoint or path is either unallocated or has been moved under zero-trust routing policy.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
