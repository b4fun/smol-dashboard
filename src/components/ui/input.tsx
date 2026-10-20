"use client";

import * as React from "react";
import { formControlClasses } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentPropsWithoutRef<"input">;
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => <input ref={ref} type={type} data-slot="input" className={cn(formControlClasses, className)} {...props} />,
);
Input.displayName = "Input";
