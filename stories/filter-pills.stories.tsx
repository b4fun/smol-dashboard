import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterPills, type FilterPillsProps } from "../src/components/filter-pills";

const reports = [
  { name: "Quarterly revenue", state: "draft" }, { name: "Customer retention", state: "published" },
  { name: "Project health", state: "review" }, { name: "Engineering capacity", state: "draft" },
  { name: "Activation trends", state: "published" }, { name: "Partner insights", state: "review" },
];
const options = [
  { value: "all", label: "All", count: 6 }, { value: "draft", label: "Draft", count: 2 },
  { value: "review", label: "In review", count: 2 }, { value: "published", label: "Published", count: 2 },
  { value: "archived", label: "Archived", count: 0, disabled: true },
];
function ReportFilters(args: FilterPillsProps) {
  const [value, setValue] = useState(args.value);
  const visible = reports.filter((report) => value === "all" || value === report.state);
  return <div className="space-y-5"><FilterPills {...args} value={value} onValueChange={setValue} />
    <p role="status" className="text-sm text-foreground/70">Showing {visible.length} reports.</p>
    <ul aria-label="Reports" className="max-w-lg divide-y divide-border">{visible.map((report) => <li key={report.name} className="py-3 text-sm">{report.name}</li>)}</ul>
  </div>;
}
const meta = {
  title: "Components/Filter Pills", component: FilterPills, tags: ["autodocs"],
  args: { label: "Filter reports by status", options, value: "all", onValueChange: () => {} },
  render: (args) => <ReportFilters key={args.value} {...args} />,
} satisfies Meta<typeof FilterPills>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const WithoutCounts: Story = { args: { options: options.map(({ count, ...option }) => option) } };
export const Disabled: Story = { args: { options: options.map((option) => ({ ...option, disabled: true })) } };
export const Dark: Story = { globals: { theme: "dark" } };
