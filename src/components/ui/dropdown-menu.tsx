"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Slottable } from "@radix-ui/react-slot";
import { ModalContext, useModalContentRef } from "@/components/ui/overlay-accessibility";

import { cn } from "@/lib/utils";
import {
  menuContentClasses as contentClasses, menuItemClasses as itemClasses,
  destructiveMenuItemClasses, menuLabelClasses, menuSeparatorClasses, submenuShiftClasses,
} from "@/components/ui/menu-styles";

export type DropdownMenuProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>;

export function DropdownMenu({ modal = true, ...props }: DropdownMenuProps) {
  return <ModalContext.Provider value={modal}><DropdownMenuPrimitive.Root modal={modal} {...props} /></ModalContext.Provider>;
}
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export type {
  DropdownMenuGroupProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuSubProps,
  DropdownMenuPortalProps,
} from "@radix-ui/react-dropdown-menu";

export type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>;

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, type = "button", ...props }, ref) => (
    <DropdownMenuPrimitive.Trigger ref={ref} type={type} data-slot="dropdown-menu-trigger" className={cn("cursor-pointer disabled:cursor-default", className)} {...props} />
  ),
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> &
  Pick<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>, "container">;

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, container, forceMount, align = "end", sideOffset = 4, collisionPadding = 8, ...props }, ref) => {
    const contentRef = useModalContentRef(ref);
    return (
      <DropdownMenuPrimitive.Portal container={container} forceMount={forceMount}>
        <DropdownMenuPrimitive.Content ref={contentRef} forceMount={forceMount} align={align} sideOffset={sideOffset} collisionPadding={collisionPadding}
          data-slot="dropdown-menu-content" className={cn(contentClasses, className)} {...props} />
      </DropdownMenuPrimitive.Portal>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, icon, variant = "default", children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item ref={ref} data-slot="dropdown-menu-item"
      className={cn(itemClasses, variant === "destructive" && destructiveMenuItemClasses, className)} {...props}>
      {icon && <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-full">{icon}</span>}
      <Slottable>{children}</Slottable>
    </DropdownMenuPrimitive.Item>
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>;

export const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem ref={ref} checked={checked} data-slot="dropdown-menu-checkbox-item" className={cn(itemClasses, "pl-8", className)} {...props}>
      <span aria-hidden="true" className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
            <path d={checked === "indeterminate" ? "M3 8h10" : "m3 8 3 3 7-7"} />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <Slottable>{children}</Slottable>
    </DropdownMenuPrimitive.CheckboxItem>
  ),
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>;

export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem ref={ref} data-slot="dropdown-menu-radio-item" className={cn(itemClasses, "pl-8", className)} {...props}>
      <span aria-hidden="true" className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator><span className="block size-2 rounded-full bg-current" /></DropdownMenuPrimitive.ItemIndicator>
      </span>
      <Slottable>{children}</Slottable>
    </DropdownMenuPrimitive.RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>;

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => <DropdownMenuPrimitive.Label ref={ref} data-slot="dropdown-menu-label" className={cn(menuLabelClasses, className)} {...props} />,
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>;

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => <DropdownMenuPrimitive.Separator ref={ref} data-slot="dropdown-menu-separator" className={cn(menuSeparatorClasses, className)} {...props} />,
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>;

export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger ref={ref} data-slot="dropdown-menu-sub-trigger" className={cn(itemClasses, "data-[state=open]:bg-accent", className)} {...props}>
      <Slottable>{children}</Slottable>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto size-4 shrink-0 rtl:rotate-180"><path d="m6 4 4 4-4 4" /></svg>
    </DropdownMenuPrimitive.SubTrigger>
  ),
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>;

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, collisionPadding = 8, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent ref={ref} collisionPadding={collisionPadding} data-slot="dropdown-menu-sub-content" className={cn(contentClasses, submenuShiftClasses, className)} {...props} />
  ),
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
