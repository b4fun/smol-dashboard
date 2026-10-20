"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ModalContext, useModalContentRef } from "@/components/ui/overlay-accessibility";
import { dialogContentClasses, dialogOverlayClasses, dialogSizes } from "@/components/ui/dialog-styles";
import { cn } from "@/lib/utils";

export type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export function Dialog({ modal = true, ...props }: DialogProps) {
  return <ModalContext.Provider value={modal}><DialogPrimitive.Root modal={modal} {...props} /></ModalContext.Provider>;
}
export const DialogPortal = DialogPrimitive.Portal;
export type DialogPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type DialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type DialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, type = "button", ...props }, ref) => <DialogPrimitive.Trigger ref={ref} type={type} className={cn("cursor-pointer disabled:cursor-default", className)} {...props} />,
);
DialogTrigger.displayName = "DialogTrigger";

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, type = "button", ...props }, ref) => <DialogPrimitive.Close ref={ref} type={type} className={cn("cursor-pointer disabled:cursor-default", className)} {...props} />,
);
DialogClose.displayName = "DialogClose";

export type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} data-slot="dialog-overlay" className={cn(dialogOverlayClasses, className)} {...props} />,
);
DialogOverlay.displayName = "DialogOverlay";

export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  container?: DialogPortalProps["container"];
  size?: keyof typeof dialogSizes;
  showCloseButton?: boolean;
  closeLabel?: string;
};
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, container, size = "default", showCloseButton = true, closeLabel = "Close dialog", forceMount, children, ...props }, ref) => {
    const contentRef = useModalContentRef(ref);
    return (
      <DialogPrimitive.Portal container={container} forceMount={forceMount}>
        <DialogOverlay forceMount={forceMount} />
        <DialogPrimitive.Content ref={contentRef} forceMount={forceMount} data-slot="dialog-content" className={cn(dialogContentClasses, dialogSizes[size], className)} {...props}>
          {children}
          {showCloseButton && <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" aria-label={closeLabel} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 4 8 8 M12 4l-8 8" /></svg>} />
          </DialogClose>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);
DialogContent.displayName = "DialogContent";

export type DialogHeaderProps = React.ComponentPropsWithoutRef<"div">;
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => <div ref={ref} data-slot="dialog-header" className={cn("space-y-2 pr-8", className)} {...props} />,
);
DialogHeader.displayName = "DialogHeader";

export type DialogFooterProps = React.ComponentPropsWithoutRef<"div">;
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => <div ref={ref} data-slot="dialog-footer" className={cn("flex flex-col gap-2 sm:flex-row sm:justify-end", className)} {...props} />,
);
DialogFooter.displayName = "DialogFooter";

export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold [overflow-wrap:anywhere]", className)} {...props} />,
);
DialogTitle.displayName = "DialogTitle";

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-foreground/70 [overflow-wrap:anywhere]", className)} {...props} />,
);
DialogDescription.displayName = "DialogDescription";
