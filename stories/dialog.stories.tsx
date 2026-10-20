import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, type DialogProps, type DialogContentProps } from "../src/components/ui/dialog";
import { ReportForm } from "./report-form";

type ExampleProps = Omit<DialogProps, "children" | "open" | "defaultOpen" | "onOpenChange"> & {
  size?: DialogContentProps["size"];
  disabled?: boolean;
  longContent?: boolean;
};
function ReportDialog({ size, disabled, longContent, ...props }: ExampleProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("No report created.");
  return (
    <div ref={setContainer}>
      <Dialog {...props} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild disabled={disabled}><Button>Create report</Button></DialogTrigger>
        <DialogContent ref={setContent} container={container} size={size}>
          <DialogHeader><DialogTitle>Create a report</DialogTitle><DialogDescription>Turn workspace activity into a shareable document.</DialogDescription></DialogHeader>
          <ReportForm container={content} longContent={longContent} onCreate={(values) => { setMessage(`Created "${values.name}" from "${values.template}" as ${values.format.toUpperCase()}.`); setOpen(false); }}
            footer={<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>} />
        </DialogContent>
      </Dialog>
      <p role="status" className="mt-4 text-sm">{message}</p>
    </div>
  );
}
const meta = {
  title: "Feedback/Dialog", component: Dialog, tags: ["autodocs"],
  args: { size: "default", disabled: false, longContent: false, modal: true },
  argTypes: { size: { control: "select", options: ["sm", "default", "lg"] } },
  render: (args) => <ReportDialog {...args} />,
} satisfies Meta<ExampleProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const LongContent: Story = { args: { size: "lg", longContent: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { globals: { theme: "dark" } };
