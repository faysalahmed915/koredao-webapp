import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "cn";

/**
 * The KoreDao wordmark used by every shell (public header, dashboard sidebar,
 * auth pages, 404). Extracted so brand tweaks happen in exactly one place.
 */
export function BrandMark({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-md outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      aria-label="KoreDao home"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
        <GraduationCap className="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-mono text-base font-bold tracking-tight">
            Kore<span className="text-indigo-600 dark:text-indigo-400">Dao</span>
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase leading-none tracking-wider text-indigo-500">
            Academic Escrow
          </span>
        </span>
      )}
    </Link>
  );
}
