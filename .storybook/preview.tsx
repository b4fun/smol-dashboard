import type { Preview } from "@storybook/react-vite";
import "./styles.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: "Component color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme === "dark" ? "dark" : ""}>
        <div className={context.parameters.shell ? "min-h-64 bg-background text-foreground" : "min-h-64 bg-background p-8 text-foreground"}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
