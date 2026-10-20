"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const statuses = {
  success: { label: "Success", className: "border-green-700 dark:border-green-400" },
  failed: { label: "Failed", className: "border-red-600 dark:border-red-400" },
  warning: { label: "Warning", className: "border-amber-700 dark:border-amber-400" },
  neutral: { label: "Neutral", className: "border-slate-500 dark:border-slate-400" },
};

const sizes = { sm: "size-3", default: "size-3.5", lg: "size-4" };

export interface StatusIndicatorProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  status: keyof typeof statuses;
  size?: keyof typeof sizes;
}

export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ status, size = "default", className, ...props }, ref) => (
    <span
      ref={ref}
      role="img"
      aria-label={statuses[status].label}
      data-slot="status-indicator"
      className={cn("inline-block shrink-0 rounded-full border-2", statuses[status].className, sizes[size], className)}
      {...props}
    />
  ),
);

StatusIndicator.displayName = "StatusIndicator";
