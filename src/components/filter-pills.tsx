"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterPillOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterPillsProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  label: string;
  options: FilterPillOption[];
  value: string;
  onValueChange: (value: string) => void;
}

export const FilterPills = React.forwardRef<HTMLDivElement, FilterPillsProps>(
  ({ label, options, value, onValueChange, className, ...props }, ref) => (
    <div ref={ref} role="group" aria-label={label} data-slot="filter-pills" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Button key={option.value} variant={selected ? "default" : "outline"} size="sm" className="rounded-full transition-none"
            aria-pressed={selected} disabled={option.disabled}
            aria-label={option.count === undefined ? option.label : `${option.label}, ${option.count} ${option.count === 1 ? "item" : "items"}`}
            onClick={() => onValueChange(option.value)}
            icon={<span className="size-4">{selected && <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 8 3 3 7-7" /></svg>}</span>}>
            {option.label}{option.count !== undefined && (
              <span className={cn(
                "min-w-5 rounded-full px-1.5 text-center text-[10px] leading-5 tabular-nums",
                selected ? "bg-primary-foreground/15 text-primary-foreground" : "bg-foreground/5 text-foreground/70",
              )}>{option.count}</span>
            )}
          </Button>
        );
      })}
    </div>
  ),
);
FilterPills.displayName = "FilterPills";
