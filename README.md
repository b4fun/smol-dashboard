# @b4fun/smol-dashboard

Minimal React component library and shadcn/ui registry. Requires React 18 or 19 and Tailwind CSS 4.

## Development

```sh
npm install
npm run typecheck
npm run build
```

`npm run build` creates the ESM library and TypeScript declarations in `dist/`, then generates installable registry items in `public/r/`. `npm run dev` watches the library TypeScript sources.

## Use as a library

Install the package from npm after publishing, or install a tarball created with `npm pack`:

```sh
npm install @b4fun/smol-dashboard
```

In your application's main CSS file (adjust the source path relative to that file):

```css
@import "tailwindcss";
@import "@b4fun/smol-dashboard/styles.css";
@source "../node_modules/@b4fun/smol-dashboard/dist";
```

The source directive lets Tailwind discover the package's utility classes. The stylesheet provides neutral light and dark theme tokens; add `.dark` to an ancestor to use the dark theme. Applications with an existing shadcn theme can keep their own tokens and omit the package stylesheet.

```tsx
import { Button } from "@b4fun/smol-dashboard";

export function Example() {
  return <Button variant="outline" onClick={() => console.log("clicked")}>Open dashboard</Button>;
}
```

Exports: `Button`, `ButtonProps`, `buttonVariants`, and `cn`. Button supports `default`, `outline`, and `ghost` variants and `default`, `sm`, `lg`, and `icon` sizes. It forwards its ref and defaults to `type="button"`; use `type="submit"` for form submission.

## Use as a shadcn registry

Build, then serve the `public/` directory with any static HTTP server. For example:

```sh
npm run build:registry
npx serve public -l 3000
```

In a consuming app already initialized with shadcn/ui:

```sh
npx shadcn@latest add http://localhost:3000/r/button.json
```

The CLI copies the component into the consuming app, installs its dependencies, and uses the app's shadcn theme and `utils` helper. For remote installs, deploy `public/` to a static host and replace the localhost URL. No registry is hosted by this scaffold.

To add a component, create it in `src/components/ui/`, export it from `src/index.ts`, add an item to `registry.json`, and rebuild. Use `@/lib/utils` in registry components so shadcn can rewrite imports for the consuming app.

## Component explorer

Run `npm run storybook` and open http://localhost:6006 to explore the components. The Button stories include an interactive playground, individual variants, a disabled state, an accessible icon button, and a grid of all variants and sizes. Use the Theme toolbar to switch between light and dark, and the Controls panel to edit props. The Docs page includes generated prop documentation and usage examples.

Run `npm run build-storybook` to produce a deployable static explorer in `storybook-static/`.

Add future examples as `stories/<component>.stories.tsx`; they are discovered automatically. Storybook uses source components and the same Tailwind theme as the library.

## App shell

`AppShell` provides a responsive dashboard layout inspired by [shadcn dashboard-01](https://ui.shadcn.com/view/new-york-v4/dashboard-01). Pass grouped navigation, a title, and your page content. Optional slots accept header actions and a sidebar footer. Navigation uses ordinary links, so it does not require a router; set `active` on the current item. Icons are optional decorative React nodes.

```tsx
import { AppShell } from "@b4fun/smol-dashboard";

<AppShell
  brand="My workspace"
  title="Overview"
  navigation={[{
    label: "Workspace",
    items: [{ label: "Overview", href: "/", active: true }],
  }]}
>
  <p>Your application content</p>
</AppShell>
```

The shell fills the dynamic viewport height (`100dvh`), with independently scrollable content and navigation so the header and sidebar footer stay visible. Use `className="h-full"` inside a parent with a defined height.

The desktop toggle sits at the right of the brand row and collapses the sidebar to a 56px navigation rail. Supply an `icon` for each item; items without icons display their first letter. Full accessible names remain available when collapsed. Mobile navigation starts closed and expands inline. The shell includes a skip link, navigation landmark, current-page semantics, and named keyboard-operable toggles. Mount one shell per page and use level-two headings in its content.

Registry install after pushing the changes:

```sh
npx shadcn@latest add b4fun/smol-dashboard/app-shell
```

Explore **Layout / App Shell** in Storybook. Run `npx playwright install chromium` once, then `npm run test:a11y` for keyboard, responsive layout, and axe accessibility checks. The test runner starts Storybook automatically.
