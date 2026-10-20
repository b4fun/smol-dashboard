"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldControlProps {
  id: string;
  required: boolean;
  disabled: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export interface FieldProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: (props: FieldControlProps) => React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ id, label, description, error, required = false, disabled = false, children, className, ...props }, ref) => {
    const generatedId = React.useId();
    const controlId = id ?? generatedId;
    const descriptionId = `${controlId}-description`;
    const errorId = `${controlId}-error`;
    const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined;
    return (
      <div ref={ref} data-slot="field" className={cn("space-y-2", className)} {...props}>
        <label htmlFor={controlId} className="block text-sm font-medium">{label}{required && <span className="ml-1 text-xs text-foreground/70">(required)</span>}</label>
        {children({ id: controlId, required, disabled, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
        {description && <p id={descriptionId} className="text-sm text-foreground/70">{description}</p>}
        {error && <p id={errorId} className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Field.displayName = "Field";
