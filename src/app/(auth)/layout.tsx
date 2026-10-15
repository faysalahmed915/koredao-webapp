import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Authentication shell — deliberately chrome-free.
 *
 * Login and registration focus the user on a single task, so the marketing
 * header, mega-menu and footer are removed and only a brand anchor remains.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <header className="flex h-16 items-center px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="KoreDao home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
          </span>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-mono text-base font-bold tracking-tight">
            Kore<span className="text-indigo-600 dark:text-indigo-400">Dao</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
        {children}
      </main>
    </div>
  );
}
