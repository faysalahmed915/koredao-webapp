"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  AlertTriangle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { canAccessAdmin } from "@/lib/access-control";
import { toast } from "sonner";
import { buildLoginHref } from "@/lib/auth-redirect";
import {
  fetchSettings,
  updateSetting,
  PlatformSettingValue,
} from "@/lib/settings-api";

type EditableField = keyof Pick<PlatformSettingValue, "value" | "description">;

interface SettingRow extends PlatformSettingValue {
  editing: boolean;
  pendingValue: string;
  pendingDescription: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      toast.error("Please log in with staff credentials");
      router.replace(buildLoginHref());
      return;
    }
    if (!canAccessAdmin(session.user)) {
      toast.error("Access restricted: Administrator role required");
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState<SettingRow[]>([]);
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    queueMicrotask(() => {
      setLoading(true);
      fetchSettings()
        .then((data) => {
          setSettings(
            data.map((s) => ({
              ...s,
              editing: false,
              pendingValue: s.value,
              pendingDescription: s.description ?? "",
            })),
          );
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load platform settings");
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const startEdit = (key: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key
          ? {
              ...s,
              editing: true,
              pendingValue: s.value,
              pendingDescription: s.description ?? "",
            }
          : s
      ),
    );
  };

  const cancelEdit = (key: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, editing: false } : s
      ),
    );
  };

  const handleChange = (
    key: string,
    field: EditableField,
    value: string,
  ) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, [field]: value } : s
      ),
    );
  };

  const handleSave = async (key: string) => {
    const row = settings.find((s) => s.key === key);
    if (!row) return;

    setSaving(key);
    try {
      await updateSetting(key, {
        key,
        value: row.pendingValue,
        description: row.pendingDescription || undefined,
      });
      setSettings((prev) =>
        prev.map((s) =>
          s.key === key
            ? {
                ...s,
                value: row.pendingValue,
                description: row.pendingDescription || undefined,
                editing: false,
              }
            : s
        ),
      );
      toast.success(`Platform setting '${key}' updated`);
    } catch (err: any) {
      toast.error(err.message || `Failed to update setting '${key}'`);
    } finally {
      setSaving(null);
    }
  };

  const fieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      platform_fee_percentage: "Platform Fee (%)",
      escrow_auto_release_hours: "Auto-Release Hours",
      max_revisions_default: "Default Max Revisions",
      dispute_sla_hours: "Dispute SLA (hours)",
    };
    return labels[key] || key;
  };

  const fieldHint = (key: string) => {
    const hints: Record<string, string> = {
      platform_fee_percentage:
        "Percentage of the order total retained by KoreDao escrow (remaining goes to the helper).",
      escrow_auto_release_hours:
        "Hours after delivery before escrow auto-releases if the customer takes no action.",
      max_revisions_default: "Default number of free revisions a customer may request.",
      dispute_sla_hours: "Target hours for a moderator to respond to a raised dispute.",
    };
    return hints[key] || "";
  };

  if (isPending || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin
            </Button>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3">
            <DollarSign className="h-3.5 w-3.5" />
            Platform Configuration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Adjust platform-wide parameters without redeploying. Changes are
            audited and take effect immediately for new orders.
          </p>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No settings configured</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no platform settings to manage right now.
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Configuration</CardTitle>
            <CardDescription className="text-xs">
              Each row can be edited inline. Only administrators may save changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4 font-semibold">Setting</th>
                    <th className="pb-3 pr-4 font-semibold">Value</th>
                    <th className="pb-3 pr-4 font-semibold">Description</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-border/50 hover:bg-muted/30 transition-bg"
                    >
                      <td className="p-3 pr-4">
                        <div className="text-xs font-medium text-foreground">{fieldLabel(row.key)}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-xs">{row.key}</div>
                      </td>
                      <td className="p-3 pr-4">
                        {row.editing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              className="h-8 w-32 text-xs"
                              value={row.pendingValue}
                              onChange={(e) =>
                                handleChange(row.key, "value", e.target.value)
                              }
                              disabled={saving === row.key}
                            />
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {row.editing ? "unsaved" : "saved"}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-foreground">
                            {row.value}
                          </span>
                        )}
                      </td>
                      <td className="p-3 pr-4">
                        {row.editing ? (
                          <Input
                            className="h-8 w-48 text-xs"
                            value={row.pendingDescription}
                            onChange={(e) =>
                              handleChange(row.key, "description", e.target.value)
                            }
                            disabled={saving === row.key}
                            placeholder="Optional description"
                          />
                        ) : (
                          <p className="text-[11px] text-muted-foreground leading-none">
                            {row.description ?? "—"}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {row.editing ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelEdit(row.key)}
                              disabled={saving === row.key}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(row.key)}
                              disabled={saving === row.key}
                              className="bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                            >
                              {saving === row.key ? (
                                <Save className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="mr-1 h-3 w-3" />
                              )}
                              Save
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => startEdit(row.key)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40">
            <div className="grid gap-2 sm:grid-cols-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 shrink-0" />
                <span>
                  Platform fee is applied as a percentage of each order total
                  before helper payout.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 shrink-0" />
                <span>
                  Auto-release hours determine when held escrow is released if the
                  customer neither accepts nor requests a revision.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 shrink-0" />
                <span>
                  Dispute SLA is a staffing target; it does not change refund
                  eligibility.
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
