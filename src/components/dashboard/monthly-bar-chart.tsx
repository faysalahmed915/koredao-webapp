"use client";

import * as React from "react";
import { cn } from "cn";

/**
 * Dependency-free monthly bar chart.
 *
 * The analytics endpoints return a zero-filled 12-month series, so the chart
 * can render the buckets as-is — no interpolation, no chart library. Each bar
 * is scaled against the largest value in the series, and the hover/focus
 * label exposes the exact figure.
 */

export interface MonthlyBarChartProps {
  /** Series buckets, oldest first. */
  data: Array<{ month: string; value: number; secondary?: number }>;
  /** Accessible description of what the bars represent. */
  label: string;
  /** Formats the value for the tooltip and the peak caption. */
  formatValue?: (value: number) => string;
  /** Colour classes for the primary bar. */
  barClassName?: string;
  /** Colour classes for the optional secondary (overlaid) bar. */
  secondaryBarClassName?: string;
  /** Caption describing the series, shown next to the peak value. */
  caption?: string;
}

/** `2026-10` → `Oct '26`. */
const monthLabel = (month: string): string => {
  const [year, monthIndex] = month.split("-");
  const parsed = Number(monthIndex);
  if (!year || Number.isNaN(parsed)) return month;

  const date = new Date(Date.UTC(Number(year), parsed - 1, 1));
  return `${date.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} '${year.slice(2)}`;
};

export function MonthlyBarChart({
  data,
  label,
  formatValue = (value) => value.toLocaleString(),
  barClassName = "bg-indigo-500/70",
  secondaryBarClassName = "bg-emerald-500/70",
  caption,
}: MonthlyBarChartProps) {
  const peak = React.useMemo(
    () => data.reduce((max, point) => Math.max(max, point.value), 0),
    [data],
  );
  const secondaryPeak = React.useMemo(
    () => data.reduce((max, point) => Math.max(max, point.secondary ?? 0), 0),
    [data],
  );

  const scale = Math.max(peak, secondaryPeak, 1);

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={label}
        className="flex h-48 items-end gap-1.5 sm:gap-2.5"
      >
        {data.map((point) => {
          const height = Math.round((point.value / scale) * 100);
          const secondaryHeight = Math.round(
            ((point.secondary ?? 0) / scale) * 100,
          );

          return (
            <div
              key={point.month}
              className="group relative flex h-full flex-1 items-end justify-center"
            >
              {/* Hover / focus detail */}
              <div
                className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max max-w-[11rem] rounded-lg border border-border/60 bg-popover px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-md group-hover:block group-focus-within:block"
                role="tooltip"
              >
                <p className="font-semibold">{monthLabel(point.month)}</p>
                <p className="text-muted-foreground">
                  {caption ? `${caption}: ` : ""}
                  {formatValue(point.value)}
                </p>
                {point.secondary !== undefined && (
                  <p className="text-muted-foreground">
                    Net: {formatValue(point.secondary)}
                  </p>
                )}
              </div>

              <div className="flex h-full w-full flex-col justify-end gap-0.5">
                {point.secondary !== undefined && secondaryHeight > 0 && (
                  <div
                    className={cn("w-full rounded-t-sm", secondaryBarClassName)}
                    style={{ height: `${secondaryHeight}%` }}
                  />
                )}
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all group-hover:opacity-100",
                    barClassName,
                    point.value === 0 && "bg-muted",
                  )}
                  style={{ height: `${Math.max(height, point.value > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis labels — first and last month only, to stay readable on mobile. */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>{data.length > 0 ? monthLabel(data[0]!.month) : ""}</span>
        <span>{data.length > 1 ? monthLabel(data[data.length - 1]!.month) : ""}</span>
      </div>
    </figure>
  );
}
