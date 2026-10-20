import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";

function PauseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="3" width="2.5" height="10" rx="0.5" /><rect x="9.5" y="3" width="2.5" height="10" rx="0.5" /></svg>;
}

function SnapshotIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2h-5 M14 2v6h6" /><circle cx="6" cy="16" r="5" /><path d="M6 13v3l2 1" /></svg>;
}

function MoreIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3.5" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="8" cy="12.5" r="1" /></svg>;
}

function PlusIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10 M3 8h10" /></svg>;
}

function ActionButtonsExample({ disabled }: { disabled?: boolean }) {
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Sandbox actions" className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" icon={<PauseIcon />} disabled={disabled} onClick={() => setMessage("Pause requested.")}>Pause</Button>
        <Button variant="outline" size="sm" icon={<SnapshotIcon />} disabled={disabled} onClick={() => setMessage("Snapshot requested.")}>Snapshot</Button>
        <Button variant="outline" size="icon-sm" icon={<MoreIcon />} aria-label="More actions" title="More actions" disabled={disabled} onClick={() => setMessage("More actions requested.")} />
      </div>
      <p role="status" className="min-h-5 text-sm">{message}</p>
    </div>
  );
}

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Open dashboard", variant: "default", size: "default", disabled: false },
  argTypes: {
    children: { control: "text" },
    variant: { control: "select", options: ["default", "outline", "ghost"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"] },
    disabled: { control: "boolean" },
    icon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
  args: { variant: "outline", size: "sm", icon: <PauseIcon />, children: "Pause" },
};
export const Snapshot: Story = {
  args: { variant: "outline", size: "sm", icon: <SnapshotIcon />, children: "Snapshot" },
};
export const Icon: Story = {
  args: { size: "icon", icon: <PlusIcon />, children: undefined, "aria-label": "Add dashboard" },
};
export const IconSmall: Story = {
  args: { variant: "outline", size: "icon-sm", icon: <MoreIcon />, children: undefined, "aria-label": "More actions" },
};
export const IconLarge: Story = {
  args: { size: "icon-lg", icon: <PlusIcon />, children: undefined, "aria-label": "Add dashboard" },
};
export const Actions: Story = {
  render: (args) => <ActionButtonsExample disabled={args.disabled} />,
};
export const DisabledActions: Story = { ...Actions, args: { disabled: true } };
export const DarkActions: Story = { ...Actions, globals: { theme: "dark" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["default", "outline", "ghost"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <span className="w-20 text-sm capitalize">{variant}</span>
          <Button variant={variant} size="sm">Small</Button>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} size="lg">Large</Button>
          <Button variant={variant} size="icon-sm" icon={<PlusIcon />} aria-label={`Add dashboard (${variant}, small)`} />
          <Button variant={variant} size="icon" icon={<PlusIcon />} aria-label={`Add dashboard (${variant}, default)`} />
          <Button variant={variant} size="icon-lg" icon={<PlusIcon />} aria-label={`Add dashboard (${variant}, large)`} />
          <Button variant={variant} size="sm" icon={<PauseIcon />}>Pause</Button>
          <Button variant={variant} icon={<SnapshotIcon />} disabled>Disabled</Button>
        </div>
      ))}
    </div>
  ),
};
