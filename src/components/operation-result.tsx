"use client";

import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { FeedbackIcon } from "@/components/ui/feedback-icons";
import { cn } from "@/lib/utils";

export interface OperationResultProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  status: "pending" | "success" | "failed";
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const OperationResult = React.forwardRef<HTMLElement, OperationResultProps>(
  ({ status, title, description, actions, children, className, ...props }, ref) => {
    const titleId = React.useId();
    return (
      <section ref={ref} role={status === "failed" ? "alert" : "status"} aria-labelledby={props["aria-label"] ? undefined : titleId}
        data-slot="operation-result" data-status={status} className={cn("space-y-4 rounded-lg border border-foreground/45 bg-background p-5 text-foreground [overflow-wrap:anywhere]", className)} {...props}>
        <div className="flex items-start gap-3">
          {status === "pending" ? <Spinner aria-hidden="true" className="mt-0.5 size-5" /> : <FeedbackIcon variant={status} className={cn("mt-0.5 size-5 shrink-0", status === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")} />}
          <div className="min-w-0 space-y-1"><h2 id={titleId} className="font-semibold">{title}</h2>{description && <div className="text-sm text-foreground/70">{description}</div>}</div>
        </div>
        {children}
        {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
      </section>
    );
  },
);
OperationResult.displayName = "OperationResult";
