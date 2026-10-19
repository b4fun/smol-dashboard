"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface AppShellBreadcrumb {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface AppShellHeaderProps extends React.ComponentPropsWithoutRef<"header"> {
  title: string;
  /** Ancestors, ordered from the root to the immediate parent. */
  breadcrumbs?: AppShellBreadcrumb[];
  leading?: React.ReactNode;
  actions?: React.ReactNode;
}

function Separator() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0"><path d="m6 4 4 4-4 4" /></svg>;
}

export const AppShellHeader = React.forwardRef<HTMLElement, AppShellHeaderProps>(
  ({ title, breadcrumbs = [], leading, actions, className, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState(false);
    const hovered = React.useRef(false);
    const disclosure = React.useRef<HTMLButtonElement>(null);
    const firstLink = React.useRef<HTMLAnchorElement>(null);
    const firstMiddleLink = React.useRef<HTMLAnchorElement>(null);
    const middleId = React.useId();
    React.useLayoutEffect(() => {
      if (expanded && document.activeElement === disclosure.current) firstMiddleLink.current?.focus();
    }, [expanded]);
    const collapsible = breadcrumbs.length > 1;
    const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

    const renderAncestor = (item: AppShellBreadcrumb, index: number) => (
      <li key={`${item.href}-${index}`} id={index > 0 ? `${middleId}-${index}` : undefined}
        hidden={index > 0 && !expanded} className={cn("shrink-0 items-center gap-2", index > 0 && !expanded ? "hidden" : "flex")}>
        <a ref={index === 0 ? firstLink : index === 1 ? firstMiddleLink : undefined} href={item.href} className={cn("group inline-flex min-h-9 items-center gap-2 rounded-md px-1", focus)}>
          {item.icon && <span aria-hidden="true" className="shrink-0">{item.icon}</span>}
          <span className="group-hover:underline">{item.label}</span>
        </a>
        <Separator />
      </li>
    );

    return (
      <header ref={ref} data-slot="app-shell-header"
        className={cn("flex min-h-16 shrink-0 items-center gap-2 border-b border-border px-2 py-3 md:px-3", className)} {...props}>
        {leading}
        {breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className={cn("min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded-md", focus)}
            tabIndex={0}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") { hovered.current = true; setExpanded(true); } }}
            onPointerLeave={(event) => { hovered.current = false; if (!event.currentTarget.contains(document.activeElement)) setExpanded(false); }}
            onFocusCapture={(event) => { if (event.target !== disclosure.current) setExpanded(true); }}
            onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !hovered.current) setExpanded(false); }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && collapsible) {
                event.preventDefault();
                firstLink.current?.focus();
                setExpanded(false);
              }
            }}>
            <ol className="flex w-max min-w-full items-center gap-2 whitespace-nowrap text-base">
              {renderAncestor(breadcrumbs[0], 0)}
              {collapsible && (
                <li hidden={expanded} className={cn("shrink-0 items-center gap-2", expanded ? "hidden" : "flex")}>
                  <button ref={disclosure} type="button" aria-label="Show intermediate pages"
                    aria-expanded={expanded} aria-controls={breadcrumbs.slice(1).map((_, index) => `${middleId}-${index + 1}`).join(" ")}
                    onClick={() => setExpanded(true)}
                    className={cn("inline-flex size-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent", focus)}>
                    <span aria-hidden="true">…</span>
                  </button>
                  <Separator />
                </li>
              )}
              {breadcrumbs.slice(1).map((item, index) => renderAncestor(item, index + 1))}
              <li className="shrink-0" aria-current="page"><h1 className="font-semibold">{title}</h1></li>
            </ol>
          </nav>
        ) : <div className="min-w-0 flex-1 overflow-x-auto"><h1 className="w-max min-w-full whitespace-nowrap text-base font-semibold">{title}</h1></div>}
        {actions && <div data-slot="app-shell-header-actions" className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    );
  },
);

AppShellHeader.displayName = "AppShellHeader";
