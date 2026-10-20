import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PresetInput, type PresetInputProps } from "../src/components/ui/preset-input";
import { reportPresets } from "./report-form";

function PresetExample(args: PresetInputProps) {
  const [value, setValue] = useState(args.value);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return <div ref={setContainer} className="max-w-md"><PresetInput {...args} value={value} onValueChange={setValue} container={container} /></div>;
}
const meta = {
  title: "Forms/Preset Input", component: PresetInput, tags: ["autodocs"],
  args: { "aria-label": "Report template", value: "Executive summary", onValueChange: () => {}, presets: reportPresets, presetLabel: "Choose report template" },
  render: (args) => <PresetExample key={args.value} {...args} />,
} satisfies Meta<typeof PresetInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { globals: { theme: "dark" } };
