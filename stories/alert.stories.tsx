import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "../src/components/ui/alert";

const meta = {
  title: "Feedback/Alert", component: Alert, tags: ["autodocs"],
  args: { title: "Workspace sharing", children: "Reports are visible to members of your workspace.", variant: "info" },
  argTypes: { variant: { control: "select", options: ["info", "success", "warning", "failed"] } },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Success: Story = { args: { variant: "success", title: "Invitation sent", children: "Morgan can now join your workspace." } };
export const Warning: Story = { args: { variant: "warning", title: "Delivery delayed", children: "Your scheduled report will arrive after the data refresh completes." } };
export const Failed: Story = { args: { variant: "failed", title: "Unable to load reports", children: "Check your connection and try again." } };
export const AllVariants: Story = {
  render: () => <div className="space-y-4">
    <Alert title="Workspace sharing">Reports are visible to workspace members.</Alert>
    <Alert variant="success" title="Invitation sent">Morgan can now join your workspace.</Alert>
    <Alert variant="warning" title="Delivery delayed">We are waiting for the latest figures.</Alert>
    <Alert variant="failed" title="Unable to load reports">Check your connection and try again.</Alert>
  </div>,
};
export const Dark: Story = { ...AllVariants, globals: { theme: "dark" } };
