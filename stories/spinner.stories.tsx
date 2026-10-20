import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "../src/components/ui/spinner";

const meta = {
  title: "Feedback/Spinner", component: Spinner, tags: ["autodocs"],
  args: { label: "Syncing team members", className: "size-5" },
  render: (args) => <div className="flex items-center gap-2 text-sm"><Spinner {...args} /><span aria-hidden="true">{args.label}</span></div>,
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Sizes: Story = {
  render: () => <div className="flex flex-wrap items-center gap-6">{["size-3", "size-4", "size-5", "size-6"].map((size) => <Spinner key={size} className={size} label="Preparing report" />)}</div>,
};
export const Dark: Story = { globals: { theme: "dark" } };
