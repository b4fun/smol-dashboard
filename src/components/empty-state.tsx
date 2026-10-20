"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "children"> {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLElement, EmptyStateProps>(
  ({ title, description, icon, actions, className, ...props }, ref) => {
    const titleId = React.useId();
    return (
      <section ref={ref} aria-labelledby={props["aria-label"] ? undefined : titleId} data-slot="empty-state"
        className={cn("flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-foreground/45 bg-background p-6 text-center text-foreground [overflow-wrap:anywhere]", className)} {...props}>
        {icon && <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg bg-accent [&_svg]:size-5">{icon}</span>}
        <h2 id={titleId} className="font-semibold">{title}</h2>
        {description && <div className="max-w-md text-sm text-foreground/70">{description}</div>}
        {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
      </section>
    );
  },
);
EmptyState.displayName = "EmptyState";
