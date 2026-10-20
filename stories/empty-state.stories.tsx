import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "../src/components/empty-state";
import { Alert } from "../src/components/ui/alert";
import { Button } from "../src/components/ui/button";

function CreateReportExample() {
  const [created, setCreated] = useState(false);
  return created ? <Alert variant="success" title="Report draft created">Your new report is ready to edit.</Alert> : <EmptyState title="No reports yet" description="Create a report to share progress with your team." actions={<Button onClick={() => setCreated(true)}>Create report</Button>} />;
}
const meta = {
  title: "Feedback/Empty State", component: EmptyState, tags: ["autodocs"],
  args: { title: "No reports yet", description: "Create a report to share progress with your team.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h6" /></svg> },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const WithAction: Story = { render: () => <CreateReportExample /> };
export const Filtered: Story = { args: { title: "No reports match these filters", description: "Choose another status to see more reports." } };
export const Dark: Story = { globals: { theme: "dark" } };
