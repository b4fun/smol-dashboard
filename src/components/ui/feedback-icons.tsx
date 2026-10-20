import type { ComponentPropsWithoutRef } from "react";

export type FeedbackVariant = "info" | "success" | "warning" | "failed";

export function FeedbackIcon({ variant, ...props }: ComponentPropsWithoutRef<"svg"> & { variant: FeedbackVariant }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      {variant === "warning" ? <><path d="m8 2 6 11H2L8 2Z" /><path d="M8 6v3 M8 11v1" /></> : <>
        <circle cx="8" cy="8" r="6" />
        {variant === "success" ? <path d="m4.5 8 2.5 2.5 4.5-5" /> : variant === "failed" ? <path d="m5.5 5.5 5 5 M10.5 5.5l-5 5" /> : <path d="M8 7v4 M8 4.5V5" />}
      </>}
    </svg>
  );
}
