"use client";

import * as React from "react";
import { FeedbackIcon, type FeedbackVariant } from "@/components/ui/feedback-icons";
import { cn } from "@/lib/utils";

const variants = {
  info: "border-blue-700 bg-blue-50 text-blue-950 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-100",
  success: "border-green-700 bg-green-50 text-green-950 dark:border-green-400 dark:bg-green-950/40 dark:text-green-100",
  warning: "border-amber-700 bg-amber-50 text-amber-950 dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-100",
  failed: "border-red-700 bg-red-50 text-red-950 dark:border-red-400 dark:bg-red-950/40 dark:text-red-100",
};

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title: string;
  variant?: FeedbackVariant;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ title, variant = "info", children, className, ...props }, ref) => {
    const titleId = React.useId();
    return (
      <div ref={ref} role={variant === "failed" ? "alert" : "status"} aria-labelledby={props["aria-label"] ? undefined : titleId}
        data-slot="alert" className={cn("flex gap-3 rounded-lg border p-4 text-sm [overflow-wrap:anywhere]", variants[variant], className)} {...props}>
        <FeedbackIcon variant={variant} className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 space-y-1"><h2 id={titleId} className="font-semibold">{title}</h2>{children && <div>{children}</div>}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";
