# smol-dashboard

A shadcn/ui registry of dashboard components. Add individual items to an
application initialized with [shadcn/ui](https://ui.shadcn.com/).

Explore the components in [Storybook](https://b4fun.github.io/smol-dashboard/).

## Install an item

For example, to add the Button:

```sh
npx shadcn@latest add b4fun/smol-dashboard/button
```

Available items:

`alert`, `alert-dialog`, `app-shell`, `app-shell-header`, `button`, `chat`,
`collapsible-list`, `context-menu`, `dialog`, `dropdown-menu`, `empty-state`,
`field`, `filter-pills`, `input`, `operation-result`, `preset-input`,
`select`, `skeleton`, `spinner`, and `status-indicator`.

The CLI copies the component and its registry dependencies into your
application, installs required packages, and adapts imports to your shadcn
theme and `utils` helper.

## Use a self-hosted registry

Build the registry and serve the generated `public/` directory from any static
HTTP server:

```sh
npm run build:registry
npx serve public -l 3000
```

Then install an item using its registry URL:

```sh
npx shadcn@latest add http://localhost:3000/r/button.json
```

Deploy `public/` to a static host and replace the local URL to use the registry
remotely.

For development, package usage, and component examples, see [dev.md](dev.md).
