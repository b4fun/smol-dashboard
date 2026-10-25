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

const statusIcon = (path: string) => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d={path} /></svg>;
export const WithIcons: Story = {
  args: {
    options: [
      { ...options[0], icon: statusIcon("M2 4h12M2 8h12M2 12h12") },
      { ...options[1], icon: statusIcon("M3 13l1-3 7-7 2 2-7 7-3 1z") },
      { ...options[2], icon: statusIcon("M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 3v3l2 2") },
      { ...options[3], icon: statusIcon("m3 8 3 3 7-7") },
      { ...options[4], icon: statusIcon("M2 4h12v2H2zM3 6v7h10V6M6 9h4") },
    ],
  },
};
