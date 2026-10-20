"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = Omit<React.ComponentPropsWithoutRef<"div">, "children">;
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => <div ref={ref} aria-hidden="true" data-slot="skeleton" className={cn("rounded-md bg-foreground/15 motion-safe:animate-pulse", className)} {...props} />,
);
Skeleton.displayName = "Skeleton";
