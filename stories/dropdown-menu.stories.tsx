import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  type DropdownMenuProps,
} from "../src/components/ui/dropdown-menu";

function MoreIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3.5" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="8" cy="12.5" r="1" /></svg>;
}

function PauseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="3" width="2.5" height="10" rx="0.5" /><rect x="9.5" y="3" width="2.5" height="10" rx="0.5" /></svg>;
}

function SnapshotIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2h-5 M14 2v6h6" /><circle cx="6" cy="16" r="5" /><path d="M6 13v3l2 1" /></svg>;
}

function OpenIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2h5v5 M14 2 7 9 M6 3H3v10h10v-3" /></svg>;
}

type ExampleProps = Omit<DropdownMenuProps, "children"> & {
  disabled?: boolean;
  textTrigger?: boolean;
  indeterminate?: boolean;
};

function DropdownMenuExample({ disabled, textTrigger, indeterminate, ...props }: ExampleProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = useState<boolean | "indeterminate">(indeterminate ? "indeterminate" : true);
  const [sort, setSort] = useState("name");
  const [message, setMessage] = useState("No action selected.");
  const groupId = useId();

  return (
    <div ref={setContainer} className="w-full max-w-lg">
      <div role="group" aria-label="Sandbox actions" className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" icon={<PauseIcon />} onClick={() => setMessage("Pause requested.")}>Pause</Button>
        <Button variant="outline" size="sm" icon={<SnapshotIcon />} onClick={() => setMessage("Snapshot requested.")}>Snapshot</Button>
        <DropdownMenu {...props}>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button variant="outline" size={textTrigger ? "sm" : "icon-sm"} icon={textTrigger ? undefined : <MoreIcon />} aria-label={textTrigger ? undefined : "More actions"}>
              {textTrigger ? "Actions" : undefined}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent container={container}>
            <DropdownMenuGroup aria-labelledby={groupId}>
              <DropdownMenuLabel id={groupId}>Sandbox actions</DropdownMenuLabel>
              <DropdownMenuItem asChild icon={<OpenIcon />} onSelect={() => setMessage("Opened sandbox.")}>
                <a href="#sandbox-running">Open sandbox</a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMessage("Duplicate requested.")}>Duplicate sandbox</DropdownMenuItem>
              <DropdownMenuItem disabled onSelect={() => setMessage("Archive requested.")}>Archive sandbox</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showDetails} onCheckedChange={setShowDetails} onSelect={(event) => event.preventDefault()}>
              Show details
            </DropdownMenuCheckboxItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Sort by</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Sort sandboxes</DropdownMenuLabel>
                <DropdownMenuRadioGroup aria-label="Sort sandboxes" value={sort} onValueChange={(value) => { setSort(value); setMessage(`Sorted by ${value}.`); }}>
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setMessage("Delete requested.")}>Delete sandbox</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setMessage("Next control activated.")}>Next control</Button>
      <p role="status" className="mt-4 text-sm">{message}</p>
    </div>
  );
}

const meta = {
  title: "Components/Dropdown Menu",
  component: DropdownMenu,
  tags: ["autodocs"],
  args: { modal: true, dir: "ltr", disabled: false, textTrigger: false, indeterminate: false },
  argTypes: { dir: { control: "select", options: ["ltr", "rtl"] }, open: { control: false }, defaultOpen: { control: false } },
  render: (args) => <DropdownMenuExample key={String(args.indeterminate)} {...args} />,
} satisfies Meta<ExampleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Disabled: Story = { args: { disabled: true } };
export const TextTrigger: Story = { args: { textTrigger: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const RightToLeft: Story = { args: { dir: "rtl" } };
export const AtViewportEdge: Story = {
  decorators: [(Story) => <div className="flex min-h-[calc(100dvh-4rem)] items-end justify-end"><Story /></div>],
};
