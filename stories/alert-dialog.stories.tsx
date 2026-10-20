import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, type AlertDialogProps } from "../src/components/ui/alert-dialog";

function DeleteReportExample({ disabled = false, ...props }: AlertDialogProps & { disabled?: boolean }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("The report is available.");
  return (
    <div ref={setContainer}>
      <AlertDialog {...props}>
        <AlertDialogTrigger asChild disabled={disabled}><Button variant="destructive">Delete report</Button></AlertDialogTrigger>
        <AlertDialogContent container={container}>
          <AlertDialogHeader><AlertDialogTitle>Delete this report?</AlertDialogTitle><AlertDialogDescription>Quarterly revenue will be removed from this workspace. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep report</AlertDialogCancel><AlertDialogAction onClick={() => setMessage("Report deleted.")}>Delete report</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="mt-4 text-sm">{message}</p>
    </div>
  );
}
const meta = {
  title: "Feedback/Alert Dialog", component: AlertDialog, tags: ["autodocs"],
  args: { disabled: false }, render: (args) => <DeleteReportExample {...args} />,
} satisfies Meta<AlertDialogProps & { disabled?: boolean }>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { globals: { theme: "dark" } };
