"use client";

import * as React from "react";
import { formControlClasses } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

export type SelectProps = React.ComponentPropsWithoutRef<"select">;
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onPointerDown, onKeyDown, onBlur, ...props }, ref) => (
    <span className="relative block w-full min-w-0">
      {/* Browsers match :focus-visible on a select even after a mouse click, so mark pointer focus to hide the outline. */}
      <select
        ref={ref}
        data-slot="select"
        className={cn(formControlClasses, "peer cursor-pointer appearance-none pr-10 disabled:cursor-default data-pointer-focus:focus-visible:outline-none", className)}
        onPointerDown={(event) => {
          event.currentTarget.dataset.pointerFocus = "";
          onPointerDown?.(event);
        }}
        onKeyDown={(event) => {
          delete event.currentTarget.dataset.pointerFocus;
          onKeyDown?.(event);
        }}
        onBlur={(event) => {
          delete event.currentTarget.dataset.pointerFocus;
          onBlur?.(event);
        }}
        {...props}
      />
      <svg aria-hidden="true" data-slot="select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-foreground peer-disabled:opacity-50">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </span>
  ),
);
Select.displayName = "Select";
