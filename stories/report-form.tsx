import { useRef, useState, type ReactNode } from "react";
import { Button } from "../src/components/ui/button";
import { Field } from "../src/components/ui/field";
import { Input } from "../src/components/ui/input";
import { Select } from "../src/components/ui/select";
import { PresetInput, type InputPreset } from "../src/components/ui/preset-input";

export const reportPresets: InputPreset[] = [
  { value: "Executive summary", label: "Executive summary", description: "A concise overview for leadership." },
  { value: "Project health", label: "Project health", description: "Milestones, risks, and delivery progress." },
  { value: "Customer activity", label: "Customer activity", description: "Usage and engagement trends." },
  { value: "Audit pack", label: "Audit pack", description: "Requires an enterprise workspace.", disabled: true },
];

export interface ReportValues { name: string; template: string; format: string }

export function ReportForm({ container, onCreate, footer, longContent = false }: {
  container?: HTMLElement | null;
  onCreate: (values: ReportValues) => void;
  footer?: ReactNode;
  longContent?: boolean;
}) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("Executive summary");
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  return (
    <form noValidate className="space-y-5" onSubmit={(event) => {
      event.preventDefault();
      if (!name.trim()) { setError("Enter a report name."); requestAnimationFrame(() => input.current?.focus()); return; }
      setError(undefined);
      const data = new FormData(event.currentTarget);
      onCreate({ name: name.trim(), template, format: String(data.get("format")) });
    }}>
      <Field label="Report name" description="Visible to everyone in your workspace." required error={error}>
        {(props) => <Input {...props} ref={input} name="name" value={name} onChange={(event) => { setName(event.target.value); if (error) setError(undefined); }} placeholder="Quarterly revenue" />}
      </Field>
      <Field label="Template" description="Choose a preset or enter your own template name.">
        {(props) => <PresetInput {...props} name="template" value={template} onValueChange={setTemplate} presets={reportPresets} presetLabel="Choose report template" container={container} />}
      </Field>
      <Field label="File format">
        {(props) => <Select {...props} name="format" defaultValue="pdf"><option value="pdf">PDF document</option><option value="csv">CSV spreadsheet</option><option value="html">HTML page</option></Select>}
      </Field>
      {longContent && <section aria-label="Report delivery guidance" className="space-y-3 text-sm text-foreground/70">
        {Array.from({ length: 12 }, (_, index) => <p key={index}>Delivery note {index + 1}: Reports include the latest available figures and respect each recipient’s workspace permissions.</p>)}
      </section>}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">{footer}<Button type="submit">Create report</Button></div>
    </form>
  );
}
