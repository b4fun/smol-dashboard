"use client";

import * as React from "react";
import { formControlClasses } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

export type SelectProps = React.ComponentPropsWithoutRef<"select">;
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => <select ref={ref} data-slot="select" className={cn(formControlClasses, "cursor-pointer disabled:cursor-default", className)} {...props} />,
);
Select.displayName = "Select";
