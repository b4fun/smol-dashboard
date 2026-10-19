"use client";

import * as React from "react";

import { AppShellHeader, type AppShellBreadcrumb } from "@/components/app-shell-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface AppShellNavGroup {
  label: string;
  items: AppShellNavItem[];
}

export interface AppShellProps extends React.ComponentPropsWithoutRef<"div"> {
  brand: React.ReactNode;
  brandHref?: string;
  title: string;
  breadcrumbs?: AppShellBreadcrumb[];
  navigation: AppShellNavGroup[];
  sidebarFooter?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ brand, brandHref = "/", title, breadcrumbs, navigation, sidebarFooter, headerActions, children, className, ...props }, ref) => {
    const sidebarId = React.useId();
    const mainId = React.useId();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [desktopOpen, setDesktopOpen] = React.useState(true);
    const toggleIcon = (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
      </svg>
    );

    return (
      <div ref={ref} className={cn("relative flex h-dvh flex-col overflow-hidden bg-accent text-foreground md:flex-row md:p-2", className)} {...props}>
        <a href={`#${mainId}`} className={cn("sr-only z-10 rounded-md bg-background p-3 focus:not-sr-only focus:absolute focus:top-3 focus:left-3", focus)}>
          Skip to content
        </a>
        <aside
          id={sidebarId}
          data-slot="app-shell-sidebar"
          className={cn(
            "max-h-[50dvh] min-h-0 shrink-0 flex-col gap-2 px-1 py-1 md:flex md:max-h-none md:transition-[width] md:duration-200 md:ease-in-out md:motion-reduce:transition-none",
            mobileOpen ? "flex" : "hidden",
            desktopOpen ? "md:w-64" : "md:w-14",
          )}
        >
          <div data-slot="app-shell-brand" className="flex min-h-14 shrink-0 items-center gap-1 px-1">
            <a href={brandHref} className={cn("flex min-h-10 min-w-0 flex-1 items-center overflow-hidden rounded-md text-lg font-semibold tracking-tight whitespace-nowrap transition-[opacity,visibility] duration-150 motion-reduce:transition-none", !desktopOpen && "md:invisible md:pointer-events-none md:opacity-0", focus)}>
              {brand}
            </a>
            <Button
              variant="ghost" size="icon" className="ml-auto hidden shrink-0 md:inline-flex"
              aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={desktopOpen} aria-controls={sidebarId}
              onClick={() => setDesktopOpen((open) => !open)}
            >{toggleIcon}</Button>
          </div>
          <nav data-slot="app-shell-navigation" aria-label="Main navigation" className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
            {navigation.map((group, groupIndex) => (
              <div key={group.label}>
                <h2 id={`${sidebarId}-${groupIndex}`} className={cn("mb-2 px-3 text-xs font-medium", !desktopOpen && "md:sr-only")}>{group.label}</h2>
                <ul aria-labelledby={`${sidebarId}-${groupIndex}`} className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={item.active ? "page" : undefined}
                        title={item.label}
                        className={cn(
                          "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-background",
                          focus,
                          !desktopOpen && "md:justify-center md:px-0",
                          item.active && "bg-background font-semibold shadow-sm",
                        )}
                      >
                        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                          {item.icon ?? <span className="text-xs font-semibold">{item.label.slice(0, 1)}</span>}
                        </span>
                        <span className={cn(!desktopOpen && "md:sr-only")}>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {sidebarFooter && <div data-slot="app-shell-footer" className={cn("mt-auto shrink-0 border-t border-border pt-2", !desktopOpen && "md:hidden")}>{sidebarFooter}</div>}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background md:rounded-xl md:border md:border-border md:shadow-sm">
          <AppShellHeader
            title={title}
            breadcrumbs={breadcrumbs}
            actions={headerActions}
            leading={
              <>
                <Button
                  variant="ghost" size="icon" className="md:hidden"
                  aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={mobileOpen} aria-controls={sidebarId}
                  onClick={() => setMobileOpen((open) => !open)}
                >{toggleIcon}</Button>
                <span aria-hidden="true" className="h-5 w-px bg-border md:hidden" />
              </>
            }
          />
          <main data-slot="app-shell-content" id={mainId} tabIndex={0} className="min-h-0 flex-1 overflow-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:p-6">{children}</main>
        </div>
      </div>
    );
  },
);

AppShell.displayName = "AppShell";
