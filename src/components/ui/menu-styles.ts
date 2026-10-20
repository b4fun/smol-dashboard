export const menuContentClasses = "z-50 w-56 max-w-[calc(100vw-1rem)] max-h-[var(--radix-popper-available-height)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg border border-foreground/45 bg-background p-1 text-foreground shadow-lg";

export const menuItemClasses = "relative flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm [overflow-wrap:anywhere] data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:opacity-50";

export const destructiveMenuItemClasses = "text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 dark:text-red-400 dark:data-[highlighted]:bg-red-950 dark:data-[highlighted]:text-red-400";

export const menuLabelClasses = "px-2 py-1.5 text-xs font-semibold text-foreground/70";
export const menuSeparatorClasses = "-mx-1 my-1 h-px bg-border";

// Overlap the parent when the viewport cannot fit two menu columns.
export const submenuShiftClasses = "data-[side=left]:translate-x-[max(0px,calc(100%_-_var(--radix-popper-available-width)))] data-[side=right]:translate-x-[min(0px,calc(var(--radix-popper-available-width)_-_100%))]";
