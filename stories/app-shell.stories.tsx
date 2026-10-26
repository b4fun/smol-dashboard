import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "../src/components/app-shell";
import { Button } from "../src/components/ui/button";

const meta = {
  title: "Layout/App Shell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { shell: true },
  decorators: [
    (Story) => (
      <div className="layout-annotations flex h-dvh flex-col">
        <div className="shrink-0 border-b border-border bg-background px-4 py-3 text-foreground">
          <p className="mb-2 text-sm font-semibold">Layout reference</p>
          <ol className="flex list-inside list-decimal flex-wrap gap-x-6 gap-y-1 text-xs" aria-label="Layout region numbers">
            <li>Sidebar</li><li>Brand</li><li>Navigation</li>
            <li>Sidebar footer</li><li>Header</li><li>Content</li>
          </ol>
          <p className="mt-2 text-xs">On mobile, open navigation to see regions 1–4. Optional regions appear when provided.</p>
        </div>
        <div className="min-h-0 flex-1"><Story /></div>
      </div>
    ),
  ],
  args: {
    className: "h-full",
    brand: "◈ smol dashboard",
    brandHref: "#home",
    title: "Overview",
    navigation: [
      { label: "Workspace", items: [
        { label: "Overview", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" /></svg>, href: "#overview", active: true },
        { label: "Projects", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M3 7h7l2-3h9v16H3z" /></svg>, href: "#projects" },
        { label: "Analytics", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M4 20V10 M10 20V4 M16 20v-7 M22 20H2" /></svg>, href: "#analytics" },
        { label: "Team", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0" /></svg>, href: "#team" },
      ] },
      { label: "Resources", items: [
        { label: "Documents", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h8" /></svg>, href: "#documents" },
        { label: "Reports", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M5 3h14v18H5z M8 16v-4 M12 16V8 M16 16v-6" /></svg>, href: "#reports" },
        { label: "Settings", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0" /></svg>, href: "#settings" },
      ] },
    ],
    sidebarFooter: <div className="flex items-center gap-3 px-2 text-sm"><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-border bg-background font-medium">JD</span><div><p className="font-medium">Jamie Doe</p><p className="text-xs">jamie@example.com</p></div></div>,
    headerActions: <Button variant="outline" onClick={() => window.alert("Your application handles this action.")}>New project</Button>,
    children: (
      <div className="space-y-6">
        <div><h2 className="text-2xl font-semibold tracking-tight">Workspace overview</h2><p className="mt-1 text-sm">A little space for your next big idea.</p></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[{ label: "Projects", value: "12" }, { label: "Team members", value: "8" }, { label: "Tasks completed", value: "128" }].map(({label,value}) => (
            <section key={label} className="rounded-xl border border-border p-5"><h3 className="text-sm font-medium">{label}</h3><p className="mt-3 text-3xl font-semibold">{value}</p></section>
          ))}
        </div>
        <section className="rounded-xl border border-border p-6"><h2 className="font-semibold">Make it yours</h2><p className="mt-2 text-sm">Add your charts, tables, and project content here.</p></section>
      </div>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Minimal: Story = {
  args: { navigation: [{ label: "Workspace", items: [{ label: "Overview", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" /></svg>, href: "#overview", active: true }] }], sidebarFooter: null, headerActions: null, children: <p>Your application content goes here.</p> },
};
export const Dark: Story = { globals: { theme: "dark" } };

const brandIcon = (
  <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">◈</span>
);

export const WithBrandIcon: Story = {
  args: {
    brand: <span className="flex items-center gap-2">{brandIcon}smol dashboard</span>,
    brandIcon,
    defaultSidebarOpen: false,
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Website refresh — Review the launch checklist",
    breadcrumbs: [
      { label: "Workspace", href: "#workspace" },
      { label: "Website refresh", href: "#website-refresh", icon: <span>📁</span> },
    ],
  },
};
