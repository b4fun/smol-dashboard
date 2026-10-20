import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OperationResult, type OperationResultProps } from "../src/components/operation-result";
import { Button, buttonVariants } from "../src/components/ui/button";

function ExportExample() {
  const [status, setStatus] = useState<OperationResultProps["status"]>("pending");
  const content = {
    pending: { title: "Preparing report export", description: "We are gathering the latest figures for your team." },
    success: { title: "Report ready to download", description: "Your quarterly revenue report has been prepared." },
    failed: { title: "Report export failed", description: "The data source is temporarily unavailable. Try again." },
  };
  return <OperationResult status={status} {...content[status]} actions={status === "pending" ? <>
    <Button variant="outline" onClick={() => setStatus("failed")}>Simulate failure</Button><Button onClick={() => setStatus("success")}>Check progress</Button>
  </> : status === "success" ? <>
    <Button variant="outline" onClick={() => setStatus("pending")}>Prepare another report</Button>
    <a className={buttonVariants()} href="data:text/csv,Period%2CRevenue%0AQ1%2C124000" download="quarterly-revenue.csv">Download report</a>
  </> : <Button onClick={() => setStatus("pending")}>Try again</Button>}>
    <p className="text-sm"><span className="text-foreground/70">File:</span> <code>quarterly-revenue.csv</code></p>
  </OperationResult>;
}
const meta = {
  title: "Feedback/Operation Result", component: OperationResult, tags: ["autodocs"],
  args: { status: "pending", title: "Preparing report export", description: "We are gathering the latest figures for your team." },
  argTypes: { status: { control: "select", options: ["pending", "success", "failed"] } },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
} satisfies Meta<typeof OperationResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Success: Story = { args: { status: "success", title: "Report ready to download", description: "Your quarterly revenue report has been prepared." } };
export const Failed: Story = { args: { status: "failed", title: "Report export failed", description: "The data source is temporarily unavailable." } };
export const Interactive: Story = { render: () => <ExportExample /> };
export const Dark: Story = { ...Interactive, globals: { theme: "dark" } };
