"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { buildLoginHref } from "@/lib/auth-redirect";
import {
  Bell,
  Loader2,
  Save,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserRole } from "@/lib/access-control";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationCategoryFlags,
  type NotificationCategoryKey,
} from "@/lib/notifications-api";
import { ROLE_LABELS } from "@/types";

/**
 * Account settings.
 *
 * The notification switches are persisted on the server
 * (`PUT /notifications/preferences`) and are enforced there: a category that
 * is switched off is never written to the feed, so these toggles are a real
 * setting rather than a local-only preference.
 */
const CATEGORY_COPY: Array<{
  key: NotificationCategoryKey;
  label: string;
  hint: string;
}> = [
  {
    key: "ORDERS",
    label: "Order & escrow alerts",
    hint: "New orders, escrow funding, releases, refunds and payouts.",
  },
  {
    key: "PROPOSALS",
    label: "New proposals",
    hint: "Bids received on the job briefs you posted.",
  },
  {
    key: "ACCOUNT",
    label: "Verification & membership",
    hint: "Helper application decisions and membership activation.",
  },
  {
    key: "ANNOUNCEMENTS",
    label: "Platform announcements",
    hint: "Product updates and service announcements from KoreDao.",
  },
];

const ALL_CATEGORIES_ENABLED: NotificationCategoryFlags = {
  ORDERS: true,
  PROPOSALS: true,
  ACCOUNT: true,
  ANNOUNCEMENTS: true,
};

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [categories, setCategories] =
    React.useState<NotificationCategoryFlags>(ALL_CATEGORIES_ENABLED);
  const [loadingPrefs, setLoadingPrefs] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [prefsError, setPrefsError] = React.useState<string | null>(null);

  const user = session?.user;
  const role = getUserRole(user);
  // Derived, not mirrored into state — the session is the source of truth.
  const displayName = typeof user?.name === "string" ? user.name : "";

  React.useEffect(() => {
    if (!isPending && !user) router.replace(buildLoginHref());
  }, [user, isPending, router]);

  const loadPreferences = React.useCallback(async () => {
    setLoadingPrefs(true);
    setPrefsError(null);
    try {
      const stored = await fetchNotificationPreferences();
      setCategories({ ...ALL_CATEGORIES_ENABLED, ...stored.categories });
    } catch (err) {
      setPrefsError(
        (err as Error).message || "Failed to load notification preferences",
      );
    } finally {
      setLoadingPrefs(false);
    }
  }, []);

  React.useEffect(() => {
    if (!user) return;
    queueMicrotask(() => loadPreferences());
  }, [user, loadPreferences]);

  const handleToggle = (key: NotificationCategoryKey, enabled: boolean) => {
    setCategories((prev) => ({ ...prev, [key]: enabled }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stored = await updateNotificationPreferences(categories);
      setCategories({ ...ALL_CATEGORIES_ENABLED, ...stored.categories });
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(
        (err as Error).message || "Failed to save notification preferences",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="font-mono text-sm text-muted-foreground">
          Preparing your workspace&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and the notifications KoreDao sends you.
            </p>
          </div>
          <Link href="/profile" className={buttonVariants({ variant: "outline" })}>
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            View profile
          </Link>
        </div>
      </header>

      <form onSubmit={handleSave}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your public identity, campus and verification details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                  {displayName?.[0] || user.email?.[0] || "U"}
                </div>
                <div>
                  <p className="font-semibold">{displayName || "Unnamed user"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {role && <Badge variant="outline">{ROLE_LABELS[role]}</Badge>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={displayName}
                  placeholder="Jane Doe"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Names are verified during the helper application flow.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Change your email in the verification flow.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose which alerts land in your bell feed. Switched-off
                categories are never recorded.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prefsError && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{prefsError}</span>
                  <button
                    type="button"
                    onClick={() => loadPreferences()}
                    className="ml-auto inline-flex items-center gap-1 font-semibold hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Retry
                  </button>
                </div>
              )}

              {loadingPrefs ? (
                <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Loading your preferences&hellip;
                </div>
              ) : (
                CATEGORY_COPY.map((category) => (
                  <label
                    key={category.key}
                    htmlFor={`pref-${category.key}`}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:bg-accent/40"
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {category.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {category.hint}
                      </span>
                    </span>
                    <input
                      id={`pref-${category.key}`}
                      type="checkbox"
                      checked={categories[category.key]}
                      onChange={(e) =>
                        handleToggle(category.key, e.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
                    />
                  </label>
                ))
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" size="sm" className="gap-1.5" disabled={saving || loadingPrefs}>
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {saving ? "Saving…" : "Save preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Security
          </CardTitle>
          <CardDescription>
            How KoreDao protects your account and your money.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Every payment is held in escrow until you approve the delivery, and
            helper payouts are released 72 hours after a submission.
          </p>
          <p>
            Sessions are secured with signed cookies. Sign out from the account
            menu in the header to end a session on this device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
