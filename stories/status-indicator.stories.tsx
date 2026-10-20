import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusIndicator } from "../src/components/ui/status-indicator";

const meta = {
  title: "Components/Status Indicator",
  component: StatusIndicator,
  tags: ["autodocs"],
  args: { status: "success", size: "default" },
  argTypes: {
    status: { control: "select", options: ["success", "failed", "warning", "neutral"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <StatusIndicator {...args} />
      <span aria-hidden="true" className="capitalize">{args.status}</span>
    </div>
  ),
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Failed: Story = { args: { status: "failed" } };
export const Warning: Story = { args: { status: "warning" } };
export const Neutral: Story = { args: { status: "neutral" } };
export const Dark: Story = { globals: { theme: "dark" } };
export const CustomLabel: Story = { args: { "aria-label": "Deployment successful" } };
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {(["success", "failed", "warning", "neutral"] as const).map((status) => (
        <div key={status} className="flex items-center gap-2 text-sm">
          <StatusIndicator status={status} />
          <span aria-hidden="true" className="capitalize">{status}</span>
        </div>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {(["sm", "default", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2 text-sm">
          <StatusIndicator status="success" size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};
export const Decorative: Story = {
  render: () => (
    <p className="flex items-center gap-2 text-sm">
      <StatusIndicator status="success" aria-hidden="true" />
      Deployment successful
    </p>
  ),
};
