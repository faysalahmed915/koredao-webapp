import {
  UserRole,
  ROLE_HIERARCHY,
  MEMBERSHIP_EXEMPT_ROLES,
  normalizeRole,
} from "@/types/role";

/**
 * Access control metadata contract for navigation items and UI elements.
 */
export interface AccessControlMeta {
  /**
   * Specific roles permitted to view/access this item.
   * If omitted or empty, any role (or guest, if requireAuth is false) can access.
   */
  roles?: UserRole[];

  /**
   * Set to true if the item requires the user to be authenticated.
   */
  requireAuth?: boolean;

  /**
   * Set to true if the item should only be visible to unauthenticated visitors (e.g., login, register).
   */
  guestOnly?: boolean;
}

/**
 * Extracts and normalizes the UserRole enum value from a user object or string.
 */
export function getUserRole(user: unknown): UserRole | null {
  if (!user) return null;
  if (typeof user === "string") {
    return normalizeRole(user);
  }
  if (typeof user === "object" && "role" in user) {
    return normalizeRole((user as { role?: unknown }).role);
  }
  return null;
}

/**
 * Determines whether a user possesses one of the allowed roles.
 */
export function hasRole(user: unknown, allowedRoles: UserRole[]): boolean {
  const role = getUserRole(user);
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Checks whether a user's role meets or exceeds the required hierarchy level.
 */
export function hasMinimumRole(user: unknown, minRole: UserRole): boolean {
  const role = getUserRole(user);
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Checks if the user is a Super Administrator.
 */
export function isSuperAdmin(user: unknown): boolean {
  return getUserRole(user) === UserRole.SUPER_ADMIN;
}

/**
 * Checks if the user has administrative privileges (ADMIN or SUPER_ADMIN).
 * Moderators are deliberately excluded — use {@link canAccessAdminArea} for the
 * shared operations area.
 */
export function isAdmin(user: unknown): boolean {
  const role = getUserRole(user);
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * Convenience helper for full admin-only surfaces (destructive platform
 * operations). Only ADMIN and SUPER_ADMIN return true.
 */
export function canAccessAdmin(user: unknown): boolean {
  return isAdmin(user);
}

/**
 * Checks if the user is a Moderator or higher.
 */
export function isModerator(user: unknown): boolean {
  const role = getUserRole(user);
  return role === UserRole.MODERATOR || isAdmin(user);
}

/**
 * Access to the shared `/admin` operations area.
 *
 * Moderators own the moderation queue and the helper-verification desk, so they
 * must be able to reach the routes the dashboard sidebar advertises to them.
 * Individual admin-only actions are still enforced by the API (`@MinRole`).
 */
export function canAccessAdminArea(user: unknown): boolean {
  return isModerator(user);
}

/**
 * Checks if the user is a Vendor or higher.
 */
export function isVendor(user: unknown): boolean {
  const role = getUserRole(user);
  return role === UserRole.VENDOR || isAdmin(user);
}

/**
 * Checks whether the user's *stored role* is literally MEMBER.
 *
 * This is a display/labelling helper only. Holding the stored role is **not**
 * proof of payment: the value is admin-assignable and survives expiry, so the
 * backend deliberately does not treat it as a membership. Authorization always
 * uses {@link hasMarketplaceAccess} with the membership report from the API.
 */
export function isMemberRole(user: unknown): boolean {
  return getUserRole(user) === UserRole.MEMBER;
}

/**
 * Platform staff are never blocked by billing.
 */
export function isMembershipExempt(user: unknown): boolean {
  const role = getUserRole(user);
  return role !== null && MEMBERSHIP_EXEMPT_ROLES.includes(role);
}

/**
 * Whether the user may perform the paid marketplace actions (post a job,
 * take a job).
 *
 * Mirrors `RolesGuard` on the server exactly: an active subscription, or a
 * platform-staff role. The stored `MEMBER` role alone is intentionally not
 * enough, so the UI can never advertise access the API would refuse.
 *
 * @param user       the session user (or a role string)
 * @param isMember   the authoritative membership flag from `/subscriptions/me`
 */
export function hasMarketplaceAccess(
  user: unknown,
  isMember: boolean
): boolean {
  return Boolean(user) && (isMember || isMembershipExempt(user));
}

/**
 * Checks if a navigation item should be visible to the user.
 *
 * Rules:
 * - If item.guestOnly is true: Only shown if user is NOT authenticated.
 * - If item.requireAuth is true: Only shown if user IS authenticated.
 * - If item.roles is provided: User must be authenticated AND have one of the listed roles.
 * - Otherwise: Visible to all.
 */
export function isNavItemVisible(
  item: AccessControlMeta,
  user: unknown | null | undefined
): boolean {
  const isAuthenticated = Boolean(user);

  // If item is restricted to unauthenticated guests only
  if (item.guestOnly && isAuthenticated) {
    return false;
  }

  // If item requires authentication and the user is logged out
  if (item.requireAuth && !isAuthenticated) {
    return false;
  }

  // If item specifies allowed roles
  if (item.roles && item.roles.length > 0) {
    if (!isAuthenticated) {
      return false;
    }
    const role = getUserRole(user);
    if (!role || !item.roles.includes(role)) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates whether a user can access a given route pathname.
 */
export function canAccessRoute(
  pathname: string,
  user: unknown | null | undefined
): boolean {
  const isAuthenticated = Boolean(user);
  const role = getUserRole(user);

  // /admin routes strictly require ADMIN or SUPER_ADMIN
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }

  // Authenticated protected areas
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/messages" ||
    pathname.startsWith("/messages/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  ) {
    return isAuthenticated;
  }

  // Vendor restricted sections
  if (pathname.startsWith("/vendor/wallet") || pathname.startsWith("/vendor/gigs/create")) {
    return role === UserRole.VENDOR || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }

  // Public routes
  return true;
}
