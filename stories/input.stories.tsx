import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../src/components/ui/input";

const meta = {
  title: "Forms/Input", component: Input, tags: ["autodocs"],
  args: { "aria-label": "Report name", placeholder: "Quarterly revenue", disabled: false },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true, defaultValue: "Monthly activity" } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "Executive summary" } };
export const Invalid: Story = { args: { "aria-invalid": true, "aria-label": "Report name, invalid" } };
export const Dark: Story = { globals: { theme: "dark" } };
