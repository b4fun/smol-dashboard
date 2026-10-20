import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "../src/components/ui/field";
import { Input } from "../src/components/ui/input";
import { Select } from "../src/components/ui/select";
import { PresetInput } from "../src/components/ui/preset-input";
import { ReportForm, reportPresets } from "./report-form";

function PresetExample({ disabled, readOnly }: { disabled?: boolean; readOnly?: boolean }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState("Executive summary");
  return <div ref={setContainer} className="max-w-md"><Field label="Report template" disabled={disabled} description={readOnly ? "Select a preset to change the template." : "Choose a preset or type a custom name."}>
    {(props) => <PresetInput {...props} readOnly={readOnly} value={value} onValueChange={setValue} presets={reportPresets} presetLabel="Choose report template" container={container} />}
  </Field></div>;
}
function SubmissionExample() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("No report created.");
  return <div ref={setContainer} className="max-w-md"><ReportForm container={container} onCreate={(values) => setMessage(`Created "${values.name}" from "${values.template}" as ${values.format.toUpperCase()}.`)} /><p role="status" className="mt-4 text-sm">{message}</p></div>;
}
const meta = {
  title: "Forms/Field", component: Field, tags: ["autodocs"],
  args: { label: "Report name", description: "Visible to everyone in your workspace.", required: true, disabled: false, children: (props) => <Input {...props} placeholder="Quarterly revenue" /> },
  argTypes: { children: { control: false }, label: { control: "text" } },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Error: Story = { args: { error: "Enter a report name." } };
export const Disabled: Story = { args: { disabled: true } };
export const Selection: Story = { args: { label: "File format", description: "Choose a format for the exported report.", children: (props) => <Select {...props} defaultValue="pdf"><option value="pdf">PDF document</option><option value="csv">CSV spreadsheet</option></Select> } };
export const Presets: Story = { render: (args) => <PresetExample disabled={args.disabled} /> };
export const ReadOnlyPreset: Story = { render: () => <PresetExample readOnly /> };
export const DisabledPreset: Story = { render: () => <PresetExample disabled /> };
export const Submission: Story = { render: () => <SubmissionExample /> };
export const Dark: Story = { globals: { theme: "dark" } };
