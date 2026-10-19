# Component accessibility requirements

These instructions apply throughout this repository, including library components,
registry items, and Storybook examples. Treat accessibility as an acceptance
criterion for every UI change. Target WCAG 2.2 AA; these instructions alone do not
establish conformance.

## Semantics and interaction

- Prefer native semantic HTML: buttons for actions, links for navigation, and
  correctly associated labels for form controls. Avoid clickable generic elements.
- Every interactive control must have an accessible name. Icon-only controls need
  an `aria-label` or visually hidden text; hide decorative icons from assistive
  technology.
- Support keyboard operation using native behavior or the appropriate ARIA pattern.
  Preserve logical tab order; never use positive `tabIndex` values. Buttons must
  work with Enter and Space.
- Preserve a clearly visible `focus-visible` indicator in both light and dark
  themes. Never remove an outline without an equivalent visible replacement.
- Enabled buttons must show a pointer cursor. Disabled buttons must not appear
  clickable or activate; use native `disabled` where supported. `aria-disabled`
  alone does not prevent activation. A pointer cursor supplements keyboard and
  semantic behavior; it does not replace them.
- Forward refs and native/ARIA props so consumers can manage focus and accessible
  names. Default reusable buttons to `type="button"`.
- For dialogs and other overlays, implement appropriate initial focus, Escape
  dismissal, focus containment where required, and focus restoration on close.

## Visual and content requirements

- Maintain text contrast of at least 4.5:1 for normal text and 3:1 for large text;
  maintain 3:1 contrast for required control boundaries and state indicators.
  Check actual adjacent colors in both themes rather than assuming token names
  guarantee contrast.
- Do not communicate meaning through color, hover, or motion alone. Respect
  `prefers-reduced-motion` when introducing animation.
- Keep controls usable with zoom and narrow viewports. Meet the 24 by 24 CSS pixel
  target size requirement or its spacing exceptions; prefer larger touch targets
  where practical.
- Associate validation errors and help text with their controls. Announce dynamic
  status changes when necessary without excessive live-region announcements.

## Stories and verification

- Add or update stories for relevant variants, sizes, disabled states, and
  accessible icon-only usage. Ensure each example has an accessible name.
- Before completing interaction changes, check keyboard activation, tab order,
  visible focus, disabled behavior, and light/dark presentation. Report which
  checks were actually performed and any remaining limitations.
- Use automated accessibility and interaction checks when adding complex widgets
  or changing behavior; automated checks supplement manual keyboard verification.
- Run `npm run typecheck`, `npm run build`, and `npm run build-storybook` after
  component or Storybook changes. Keep the package and registry using the same
  accessible component source.
