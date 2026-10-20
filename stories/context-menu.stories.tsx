import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuGroup, ContextMenuLabel, ContextMenuSeparator,
  ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem,
  ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
  type ContextMenuProps,
} from "../src/components/ui/context-menu";

function OpenIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2h5v5 M14 2 7 9 M6 3H3v10h10v-3" /></svg>;
}

function DuplicateIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1" /><path d="M3 11H2V2h9v1" /></svg>;
}

function DeleteIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12 M6 4V2h4v2 M4 4l1 10h6l1-10 M6.5 6v5 M9.5 6v5" /></svg>;
}

type ExampleProps = Omit<ContextMenuProps, "children"> & {
  disabled?: boolean;
  indeterminate?: boolean;
  longLabels?: boolean;
};

function ContextMenuExample({ disabled, indeterminate, longLabels, ...props }: ExampleProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = useState<boolean | "indeterminate">(indeterminate ? "indeterminate" : true);
  const [sort, setSort] = useState("name");
  const [message, setMessage] = useState("No action selected.");
  const groupId = useId();

  return (
    <div ref={setContainer} className="w-full max-w-lg">
      <ContextMenu {...props}>
        <ContextMenuTrigger asChild disabled={disabled}>
          <section aria-label="Project context actions" className="flex min-h-40 w-full flex-col items-center justify-center gap-2 border border-dashed border-foreground/45 bg-accent/40 p-6 text-center">
            <h2 className="font-semibold">Website refresh</h2>
            <p className="text-sm">{disabled ? "Context menu disabled." : "Right-click or press Shift+F10 for project actions."}</p>
          </section>
        </ContextMenuTrigger>
        <ContextMenuContent container={container} aria-label="Project actions">
          <ContextMenuGroup aria-labelledby={groupId}>
            <ContextMenuLabel id={groupId}>Project actions</ContextMenuLabel>
            <ContextMenuItem asChild icon={<OpenIcon />} onSelect={() => setMessage("Opened project.")}>
              <a href="#website-refresh">Open project</a>
            </ContextMenuItem>
            <ContextMenuItem icon={<DuplicateIcon />} textValue="Duplicate project" onSelect={() => setMessage("Duplicate requested.")}>
              {longLabels ? "Duplicate project-with-a-very-long-unbroken-name-and-production-configuration" : "Duplicate project"}
            </ContextMenuItem>
            <ContextMenuItem disabled onSelect={() => setMessage("Archive requested.")}>Archive project</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={showDetails} onCheckedChange={setShowDetails} onSelect={(event) => event.preventDefault()}>
            Show details
          </ContextMenuCheckboxItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Sort by</ContextMenuSubTrigger>
            <ContextMenuSubContent aria-label="Sort projects">
              <ContextMenuLabel>Sort projects</ContextMenuLabel>
              <ContextMenuRadioGroup aria-label="Sort projects" value={sort} onValueChange={(value) => { setSort(value); setMessage(`Sorted by ${value}.`); }}>
                <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
                <ContextMenuRadioItem value="created">Created</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" icon={<DeleteIcon />} onSelect={() => setMessage("Delete requested.")}>Delete project</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setMessage("Next control activated.")}>Next control</Button>
      <p role="status" className="mt-4 text-sm">{message}</p>
    </div>
  );
}

const meta = {
  title: "Components/Context Menu",
  component: ContextMenu,
  tags: ["autodocs"],
  args: { modal: true, dir: "ltr", disabled: false, indeterminate: false, longLabels: false },
  argTypes: { dir: { control: "select", options: ["ltr", "rtl"] } },
  render: (args) => <ContextMenuExample key={String(args.indeterminate)} {...args} />,
} satisfies Meta<ExampleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Disabled: Story = { args: { disabled: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const LongLabels: Story = { args: { longLabels: true } };
export const RightToLeft: Story = { args: { dir: "rtl" } };
export const NonModal: Story = { args: { modal: false } };
export const AtViewportEdge: Story = {
  decorators: [(Story) => <div className="flex min-h-[calc(100dvh-4rem)] items-end justify-end"><Story /></div>],
};
