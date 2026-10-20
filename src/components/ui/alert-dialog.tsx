"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { DialogHeader, DialogFooter, type DialogHeaderProps, type DialogFooterProps } from "@/components/ui/dialog";
import { ModalContext, useModalContentRef } from "@/components/ui/overlay-accessibility";
import { dialogContentClasses, dialogOverlayClasses, dialogSizes } from "@/components/ui/dialog-styles";
import { cn } from "@/lib/utils";

export type AlertDialogProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>;
export function AlertDialog(props: AlertDialogProps) {
  return <ModalContext.Provider value={true}><AlertDialogPrimitive.Root {...props} /></ModalContext.Provider>;
}
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export type AlertDialogPortalProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>;
export type AlertDialogTriggerProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>;
export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ className, type = "button", ...props }, ref) => <AlertDialogPrimitive.Trigger ref={ref} type={type} className={cn("cursor-pointer disabled:cursor-default", className)} {...props} />,
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export type AlertDialogContentProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
  container?: AlertDialogPortalProps["container"];
  size?: keyof typeof dialogSizes;
};
export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ className, container, size = "sm", forceMount, ...props }, ref) => {
    const contentRef = useModalContentRef(ref);
    return (
      <AlertDialogPrimitive.Portal container={container} forceMount={forceMount}>
        <AlertDialogPrimitive.Overlay forceMount={forceMount} className={dialogOverlayClasses} />
        <AlertDialogPrimitive.Content ref={contentRef} forceMount={forceMount} data-slot="alert-dialog-content" className={cn(dialogContentClasses, dialogSizes[size], className)} {...props} />
      </AlertDialogPrimitive.Portal>
    );
  },
);
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogHeader = DialogHeader;
export const AlertDialogFooter = DialogFooter;
export type AlertDialogHeaderProps = DialogHeaderProps;
export type AlertDialogFooterProps = DialogFooterProps;

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>;
export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ className, ...props }, ref) => <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold [overflow-wrap:anywhere]", className)} {...props} />,
);
AlertDialogTitle.displayName = "AlertDialogTitle";

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>;
export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ className, ...props }, ref) => <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-foreground/70 [overflow-wrap:anywhere]", className)} {...props} />,
);
AlertDialogDescription.displayName = "AlertDialogDescription";

export type AlertDialogActionProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>;
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, type = "button", ...props }, ref) => <AlertDialogPrimitive.Action ref={ref} type={type} className={cn(buttonVariants({ variant: "destructive" }), className)} {...props} />,
);
AlertDialogAction.displayName = "AlertDialogAction";

export type AlertDialogCancelProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>;
export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ className, type = "button", ...props }, ref) => <AlertDialogPrimitive.Cancel ref={ref} type={type} className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />,
);
AlertDialogCancel.displayName = "AlertDialogCancel";
