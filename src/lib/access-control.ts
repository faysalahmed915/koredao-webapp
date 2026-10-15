import {
  UserRole,
  ROLE_HIERARCHY,
  MEMBERSHIP_EXEMPT_ROLES,
  normalizeRole,
  type Role,
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
 */
export function isAdmin(user: unknown): boolean {
  const role = getUserRole(user);
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * Convenience helper for admin route and layout access.
 * Only ADMIN and SUPER_ADMIN roles return true.
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
 * Checks if the user is a Vendor or higher.
 */
export function isVendor(user: unknown): boolean {
  const role = getUserRole(user);
  return role === UserRole.VENDOR || isAdmin(user);
}

/**
 * Checks whether the user's *stored role* is literally MEMBER.
 *
 * Note: on the server membership is granted by an active subscription and does
 * NOT overwrite the base role, so a subscribed customer still reports
 * `CUSTOMER`. Prefer {@link hasMarketplaceAccess}, which accepts the membership
 * state as well.
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
 * @param user       the session user (or a role string)
 * @param isMember   the authoritative membership flag from `/subscriptions/me`
 */
export function hasMarketplaceAccess(
  user: unknown,
  isMember: boolean
): boolean {
  return Boolean(user) && (isMember || isMemberRole(user) || isMembershipExempt(user));
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
