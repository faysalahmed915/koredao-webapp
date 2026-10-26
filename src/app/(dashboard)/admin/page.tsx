import { redirect } from "next/navigation";

/**
 * Admin command-centre landing.
 *
 * Staff (SUPER_ADMIN / ADMIN / MODERATOR) land here after sign-in. The
 * AdminLayout guard already ensures only staff can reach /admin, and
 * roleBasedLandingPath() returns /admin for staff roles — so this page is the
 * correct post-auth destination instead of bouncing straight into a single
 * admin subsection.
 */
export default function AdminPage() {
  redirect("/dashboard");
}
