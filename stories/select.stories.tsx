import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "../src/components/ui/select";

const meta = {
  title: "Forms/Select", component: Select, tags: ["autodocs"],
  args: { "aria-label": "File format", defaultValue: "pdf", children: <><option value="pdf">PDF document</option><option value="csv">CSV spreadsheet</option><option value="html" disabled>HTML page (not available)</option></> },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { globals: { theme: "dark" } };
