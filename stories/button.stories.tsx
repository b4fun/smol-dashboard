import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../src/components/ui/button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Open dashboard", variant: "default", size: "default", disabled: false },
  argTypes: {
    children: { control: "text" },
    variant: { control: "select", options: ["default", "outline", "ghost"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Disabled: Story = { args: { disabled: true } };
export const Icon: Story = {
  args: { size: "icon", children: "+", "aria-label": "Add dashboard" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["default", "outline", "ghost"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <span className="w-20 text-sm capitalize">{variant}</span>
          <Button variant={variant} size="sm">Small</Button>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} size="lg">Large</Button>
          <Button variant={variant} size="icon" aria-label={`Add dashboard (${variant})`}>+</Button>
          <Button variant={variant} disabled>Disabled</Button>
        </div>
      ))}
    </div>
  ),
};
