"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Slottable } from "@radix-ui/react-slot";
import { MenuModalContext, useModalMenuRef } from "@/components/ui/menu-accessibility";

import { cn } from "@/lib/utils";
import {
  menuContentClasses as contentClasses, menuItemClasses as itemClasses,
  destructiveMenuItemClasses, menuLabelClasses, menuSeparatorClasses, submenuShiftClasses,
} from "@/components/ui/menu-styles";

export type ContextMenuProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>;

export function ContextMenu({ modal = true, ...props }: ContextMenuProps) {
  return <MenuModalContext.Provider value={modal}><ContextMenuPrimitive.Root modal={modal} {...props} /></MenuModalContext.Provider>;
}
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
export const ContextMenuSub = ContextMenuPrimitive.Sub;
export const ContextMenuPortal = ContextMenuPrimitive.Portal;

export type {
  ContextMenuGroupProps,
  ContextMenuRadioGroupProps,
  ContextMenuSubProps,
  ContextMenuPortalProps,
} from "@radix-ui/react-context-menu";

export type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>;

export const ContextMenuTrigger = React.forwardRef<HTMLSpanElement, ContextMenuTriggerProps>(
  ({ className, disabled, onKeyDown, onContextMenu, onPointerDown, ...props }, ref) => (
    <ContextMenuPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-haspopup="menu"
      aria-disabled={disabled || undefined}
      data-slot="context-menu-trigger"
      className={cn("inline-flex cursor-context-menu rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground data-[disabled]:cursor-default", className)}
      {...props}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (!disabled && !event.defaultPrevented) event.currentTarget.focus();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!disabled && !event.defaultPrevented && event.pointerType !== "mouse") event.currentTarget.focus();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (disabled || event.defaultPrevented) return;
        if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          // Route keyboard requests through the same positioned opening behavior as right-click.
          event.currentTarget.dispatchEvent(new MouseEvent("contextmenu", {
            bubbles: true, cancelable: true, button: 2, clientX: bounds.left, clientY: bounds.bottom,
          }));
        }
      }}
    />
  ),
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export type ContextMenuContentProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> &
  Pick<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Portal>, "container">;

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ className, container, forceMount, collisionPadding = 8, ...props }, ref) => {
    const contentRef = useModalMenuRef(ref);
    return (
      <ContextMenuPrimitive.Portal container={container} forceMount={forceMount}>
        <ContextMenuPrimitive.Content ref={contentRef} forceMount={forceMount} collisionPadding={collisionPadding}
          data-slot="context-menu-content" className={cn(contentClasses, className)} {...props} />
      </ContextMenuPrimitive.Portal>
    );
  },
);
ContextMenuContent.displayName = "ContextMenuContent";

export type ContextMenuItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, icon, variant = "default", children, ...props }, ref) => (
    <ContextMenuPrimitive.Item ref={ref} data-slot="context-menu-item"
      className={cn(itemClasses, variant === "destructive" && destructiveMenuItemClasses, className)} {...props}>
      {icon && <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-full">{icon}</span>}
      <Slottable>{children}</Slottable>
    </ContextMenuPrimitive.Item>
  ),
);
ContextMenuItem.displayName = "ContextMenuItem";

export type ContextMenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>;

export const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  ({ className, children, checked, ...props }, ref) => (
    <ContextMenuPrimitive.CheckboxItem ref={ref} checked={checked} data-slot="context-menu-checkbox-item" className={cn(itemClasses, "pl-8", className)} {...props}>
      <span aria-hidden="true" className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
            <path d={checked === "indeterminate" ? "M3 8h10" : "m3 8 3 3 7-7"} />
          </svg>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      <Slottable>{children}</Slottable>
    </ContextMenuPrimitive.CheckboxItem>
  ),
);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>;

export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <ContextMenuPrimitive.RadioItem ref={ref} data-slot="context-menu-radio-item" className={cn(itemClasses, "pl-8", className)} {...props}>
      <span aria-hidden="true" className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator><span className="block size-2 rounded-full bg-current" /></ContextMenuPrimitive.ItemIndicator>
      </span>
      <Slottable>{children}</Slottable>
    </ContextMenuPrimitive.RadioItem>
  ),
);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuLabelProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>;

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, ...props }, ref) => <ContextMenuPrimitive.Label ref={ref} data-slot="context-menu-label" className={cn(menuLabelClasses, className)} {...props} />,
);
ContextMenuLabel.displayName = "ContextMenuLabel";

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>;

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => <ContextMenuPrimitive.Separator ref={ref} data-slot="context-menu-separator" className={cn(menuSeparatorClasses, className)} {...props} />,
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export type ContextMenuSubTriggerProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>;

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <ContextMenuPrimitive.SubTrigger ref={ref} data-slot="context-menu-sub-trigger" className={cn(itemClasses, "data-[state=open]:bg-accent", className)} {...props}>
      <Slottable>{children}</Slottable>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto size-4 shrink-0 rtl:rotate-180"><path d="m6 4 4 4-4 4" /></svg>
    </ContextMenuPrimitive.SubTrigger>
  ),
);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>;

export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  ({ className, collisionPadding = 8, ...props }, ref) => (
    <ContextMenuPrimitive.SubContent ref={ref} collisionPadding={collisionPadding} data-slot="context-menu-sub-content" className={cn(contentClasses, submenuShiftClasses, className)} {...props} />
  ),
);
ContextMenuSubContent.displayName = "ContextMenuSubContent";
