# Development guide

Install Node.js 24 LTS (includes npm), then restore the locked dependencies:

```sh
npm ci
```

If Node.js was just installed, reopen your terminal so `node` and `npm` are on
`PATH`.

Check the project and generate its build outputs:

```sh
npm run typecheck
npm run build
npm run build-storybook
npm run test:registry
```

`npm run build` creates the ESM library and TypeScript declarations in `dist/`,
then generates installable registry items in `public/r/`. `npm run dev` watches
the library TypeScript sources.

For interactive component development, run `npm run storybook` and open
http://localhost:6006. No backend service or environment variables are required.

Install the test browser once, then run the accessibility and interaction
suite:

```sh
npx playwright install chromium
npm run test:a11y
```

The test runner starts Storybook automatically, or reuses an existing server on
port 6006 when not running in CI.

`npm run test:registry` builds the registry, serves its generated items locally,
and verifies that each advertised item is available with populated file
content.

## Use as a library

Install the package from npm after publishing, or install a tarball created
with `npm pack`:

```sh
npm install @b4fun/smol-dashboard
```

In your application's main CSS file (adjust the source path relative to that
file):

```css
@import "tailwindcss";
@import "@b4fun/smol-dashboard/styles.css";
@source "../node_modules/@b4fun/smol-dashboard/dist";
```

The source directive lets Tailwind discover the package's utility classes. The
stylesheet provides neutral light and dark theme tokens and a cross-platform
system font stack based on [GitHub Primer](https://github.com/primer/css/blob/main/src/support/variables/typography.scss);
it uses the native UI font where available and requires no downloaded font. Add
`.dark` to an ancestor to use the dark theme. Override `--fontStack-sansSerif`
to choose a different font. Applications with an existing shadcn theme can
keep their own tokens and omit the package stylesheet.

```tsx
import { Button } from "@b4fun/smol-dashboard";

export function Example() {
  return <Button variant="outline" onClick={() => console.log("clicked")}>Open dashboard</Button>;
}
```

Exports: `Button`, `ButtonProps`, `buttonVariants`, and `cn`. Button supports
`default`, `outline`, and `ghost` variants and `default`, `sm`, `lg`, and `icon`
sizes. It forwards its ref and defaults to `type="button"`; use `type="submit"`
for form submission.

## Component explorer

Browse the hosted [Storybook](https://b4fun.github.io/smol-dashboard/).

Run `npm run storybook` and open http://localhost:6006 to explore the
components. The Button stories include an interactive playground, individual
variants, a disabled state, an accessible icon button, and a grid of all
variants and sizes. Use the Theme toolbar to switch between light and dark, and
the Controls panel to edit props. The Docs page includes generated prop
documentation and usage examples.

Run `npm run build-storybook` to produce a deployable static explorer in
`storybook-static/`.

The `Deploy Storybook to GitHub Pages` workflow publishes this directory on
pushes to `main` and can also be run manually from the Actions tab. For initial
setup, a repository administrator must select **GitHub Actions** under
**Settings > Pages > Build and deployment > Source**. The site becomes available
after the first successful deployment. This publishes the component explorer,
not the registry's `public/r/` output.

Add future examples as `stories/<component>.stories.tsx`; they are discovered
automatically. Storybook uses source components and the same Tailwind theme as
the library.

The **Components / Chat** stories include **Multiline Draft**, **Long Draft**,
and **Long Conversation** for inspecting wrapping and scrolling. Drafts grow
up to 144px before scrolling inside the composer; long conversations scroll
independently while the composer stays visible. Use `defaultDraft` to prefill
an editable draft.

Set Chat's `title` to change its heading and pass `headerActions` to place
buttons, selectors, or other widgets on the right. The **Header Actions** story
demonstrates a keyboard-accessible model dropdown using the existing
`DropdownMenu` component. Its selection is local demo state, not a backend model
configuration. When installing from the registry, also install `dropdown-menu`
if you use this example.

The composer uses a full-width text area above a bottom toolbar with an
icon-only Send button. Pass `composerActions` to add controls on the left;
the **Composer Actions** story demonstrates multiple buttons, toggle states,
and a disabled voice-input button. Give every icon-only action an accessible name.
The `footer` prop accepts custom React content below the composer. Omit it for
the default keyboard hint and disclaimer, or pass `footer={null}` to remove it
and its spacing. See **Custom Footer** and **Without Footer**.

Messages accept optional `userName`, `model`, and `timestamp` strings. Format
`timestamp` for the user's locale before passing it in. Metadata appears below
the message on hover or keyboard focus, stays visible on non-hover devices,
and remains available to screen readers. Space is reserved to avoid layout
shifts when it appears. See **Message Info** for messages with and without metadata.

For tool activity, add a message with `role: "tool"`, `toolName`, `content`,
and `status: "running" | "completed" | "error"`. Update the same message ID as
work progresses; remove it from `messages` if the activity should be temporary.
Consecutive tool messages automatically form a collapsed, keyboard-expandable
group. The summary shows counts and states even while collapsed; errors remain
available in the details. Assistant or user messages separate groups. Running
tools replace the generic thinking indicator with a polite progress status.
Continue setting `isLoading` during an assistant turn to disable submission.
The **Tool Use** story simulates completion without losing the group's expanded
state; **Separate Tool Groups** demonstrates grouping boundaries.
The conversation reserves a stable scrollbar gutter, so expanding tool details
does not shift message widths or the surrounding controls.

For streamed replies, update the last assistant message's `content` as chunks
arrive and set `isStreaming`. Provide `onStop` to turn Send into a **Stop
response** button; your app owns cancellation (for example, aborting its
request). Without `onStop`, sending is disabled while streaming. The
conversation follows new content while the user is at the bottom. If they
scroll up, it stays put and shows a floating down-arrow button (“Jump to latest”); sending a message resumes
following. Set `responseError` to announce a failed reply, with `onRetry` for a
**Retry** button. Set `error` on a message and pass `onRetryMessage` to offer
**Retry** below it. Errors use red text with an icon, and each Retry button has a
distinct accessible name (“Retry response” or “Retry message”). Set
`isRetrying` (response) or `retrying: true` (message) while a retry is in
flight: the link shows a spinner and “Retrying…”, keeps keyboard focus,
ignores repeat activation, and announces the change. The spinner stops when
reduced motion is preferred. The draft is never cleared by these states.
**Streaming** and **Error And Retry** simulate these flows in Storybook.

When a conversation overflows and has at least two user prompts, a message
rail appears at the right edge (on screens 640px and wider). Each dash is one
prompt; the current one is longer and brighter. Click a dash, or focus the rail
with Tab and use Arrow Up/Down, Home, and End, to scroll to a prompt. Dashes
sit in compact 8px rows; hovering or focusing one magnifies it to a 24px target
and slightly enlarges its neighbors. Touch devices keep 24px rows. Hover or
focus also shows a preview of the prompt and its `timestamp`, which Escape
dismisses. The rail scrolls itself when there are more prompts than fit. See
**Message Navigation**.
Assistant content is rendered as plain text; Markdown rendering is not yet supported.

## App shell

`AppShell` provides a responsive dashboard layout inspired by
[shadcn dashboard-01](https://ui.shadcn.com/view/new-york-v4/dashboard-01).
Pass grouped navigation, a title, and your page content. Optional slots accept
header actions and a sidebar footer. Navigation uses ordinary links, so it
does not require a router; set `active` on the current item. Icons are optional
decorative React nodes.

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

The shell fills the dynamic viewport height (`100dvh`), with independently
scrollable content and navigation so the header and sidebar footer stay
visible. Use `className="h-full"` inside a parent with a defined height.

The desktop toggle sits at the right of the brand row and collapses the sidebar
to a 56px navigation rail. Supply an `icon` for each item; items without icons
display their first letter. Full accessible names remain available when
collapsed. Mobile navigation starts closed and expands inline. The shell
includes a skip link, navigation landmark, current-page semantics, and named
keyboard-operable toggles. Mount one shell per page and use level-two headings
in its content.

## Breadcrumb header

Region 5 uses the reusable `AppShellHeader`. Set `breadcrumbs` on `AppShell` to
show linked ancestor levels before the current page `title`:

```tsx
<AppShell
  brand="My App"
  title="Launch checklist"
  navigation={navigation}
  breadcrumbs={[
    { label: "Workspace", href: "/" },
    { label: "Website refresh", href: "/projects/website-refresh" },
  ]}
  headerActions={<Button>Share</Button>}
>
  <YourPage />
</AppShell>
```

Breadcrumbs contain ancestors only; the title supplies the final, non-linked
current page and level-one heading. Ancestors support an optional decorative
`icon`. Intermediate levels collapse behind an ellipsis and expand when
hovering over the ellipsis or activating it by keyboard or tap. Escape
collapses them. Breadcrumbs scroll horizontally when they overflow; action
buttons stay on the right. Routing remains the consuming app's responsibility.

You can also import `AppShellHeader` directly, with `title`, `breadcrumbs`,
`leading`, and `actions` props, or copy it separately through the registry:

```sh
npx shadcn@latest add b4fun/smol-dashboard/app-shell-header
```

Storybook includes **Layout / App Shell Header** and
**Layout / App Shell / With Breadcrumbs**.
