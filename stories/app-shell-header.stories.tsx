import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShellHeader } from "../src/components/app-shell-header";
import { Button } from "../src/components/ui/button";

const meta = {
  title: "Layout/App Shell Header",
  component: AppShellHeader,
  tags: ["autodocs"],
  args: {
    title: "Website refresh — Review the launch checklist",
    breadcrumbs: [{ label: "Website refresh", href: "#workspace", icon: <span>📁</span> }],
  },
} satisfies Meta<typeof AppShellHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const MultipleLevels: Story = {
  args: { title: "Launch checklist", actions: <Button variant="outline">Share</Button>, breadcrumbs: [
    { label: "Workspace", href: "#workspace" },
    { label: "Projects", href: "#projects" },
    { label: "Website refresh", href: "#website-refresh" },
  ] },
};
export const TitleOnly: Story = { args: { title: "Overview", breadcrumbs: [] } };
export const WithActions: Story = {
  args: { actions: <Button variant="outline" onClick={() => window.alert("Your application handles sharing.")}>Share</Button> },
};
export const Dark: Story = { globals: { theme: "dark" } };

export const Overflow: Story = {
  parameters: {
    docs: {
      description: {
        story: "A narrow header with a deep path and long labels. Hover or focus the breadcrumb to reveal the middle levels, then scroll horizontally. The Share button stays on the right.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl rounded-xl border border-border bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Review the complete launch readiness checklist and stakeholder approvals",
    breadcrumbs: [
      { label: "Design workspace", href: "#design-workspace" },
      { label: "Customer experience", href: "#customer-experience" },
      { label: "Website refresh", href: "#website-refresh" },
      { label: "Release planning", href: "#release-planning" },
      { label: "Launch readiness", href: "#launch-readiness" },
    ],
    actions: <Button variant="outline" onClick={() => window.alert("Your application handles sharing.")}>Share</Button>,
  },
};
