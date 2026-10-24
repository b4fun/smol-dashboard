"use client";

import * as React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, type DropdownMenuContentProps } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface InputPreset {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface PresetInputProps extends Omit<InputProps, "value" | "defaultValue" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  presets: InputPreset[];
  presetLabel: string;
  container?: DropdownMenuContentProps["container"];
}

export const PresetInput = React.forwardRef<HTMLInputElement, PresetInputProps>(
  ({ value, onValueChange, presets, presetLabel, container, disabled, className, ...props }, ref) => {
    const input = React.useRef<HTMLInputElement>(null);
    const composedRef = useComposedRefs(ref, input);
    const selected = React.useRef(false);
    return (
      <div className="relative">
        <Input ref={composedRef} value={value} onChange={(event) => onValueChange(event.currentTarget.value)} disabled={disabled} className={cn("pr-12", className)} {...props} />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button variant="ghost" size="icon-sm" className="absolute top-1 right-1" aria-label={presetLabel}
              icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 6 4 4 4-4" /></svg>} />
          </DropdownMenuTrigger>
          <DropdownMenuContent container={container} alignOffset={-4} style={{ width: input.current?.getBoundingClientRect().width }} onCloseAutoFocus={(event) => {
            if (selected.current) { event.preventDefault(); input.current?.focus(); selected.current = false; }
          }}>
            <DropdownMenuRadioGroup value={value} onValueChange={(next) => { selected.current = true; onValueChange(next); }}>
              {presets.map((preset) => (
                <DropdownMenuRadioItem key={preset.value} value={preset.value} disabled={preset.disabled} textValue={preset.label}>
                  <span><span className="block">{preset.label}</span>{preset.description && <span className="block text-xs text-foreground/70">{preset.description}</span>}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);
PresetInput.displayName = "PresetInput";
