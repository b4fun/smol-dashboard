"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CollapsibleListItem {
  id: string;
  title: React.ReactNode;
  href?: string;
  description?: React.ReactNode;
  metadata?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Decorative icon; convey its meaning in the group label or item text. */
  leading?: React.ReactNode;
}

export interface CollapsibleListGroup {
  id: string;
  label: string;
  items: CollapsibleListItem[];
  /** Groups start expanded unless this is false. */
  defaultOpen?: boolean;
}

export interface CollapsibleListProps extends React.ComponentPropsWithoutRef<"div"> {
  groups: CollapsibleListGroup[];
  emptyMessage?: React.ReactNode;
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export const CollapsibleList = React.forwardRef<HTMLDivElement, CollapsibleListProps>(
  ({ groups, emptyMessage = "No items.", className, ...props }, ref) => (
    <div ref={ref} data-slot="collapsible-list" className={cn("@container space-y-6 bg-background text-foreground", className)} {...props}>
      {groups.map((group) => (
        <details key={group.id} open={group.defaultOpen ?? true} data-slot="collapsible-list-group" className="group">
          <summary
            data-slot="collapsible-list-trigger"
            className={cn("flex min-h-10 cursor-pointer list-none select-none items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold hover:bg-foreground/10 [&::-webkit-details-marker]:hidden", focus)}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="size-3.5 shrink-0 text-foreground/70 transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none">
              <path d="m6 4 4 4-4 4" />
            </svg>
            <span className="min-w-0 [overflow-wrap:anywhere]">{group.label}</span>
            <span className="shrink-0 font-medium text-foreground/70">
              {group.items.length}<span className="sr-only"> {group.items.length === 1 ? "item" : "items"}</span>
            </span>
          </summary>
          {group.items.length > 0 ? (
            <ul aria-label={group.label} className="mt-1 space-y-1">
              {group.items.map((item) => (
                <li key={item.id} data-slot="collapsible-list-item"
                  className={cn(
                    "flex items-start gap-3 px-6 py-4 [overflow-wrap:anywhere]",
                    item.href !== undefined && "relative rounded-lg hover:bg-foreground/5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-foreground",
                  )}>
                  {item.leading && (
                    <span data-slot="collapsible-list-leading" aria-hidden="true"
                      className={cn("flex w-4 shrink-0 items-center justify-center", item.href !== undefined ? "h-6" : "h-5")}>{item.leading}</span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2 @lg:flex-row @lg:items-end @lg:gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {item.href !== undefined ? (
                          <a href={item.href} className="inline-flex min-h-6 items-center rounded-sm after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">{item.title}</a>
                        ) : item.title}
                      </div>
                      {item.description && <div className="text-xs text-foreground/70">{item.description}</div>}
                      {item.metadata && <div className="text-xs text-foreground/70">{item.metadata}</div>}
                    </div>
                    {item.trailing && <div data-slot="collapsible-list-trailing" className="text-xs text-foreground/70 @lg:max-w-[40%] @lg:text-right">{item.trailing}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="px-6 py-4 text-sm text-foreground/70">{emptyMessage}</div>}
        </details>
      ))}
    </div>
  ),
);

CollapsibleList.displayName = "CollapsibleList";
