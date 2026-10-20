import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "../src/components/ui/skeleton";

const meta = {
  title: "Feedback/Skeleton", component: Skeleton, tags: ["autodocs"],
  args: { className: "h-4 w-48" },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const ReportList: Story = {
  render: () => <div className="max-w-lg space-y-5"><p role="status" className="text-sm">Loading reports…</p>
    {[0, 1, 2].map((row) => <div key={row} className="flex items-center gap-3"><Skeleton className="size-9 shrink-0" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>)}
  </div>,
};
export const Dark: Story = { ...ReportList, globals: { theme: "dark" } };
