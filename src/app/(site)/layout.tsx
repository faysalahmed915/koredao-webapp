import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Public site shell — the "basic navigation" layout.
 *
 * Used by every marketing, browsing and discovery route (home, gigs, job board,
 * assistance, resources, contact). The header here only exposes the public menu
 * (Hire Assistance / Find Work / Resources), which is visible to anonymous
 * visitors exactly as designed. Authenticated workspaces use the dashboard shell
 * instead.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
