"use client";

import * as React from "react";
import { formControlClasses } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

export type SelectProps = React.ComponentPropsWithoutRef<"select">;
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <span className="relative block w-full min-w-0">
      <select ref={ref} data-slot="select" className={cn(formControlClasses, "peer cursor-pointer appearance-none pr-10 disabled:cursor-default", className)} {...props} />
      <svg aria-hidden="true" data-slot="select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-foreground peer-disabled:opacity-50">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </span>
  ),
);
Select.displayName = "Select";
