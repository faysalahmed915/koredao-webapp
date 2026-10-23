"use client";

import * as React from "react";
import { Gauge, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchSlaTracker, SlaTrackerResponse } from "@/lib/notifications-api";

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "Breached";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function SlaTrackerPage() {
  const [data, setData] = React.useState<SlaTrackerResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchSlaTracker();
      setData(d);
    } catch (err: any) {
      toast.error(err.message || "Failed to load SLA tracker");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const d = await fetchSlaTracker();
      setData(d);
      toast.success("SLA tracker refreshed");
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const breached = data.items.filter((i) => i.breached).length;
  const atRisk = data.items.filter((i) => !i.breached && i.secondsRemaining <= 3600).length;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
            <Gauge className="h-3.5 w-3.5" />
            Moderator SLA Tracker
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dispute SLA Tracker</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Pending moderation requests and time remaining before the {data.slaHours}-hour
            SLA deadline. Based on the platform `dispute_sla_hours` setting.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-1"
        >
          <Clock className={refreshing ? "h-3 w-3 animate-spin mr-1.5" : "h-3 w-3 mr-1.5"} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SLA window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.slaHours}h</div>
            <p className="text-xs text-muted-foreground">dispute SLA hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{breached}</div>
            <p className="text-xs text-muted-foreground">overdue requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At risk (&lt;1h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {atRisk}
            </div>
            <p className="text-xs text-muted-foreground">under 1 hour left</p>
          </CardContent>
        </Card>
      </div>

      {data.items.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No pending disputes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no moderation requests awaiting resolution.
          </p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50">
                    <th className="p-3 text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-1/3">
                      Request
                    </th>
                    <th className="p-3 text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-1/6">
                      Order
                    </th>
                    <th className="p-3 text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Requested by
                    </th>
                    <th className="p-3 text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Assigned moderator
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">
                      Remaining
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item.moderationRequestId}
                      className={`border-b border-border/50 transition-bg ${
                        item.breached ? "bg-destructive/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="p-3">
                        <div className="text-sm font-medium text-foreground truncate">
                          MR{item.moderationRequestId.slice(-6)}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.priority} priority
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground font-mono">
                        {item.orderId.slice(-6)}
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-foreground">
                          {item.requestedBy.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.requestedBy.email}
                        </div>
                      </td>
                      <td className="p-3">
                        {item.assignedModeratorId ? (
                          <div className="text-sm text-foreground">
                            Moderator {item.assignedModeratorId.slice(-4)}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            item.breached
                              ? "text-destructive"
                              : item.secondsRemaining <= 3600
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {formatRemaining(item.secondsRemaining)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={item.breached ? "destructive" : "secondary"}
                        >
                          {item.breached ? "Breached" : "Running"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {data.items.length} pending request(s) • {breached} breached
            </span>
            <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
