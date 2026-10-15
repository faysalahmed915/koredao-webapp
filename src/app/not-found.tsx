import Link from "next/link";
import { ShieldAlert, Home, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Global 404.
 *
 * The root layout no longer renders site chrome (each route group owns its own
 * shell), so the not-found page renders the public header and footer itself to
 * keep lost visitors inside the navigable site.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <ShieldAlert className="h-8 w-8 stroke-[2]" aria-hidden="true" />
          </div>
          <span className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Error 404
          </span>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Resource Not Found
          </h1>
          <p className="mb-8 max-w-md text-sm text-muted-foreground">
            The requested endpoint or path is either unallocated or has been moved
            under zero-trust routing policy.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/gigs"
              className={cn(
                buttonVariants(),
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Browse services</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
