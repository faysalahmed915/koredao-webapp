"use client";

import * as React from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  fetchPreferences,
  updatePreferences,
  PreferenceItem,
} from "@/lib/notifications-api";

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex flex-col">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
        aria-label={label}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow ring-0 transition-all ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const PREFERENCES: {
  key: keyof PreferenceItem;
  label: string;
  description: string;
}[] = [
  {
    key: "emailEnabled",
    label: "Email notifications",
    description: "Receive notifications by email when a transport is configured.",
  },
  {
    key: "inAppEnabled",
    label: "In-app notifications",
    description: "Show notifications in the notification centre.",
  },
  {
    key: "vendorAppOutcome",
    label: "Helper application outcomes",
    description: "Notify when a helper verification is approved or rejected.",
  },
  {
    key: "disputeSla",
    label: "Dispute SLA countdown",
    description: "Warn when a dispute you raised is approaching its SLA deadline.",
  },
  {
    key: "releaseWarning",
    label: "Escrow release warning",
    description: "Remind you before funds auto-release after delivery.",
  },
  {
    key: "safetyAlert",
    label: "Chat safety alerts",
    description: "Alert moderators and you to flagged chat safety warnings.",
  },
];

export default function NotificationsPreferencesPage() {
  const [prefs, setPrefs] = React.useState<PreferenceItem | null>(null);
  const [draft, setDraft] = React.useState<PreferenceItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchPreferences();
      setPrefs(p);
      setDraft({ ...p });
    } catch (err: any) {
      toast.error(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  const handleChange = (key: keyof PreferenceItem, value: boolean) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await updatePreferences({
        emailEnabled: draft.emailEnabled,
        inAppEnabled: draft.inAppEnabled,
        vendorAppOutcome: draft.vendorAppOutcome,
        disputeSla: draft.disputeSla,
        releaseWarning: draft.releaseWarning,
        safetyAlert: draft.safetyAlert,
      });
      setPrefs(updated);
      setDraft({ ...updated });
      toast.success("Notification preferences saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs || !draft) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const hasChanges = PREFERENCES.some((p) => draft[p.key] !== prefs[p.key]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
          <Bell className="h-3.5 w-3.5" />
          Notification Preferences
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Delivery Preferences</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Choose which notifications you receive and how they are delivered.
          Changes take effect immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Notification channels</CardTitle>
          <CardDescription>
            Toggle each category on or off. Email is best-effort and only sent
            when a transport is configured on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {PREFERENCES.map((pref) => (
            <PreferenceToggle
              key={pref.key}
              label={pref.label}
              description={pref.description}
              checked={draft[pref.key] as boolean}
              onChange={(value) => handleChange(pref.key, value)}
            />
          ))}
        </CardContent>
        <CardFooter className="border-t border-border/40 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {hasChanges ? "Unsaved changes" : "All preferences up to date"}
          </span>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm gap-1"
          >
            <Save className={saving ? "h-3 w-3 animate-spin mr-1.5" : "h-3 w-3 mr-1.5"} />
            Save preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
