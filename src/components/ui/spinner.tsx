"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  label?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ label = "Loading", className, ...props }, ref) => (
    <span ref={ref} role="status" data-slot="spinner" className={cn("inline-flex size-4 shrink-0", className)} {...props}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-full motion-safe:animate-spin">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  ),
);
Spinner.displayName = "Spinner";
