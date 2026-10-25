import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollapsibleList, type CollapsibleListGroup } from "../src/components/collapsible-list";
import { StatusIndicator } from "../src/components/ui/status-indicator";

function Metadata({ image }: { image: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" className="size-3"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2" /></svg>
      <span>{image}</span>
      <span aria-hidden="true">·</span>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" className="size-3"><rect x="4" y="4" width="8" height="8" rx="1" /><path d="M6 1v3m4-3v3M6 12v3m4-3v3M1 6h3m-3 4h3m8-4h3m-3 4h3" /></svg>
      <span>1 core / 2 GiB</span>
    </span>
  );
}

const groups: CollapsibleListGroup[] = [
  {
    id: "running", label: "Running", items: [{
      id: "sandbox-running", title: "sandbox-running", description: "opensandbox / sandbox-running-0",
      leading: <StatusIndicator status="success" />, metadata: <Metadata image="python:3.12-slim" />,
      trailing: <time dateTime="2026-10-20T10:08:00Z">created 4 minutes ago</time>,
    }],
  },
  {
    id: "paused", label: "Paused", items: [{
      id: "sandbox-paused", title: "sandbox-paused", description: "opensandbox / sandbox-paused-0",
      leading: <StatusIndicator status="neutral" />, metadata: <Metadata image="python:3.12-slim" />,
      trailing: <time dateTime="2026-10-20T10:04:00Z">created 8 minutes ago</time>,
    }],
  },
  {
    id: "failed", label: "Failed", items: [{
      id: "sandbox-failed", title: "sandbox-failed", description: "opensandbox / sandbox-failed-0",
      leading: <StatusIndicator status="failed" />, metadata: <Metadata image="ubuntu:24.04" />,
      trailing: <time dateTime="2026-10-20T10:00:00Z">created 12 minutes ago</time>,
    }],
  },
];

const meta = {
  title: "Components/Collapsible List",
  component: CollapsibleList,
  tags: ["autodocs"],
  parameters: { shell: true },
  decorators: [(Story) => <div className="p-2"><Story /></div>],
  args: { groups },
} satisfies Meta<typeof CollapsibleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Collapsed: Story = {
  args: { groups: groups.map((group) => ({ ...group, defaultOpen: false })) },
};
export const LinkedItems: Story = {
  args: { groups: groups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, href: `#${item.id}` })) })) },
};
export const CenteredLeading: Story = {
  args: { leadingAlign: "center" },
};
export const MultipleItems: Story = {
  args: { groups: [{ ...groups[0], items: [groups[0].items[0], {
    id: "sandbox-worker", title: "sandbox-worker", description: "opensandbox / sandbox-worker-0",
    leading: <StatusIndicator status="success" />, metadata: <Metadata image="node:24-slim" />,
    trailing: <time dateTime="2026-10-20T10:10:00Z">created 2 minutes ago</time>,
  }] }, ...groups.slice(1)] },
};
export const EmptyGroup: Story = {
  args: { groups: [{ id: "queued", label: "Queued", items: [] }], emptyMessage: "No sandboxes queued." },
};
export const Minimal: Story = {
  args: { groups: [{ id: "projects", label: "Projects", items: [
    { id: "website", title: "Website refresh" },
    { id: "dashboard", title: "Customer dashboard" },
  ] }] },
};
export const Narrow: Story = {
  decorators: [(Story) => <div className="w-full max-w-xs"><Story /></div>],
  args: { groups: [{ id: "running", label: "Running", items: [{
    id: "long-name", title: "sandbox-customer-experience-launch-readiness-worker",
    description: "opensandbox / production-europe-west-customer-experience-worker-0",
    leading: <StatusIndicator status="success" />, metadata: <Metadata image="registry.example.com/platform/python:3.12-slim" />,
    trailing: <time dateTime="2026-10-20T10:08:00Z">created 4 minutes ago</time>,
  }] }] },
};
