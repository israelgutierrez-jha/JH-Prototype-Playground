# JH Prototype Playground

This repo is a shared design prototyping environment for the Jack Henry design team. Designers work locally with either Claude Code or Cursor to generate interactive prototypes built exclusively with JH components — the playground is AI-agnostic, bring whichever tool you already use.

## Your role

You are a prototyping assistant. Your job is to help designers build interactive UI prototypes using the JH Design System. When asked to create or modify a prototype:

1. **Always use JH components** — never reach for vanilla HTML `<button>`, `<input>`, `<select>`, etc. when a `jh-` equivalent exists.
2. **Use JH design tokens** for spacing, color, and typography — CSS custom properties like `--jh-dimension-300`, `--jh-color-content-brand-enabled`, `--jh-font-size-200`.
3. Follow the Lit component pattern described below exactly.
4. Keep the prototype focused — model one flow or concept, not an entire product.
5. **Never write custom code outside of JH design system components** (`@jack-henry/jh-elements`, `@jkhy/platform-tools`, `@jack-henry/jh-icons`, `@jack-henry/jh-datasets`) without first stopping to ask the user for explicit approval — even in Auto mode. This is a hard constraint, not a preference.

---

## How to create a new prototype

Run `/new-prototype` or follow these steps manually:

1. Create a folder: `src/prototypes/[your-name]/[kebab-case-name]/`
2. Inside it, create two files: `meta.ts` and `index.ts`
3. The prototype appears in the gallery automatically — no registration needed.

### Naming conventions

- `[your-name]` = your first-last in lowercase kebab-case, e.g. `jack-henry`
- `[prototype-name]` = kebab-case description, e.g. `account-transfer-flow`

---

## Building from a Figma design

Run `/figma-to-prototype` to scaffold a prototype from an actual Figma frame instead of a text description. It fetches the design via the `figma` MCP server (pre-configured in `.mcp.json` / `.cursor/mcp.json` — see the repo README for the one-time authorization step), maps every element to the closest `jh-*` component and `--jh-*` token, and produces the same `meta.ts`/`index.ts` shape as `/new-prototype`. Same hard rule applies: if something in the design has no JH equivalent, it stops and asks before writing custom markup.

Jack Henry's Figma library doesn't yet have formal Code Connect mappings to `jh-elements` (that's on the design-system team's backlog), so matching today is heuristic. If/when those mappings ship, this command gets more accurate automatically — no changes needed here.

---

## Prototype file format

### `meta.ts`

```ts
import type { PrototypeMeta } from '../../../components/proto-card.js'

export const meta: PrototypeMeta = {
  title: 'Account Transfer Flow',
  description: 'Three-step flow for transferring funds between accounts.',
  designer: 'jack-henry',
  tags: ['transfers', 'forms', 'multi-step'],
  createdAt: '2026-06-15',
  // Optional: adds a nav bar to the header for this prototype
  navItems: [
    { label: 'Overview', path: '#overview' },
    { label: 'Transfers', path: '#transfers' },
    {
      label: 'Accounts',
      subItems: [
        { label: 'Checking', path: '#checking' },
        { label: 'Savings', path: '#savings' },
      ],
    },
  ],
}
```

### `index.ts`

```ts
import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
// Import the JH components you need — see reference below
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'

export default class AccountTransferPrototype extends LitElement {
  static styles = css`
    :host { display: block; }
    /* Use --jh-* tokens for all values */
    .container {
      padding: var(--jh-dimension-600, 3rem);
    }
  `

  @state() private _step = 1

  render() {
    return html`
      <div class="container">
        <jh-card>
          <!-- your prototype content -->
          <jh-button label="Next" appearance="primary" @click=${() => this._step++}></jh-button>
        </jh-card>
      </div>
    `
  }
}
```

**Key rules:**
- Export the class as `export default class` — no `@customElement` decorator needed (the playground registers it).
- The class name doesn't need to match the file name.
- Import only the JH components you use.
- Write prototypes as **page content** — the playground wraps every prototype in the JH platform shell (nav + header) automatically. Don't add custom top-level headers or `min-height: 100vh`.

---

## JH Component Reference

All components from `@jack-henry/jh-elements`. Import path: `@jack-henry/jh-elements/components/[name]/[name].js`

> The component reference below is generated from the structured docs in `src/data/components/` — edit those files and run `npm run docs`; never edit between the markers by hand. (The Platform Shell and Data Helpers sections further down are not `jh-elements` components and remain hand-written.)

<!-- AUTO-GENERATED:COMPONENTS START — do not edit by hand; run `npm run generate-docs` -->

This is a compact index — one line per component. **For the full API**
(props, events, slots) of ONE component, read only its generated file at
`src/data/components/_api/<tag>.generated.ts` (e.g. `_api/jh-button.generated.ts`);
for examples, gotchas, and detailed intent read the component's file at
`src/data/components/<tag>.ts`. Both are browsable in the app **Resources**
tab. Open the relevant per-component file for exact attributes — do not read
the whole set and do not guess.

#### Actions

- `jh-button` — Triggers an action or navigation, with appearance variants that signal intent. _Import:_ `@jack-henry/jh-elements/components/button/button.js` — _when:_ Committing to an action: submit, save, continue, confirm.

#### Inputs & Forms

- `jh-checkbox` — Toggles a single independent boolean option on or off. _Import:_ `@jack-henry/jh-elements/components/checkbox/checkbox.js` — _when:_ A single opt-in/opt-out choice — accept terms, enable a setting.
- `jh-checkbox-group` — Groups related checkboxes under a shared label for multi-select choices. _Import:_ `@jack-henry/jh-elements/components/checkbox-group/checkbox-group.js` — _when:_ Letting the user pick zero or more options from a related set — alert types, account features.
- `jh-input` — Single-line text field for free-form entry, with label, helper, and error states. _Import:_ `@jack-henry/jh-elements/components/input/input.js` — _when:_ Collecting a single line of free-form text — names, account nicknames, memos.
- `jh-input-email` — Text field specialized for email entry, with email keyboard and format validation. _Import:_ `@jack-henry/jh-elements/components/input-email/input-email.js` — _when:_ Collecting an email address — sign-in, contact info, statement delivery.
- `jh-input-password` — Masked text field for secret entry, with a show/hide affordance. _Import:_ `@jack-henry/jh-elements/components/input-password/input-password.js` — _when:_ Collecting a password or other secret the user should not see in plain text by default.
- `jh-input-search` — Text field specialized for search, with a search icon and clear affordance. _Import:_ `@jack-henry/jh-elements/components/input-search/input-search.js` — _when:_ Filtering or searching a list, table, or gallery.
- `jh-input-telephone` — Text field specialized for phone numbers, with telephone keyboard and formatting. _Import:_ `@jack-henry/jh-elements/components/input-telephone/input-telephone.js` — _when:_ Collecting a phone number — contact info, two-factor setup, alerts.
- `jh-input-textarea` — Multi-line text field for longer free-form entry. _Import:_ `@jack-henry/jh-elements/components/input-textarea/input-textarea.js` — _when:_ Collecting more than one line of text — notes, memos, descriptions, messages.
- `jh-input-url` — Text field specialized for web address entry, with URL keyboard and format validation. _Import:_ `@jack-henry/jh-elements/components/input-url/input-url.js` — _when:_ Collecting a web address — website, link to a document, social or profile URL.
- `jh-radio` — A single option within a mutually exclusive set of choices. _Import:_ `@jack-henry/jh-elements/components/radio/radio.js` — _when:_ Presenting one option among a small, mutually exclusive set — always inside a `jh-radio-group`.
- `jh-radio-group` — Groups radios under a shared label so the user picks exactly one option. _Import:_ `@jack-henry/jh-elements/components/radio-group/radio-group.js` — _when:_ Choosing exactly one option from a small visible set — delivery method, account type.
- `jh-select` — Dropdown for choosing one option from a list, with label and validation states. _Import:_ `@jack-henry/jh-elements/components/select/select.js` — _when:_ Choosing one option from a longer list where showing all choices would crowd the layout — state, account, category.
- `jh-switch` — Toggles a setting on or off, typically taking effect immediately. _Import:_ `@jack-henry/jh-elements/components/switch/switch.js` — _when:_ A binary setting that applies right away — enable notifications, dark mode, paperless.

#### Layout & Containers

- `jh-card` — A surface that groups related content, with optional header and footer regions. _Import:_ `@jack-henry/jh-elements/components/card/card.js` — _when:_ Grouping related content or actions into a distinct surface — account summaries, forms, panels.
- `jh-divider` — A thin horizontal rule that separates content, with optional inset spacing. _Import:_ `@jack-henry/jh-elements/components/divider/divider.js` — _when:_ Visually separating sections or groups within a surface.

#### Feedback & Status

- `jh-badge` — A small numeric or dot indicator for counts, typically anchored to an icon. _Import:_ `@jack-henry/jh-elements/components/badge/badge.js` — _when:_ Showing an unread or pending count on an icon or item — notifications, messages.
- `jh-notification` — Inline or full-width message conveying status — success, info, or error. _Import:_ `@jack-henry/jh-elements/components/notification/notification.js` — _when:_ Communicating the result of an action or a persistent state — validation errors, save success, system info.
- `jh-progress` — A bar showing completion toward a known total. _Import:_ `@jack-henry/jh-elements/components/progress/progress.js` — _when:_ Showing determinate progress — multi-step flow completion, upload percentage, goal funding.
- `jh-toast` — A brief, transient message that confirms an action and auto-dismisses. _Import:_ `@jack-henry/jh-elements/components/toast/toast.js` — _when:_ Confirming a quick, successful action without interrupting the flow — "Copied", "Transfer sent".
- `jh-toast-controller` — A singleton host that renders and manages toasts, queued via a global event. _Import:_ `@jack-henry/jh-elements/components/toast-controller/toast-controller.js` — _when:_ Mount once near the app root so anywhere in the app can raise a toast.
- `jh-tooltip` — A small popover that explains a trigger element on hover or focus. _Import:_ `@jack-henry/jh-elements/components/tooltip/tooltip.js` — _when:_ Clarifying an icon-only control or terse label with a short hint.
- `jha-dialog` — A confirm/cancel dialog card (heading, message, two actions) — the sanctioned fallback for prototypes that need a modal, since the current JH Design System has no dialog component yet. _Import:_ `@banno/jha-wc/src/jha-dialog/jha-dialog.js` — _when:_ Confirming a consequential or destructive action before it happens — "Delete this record?", "Continue without completing verification?".

#### Lists

- `jh-list-group` — A container that groups list items under an optional subheader. _Import:_ `@jack-henry/jh-elements/components/list-group/list-group.js` — _when:_ Displaying a set of records or navigation rows — accounts, transactions, people.
- `jh-list-item` — A single row showing primary/secondary text and metadata, with optional leading/trailing slots. _Import:_ `@jack-henry/jh-elements/components/list-item/list-item.js` — _when:_ Representing one record or navigation row inside a `jh-list-group` or `jh-menu`.

#### Navigation

- `jh-menu` — A list of actions or options, typically shown from a trigger. _Import:_ `@jack-henry/jh-elements/components/menu/menu.js` — _when:_ Offering a set of actions or choices in an overflow/context menu — row actions, "more" menus.

#### Tags

- `jh-tag` — A compact text label for statuses, categories, or dismissible selections. _Import:_ `@jack-henry/jh-elements/components/tag/tag.js` — _when:_ Showing a short text status or category — "Active", "Pending", "Savings".
- `jh-tag-group` — Lays out a set of related tags with consistent spacing and wrapping. _Import:_ `@jack-henry/jh-elements/components/tag-group/tag-group.js` — _when:_ Displaying multiple tags together — a list of categories, applied filters, or attributes.

#### Data

- `jh-table` — A data table that arranges rows and columns of structured records. _Import:_ `@jack-henry/jh-elements/components/table/table.js` — _when:_ Displaying structured, multi-column data that benefits from aligned columns — transactions, reports.
- `jh-table-data-cell` — A body cell holding one value within a table row. _Import:_ `@jack-henry/jh-elements/components/table-data-cell/table-data-cell.js` — _when:_ Holding a single value in a body `jh-table-row`; content is slotted.
- `jh-table-header-cell` — A column header cell within a table header row. _Import:_ `@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js` — _when:_ Labeling a column inside a `jh-table-row` with `slot="jh-table-header"`.
- `jh-table-row` — A row within a table — a header row or a body row of cells. _Import:_ `@jack-henry/jh-elements/components/table-row/table-row.js` — _when:_ Grouping header cells (in a row with `slot="jh-table-header"`) or data cells into a single table row.
- `jha-advanced-table` — A full-featured data table with sorting, filtering, search, pagination, bulk actions, and a column editor — the legacy component still used for anything a plain jh-table can't handle. _Import:_ `@banno/jha-wc/src/tables/advanced/jha-advanced-table/jha-advanced-table.js` — _when:_ Displaying a large, information-dense dataset that needs sorting, filtering, search, and pagination out of the box — transaction lists, admin queues, reporting grids.

#### Icons

- `jh-icon` — Renders a JH icon at a standard size; individual glyphs ship as their own elements. _Import:_ `@jack-henry/jh-elements/components/icon/icon.js` — _when:_ Adding a recognizable glyph to reinforce an action, status, or list row.

<!-- AUTO-GENERATED:COMPONENTS END -->

### Platform Shell (`@jkhy/platform-tools`)

Every prototype automatically renders inside the JH platform shell — you don't need to import or configure it. The shell provides the left nav, header bar, and content area.

**What designers get automatically:**
- Left nav sidebar (58px, dark background)
- Top header bar with the prototype title (from `meta.ts`) and a "← Gallery" button
- Header nav bar (if `navItems` is defined in `meta.ts`)
- Content area with standard platform padding

**Prototype content rule:** Write prototypes as page content only — no custom top-level headers, no `min-height: 100vh` on `:host`. The platform shell owns the page frame.

#### Adding a header nav bar

Add `navItems` to your `meta.ts` to get a navigation bar rendered in the header automatically. No code changes needed in `index.ts`.

```ts
// meta.ts
export const meta: PrototypeMeta = {
  title: 'My Prototype',
  // ...other fields...
  navItems: [
    { label: 'Dashboard', path: '#dashboard' },
    { label: 'Reports', path: '#reports' },
    {
      label: 'Settings',
      subItems: [
        { label: 'Profile', path: '#profile' },
        { label: 'Security', path: '#security' },
      ],
    },
  ],
}
```

`NavItem` shape: `{ label: string, path?: string, subItems?: { label: string, path: string }[] }`. Items with `subItems` render as a dropdown menu; the parent item does not navigate. The nav auto-collapses to a "Menu" button on narrow screens.

```ts
// ✅ Correct — just render page content
static styles = css`
  :host { display: block; }
  .container { padding: var(--jh-dimension-500, 2.5rem); }
`

// ❌ Wrong — don't replicate the shell's job
static styles = css`
  :host { display: block; min-height: 100vh; }
  .custom-header { ... } /* shell already has a header */
`
```

If you need to customize the platform shell itself (advanced), the components are available:

| Component | Import | Key Props |
|-----------|--------|-----------|
| Platform Layout | `@jkhy/platform-tools/components/jh-platform-layout.js` | `unauthenticated-app`, `institution-id`, `user-id` — slots: `header-container` (default: content) |
| Platform Header | `@jkhy/platform-tools/components/jh-platform-header.js` | `title`, `.navItems` (NavItem[]), `titleHref`, `titleSymbol`, `hideHeader` — slots: `header-left`, `header-right` |
| Platform Header Nav | `@jkhy/platform-tools/components/jh-platform-header-nav.js` | `.items` (NavItem[]) — standalone nav bar; already included when you use `.navItems` on `jh-platform-header` |
| Platform Content | `@jkhy/platform-tools/components/jh-platform-content.js` | `drawer-open`, `has-right-panel`, `has-footer` |
| Platform Drawer | `@jkhy/platform-tools/components/jh-platform-drawer.js` | `heading`, `loading`, `layout` (`'panel'` \| `'overlay'`), `open` — slots: default (content), `drawer-header`, `drawer-actions`, `footer`; event: `close-overlay`/`close-drawer`. `layout="overlay"` renders via the native Popover API (`popover="manual"`) — the browser's top layer, entirely outside any ancestor's stacking context. Use this (not a custom `position: fixed` panel) whenever playground or app chrome needs to float content over a page without risk of colliding with that page's own layout/panels — set `--jh-drawer-overlay-backdrop: transparent` to keep the page visible/undimmed underneath instead of the default dark scrim. |

### Data Helpers (`@jack-henry/jh-datasets`)

Pre-built datasets and utilities for common form patterns. Import from `@jack-henry/jh-datasets`.

```ts
import { US_STATES_FLAT, US_STATES_GROUPED, manageSelectDataset } from '@jack-henry/jh-datasets'
```

| Export | Type | Description |
|--------|------|-------------|
| `US_STATES_FLAT` | `{ value: string, label: string }[]` | 50 states + DC as a flat list |
| `US_STATES_GROUPED` | `{ label: string, options: { value, label }[] }[]` | States grouped by region (Northeast, South, Midwest, West) |
| `manageSelectDataset(options)` | function | Processes a dataset for use with `jh-select` — returns items with `selected`/`disabled` flags |

`jh-select` does **not** take `jh-list-item` children — it takes an `.options` JS property (`{ value, label }[]`), which it renders into its own internal list. Slotting `<jh-list-item>` elements directly renders an empty dropdown.

```ts
import { US_STATES_FLAT, US_STATES_GROUPED, manageSelectDataset } from '@jack-henry/jh-datasets'
import '@jack-henry/jh-elements/components/select/select.js'

// Flat list — pass straight to .options (already { value, label }[])
// In render():
html`
  <jh-select
    label="State"
    required
    .options=${US_STATES_FLAT}
    @jh-change=${(e) => { this._state = e.target.value }}
  ></jh-select>
`

// With manageSelectDataset — pre-select a value or disable specific items;
// returns { value, label, selected, disabled }[], also ready for .options
const processed = manageSelectDataset({
  dataset: US_STATES_FLAT,
  initialValue: 'CA',          // pre-selected
  disabledItems: ['AK', 'HI'], // disabled items
})
```

---

## JH Design Tokens (CSS custom properties)

Use these in `static styles = css\`...\`` instead of raw values.

### Spacing — `--jh-dimension-*` (PIXEL values; the number is an index, not px/rem)
```
--jh-dimension-50   = 2px
--jh-dimension-100  = 4px
--jh-dimension-200  = 8px     ← small gap
--jh-dimension-300  = 12px    ← medium gap
--jh-dimension-400  = 16px    ← large gap / card padding
--jh-dimension-500  = 20px
--jh-dimension-600  = 24px    ← section padding
--jh-dimension-800  = 32px
--jh-dimension-1000 = 40px
--jh-dimension-1200 = 48px
--jh-dimension-1600 = 64px
```
> Some existing playground chrome passes a rem fallback (e.g. `var(--jh-dimension-600, 3rem)`). That fallback is **inert** — the token is always defined, so the real px value wins. Don't trust the rem hint.

### Typography — `--jh-font-size-*` (PIXEL values)
```
--jh-font-size-250 = 10px
--jh-font-size-300 = 12px
--jh-font-size-350 = 14px   ← small / label
--jh-font-size-400 = 16px   ← body
--jh-font-size-450 = 18px   ← subheading
--jh-font-size-500 = 20px   ← heading
--jh-font-size-600 = 24px   ← large heading
--jh-font-size-700 = 28px
--jh-font-size-800 = 32px   ← display
--jh-font-weight-300 = 300   ← light
--jh-font-weight-400 = 400   ← regular / body
--jh-font-weight-500 = 500   ← medium (the closest thing to "semibold")
--jh-font-weight-700 = 700   ← bold
```
> **Font weights are numeric only.** There is **no** `--jh-font-weight-regular/-semibold/-bold` and **no `600` weight** in the token set — use the numeric tokens above. Code referencing the named tokens works only because of an inert fallback; for a semibold-ish heading use `--jh-font-weight-500`, for bold use `--jh-font-weight-700`.
> There is **no** `--jh-font-size-100` or `-200`. Code that references them works only because the token is undefined and the rem fallback applies. Prefer the real tokens above. Note `-300`/`-400`/`-500`/`-600` **do** exist but are smaller than a `100`-scale would suggest (e.g. `-400 = 16px`, not 20px) — using them where you meant a larger size renders smaller than intended.

**Line-height — important:** the `--jh-font-line-height-*` tokens are **pixel
values**, not unitless ratios (e.g. `--jh-font-line-height-300 = 12px`,
`-400 = 16px`, `-500 = 20px`, `-600 = 24px`). Do **not** write
`line-height: var(--jh-font-line-height-300)` for body copy — 12px is smaller
than the text and lines will overlap. For wrapping body text, use a unitless
`line-height: 1.5` (or a px token that matches the font size, e.g.
`--jh-font-line-height-600` for 16px body).

### Colors

The playground runs in dark mode by default; light/dark is toggled by the sun/moon button at the bottom of the nav. All color tokens below respond to the active theme automatically.

```
--jh-color-content-primary-enabled    ← main body text
--jh-color-content-secondary-enabled  ← muted/secondary text
--jh-color-content-brand-enabled      ← brand blue (links, accents)
--jh-color-content-positive-enabled   ← success green
--jh-color-content-negative-enabled   ← error red
--jh-color-container-page             ← page background  (NOT -page-enabled)
--jh-color-container-primary-enabled  ← card/panel surface  (NOT -surface-enabled)
--jh-color-divider-primary            ← border/divider color  (NOT -border-enabled)
```

> **Token naming note:** Three common tokens do NOT follow the `-enabled` suffix pattern:
> - ✅ `--jh-color-container-page` — page background
> - ✅ `--jh-color-container-primary-enabled` — card/surface background  
> - ✅ `--jh-color-divider-primary` — borders and dividers
> - ❌ `--jh-color-content-tertiary-enabled` does not exist — use `--jh-color-content-secondary-enabled`
> - ❌ There is **no** `content-warning`/`container-warning` (orange/yellow) semantic pair. For a warning accent use the raw `--jh-color-yellow-*` scale (e.g. `--jh-color-yellow-400`), and never `--jh-color-container-surface-enabled` (also nonexistent) — use `--jh-color-container-secondary-enabled` for a subtle surface.

---

## Common prototype patterns

### Multi-step flow
```ts
@state() private _step: 'step1' | 'step2' | 'done' = 'step1'

render() {
  if (this._step === 'step1') return html`...step 1...`
  if (this._step === 'step2') return html`...step 2...`
  return html`...success...`
}
```

### Simulated async action (loading state)
```ts
@state() private _pending = false

private async _submit() {
  this._pending = true
  await new Promise(r => setTimeout(r, 1500)) // simulate network
  this._pending = false
  this._step = 'success'
}

// In template:
<jh-button label="Submit" ?pending=${this._pending} @click=${this._submit}></jh-button>
```

### List of items with selection
```ts
@state() private _selected: string | null = null
private _items = ['Checking ···1234', 'Savings ···5678']

render() {
  return html`
    <jh-list-group>
      ${this._items.map(item => html`
        <jh-list-item
          label=${item}
          ?selected=${this._selected === item}
          @click=${() => { this._selected = item }}
        ></jh-list-item>
      `)}
    </jh-list-group>
  `
}
```

### Error state
```ts
@state() private _error = ''

render() {
  return html`
    ${this._error ? html`<jh-notification type="alert" appearance="negative">${this._error}</jh-notification>` : ''}
    <jh-input label="Amount" error-text=${this._error}></jh-input>
  `
}
```

### Full-height split-pane layout

Use when a frame has an element meant to reach the full height of the screen — a side panel/nav rail with a divider that should run edge-to-edge, a split-pane layout, etc. Don't fake this with a fixed pixel height copied from the Figma frame (see the "Figma frame isn't a size constraint" rule above) — opt into the real available height instead:

```ts
static styles = css`
  :host { display: block; height: 100%; }
  .layout { display: flex; align-items: stretch; height: 100%; }
  .panel { width: 320px; flex-shrink: 0; }  /* a fixed-width rail is fine — it's the top-level wrapper that shouldn't be fixed */
  .content { flex: 1; min-width: 0; }       /* flexible area fills the rest and stretches via align-items: stretch */
`
```

This works because `proto-shell.ts` gives the mounted prototype element a definite height to resolve percentages against.

---

## External / CU-facing gallery

This repo deploys to two separate GitHub Pages sites, from two separate repos:

- **This repo** (`JH-Prototype-Playground`) — the full, unrestricted internal app, for the team. Unchanged, no password, everything visible.
- **`JH-Prototype-Playground-External`** — a restricted build, safe to hand to a stakeholder outside the design team (credit union or bank). On every push to `main`, `.github/workflows/deploy-external.yml` checks out this repo fresh, deletes any prototype whose `meta.ts` isn't `public: true` (and clears `src/data/external-links.json`), builds with `VITE_EXTERNAL_BUILD=true`, and pushes the result into that repo's `gh-pages` branch.

**What's different in that build** (all gated on `import.meta.env.VITE_EXTERNAL_BUILD === 'true'`, checked as a module-level `IS_EXTERNAL_BUILD` constant in `app.ts`/`proto-gallery.ts`/`proto-shell.ts`):
- Only prototypes marked `public: true` exist at all — everything else is deleted before the build runs, not just hidden in the UI.
- Only the gallery is reachable — Templates, Resources, Settings, Features nav links and routes are hidden/blocked; the gallery's own "Link external" / "New prototype" designer actions and the onboarding dialog are hidden.
- No per-prototype pencil ("Prototype settings") or inspect-mode button in the prototype viewer.
- A password gate (`proto-password-gate.ts`) in front of any prototype whose own `meta.ts` has a `passwordHash` (set per-prototype via that prototype's own "Prototype settings" dialog). There is no separate gallery-level password — the gallery listing itself is unlocked for anyone with the link; only individual prototypes can be locked. (A gallery-wide password existed briefly but was removed: since it lived in a checked-in file editable by any designer via Settings, one designer's change could silently overwrite another's. Revisit only if there's a real need — the per-prototype password already covers the common case.)

**How a designer marks a prototype for the external gallery:** open the prototype → pencil icon → "Prototype settings" → toggle "Show in external gallery" and optionally set a password → Save (writes `public`/`passwordHash` to that prototype's own `meta.ts`, same as title/description already do) → commit and push to `main`.

**Important — this is a deterrent, not real security.** There's no server here: a password check can only run in the visitor's browser, so the password's hash ships inside the JS bundle and a technically motivated visitor can extract or bypass it. Passwords are hashed (`src/utils/password-hash.ts`, SHA-256) so at least nobody sees them in plaintext in a diff, but treat this as "keeps out search engines and casual link-sharing," not as protection for anything genuinely sensitive. The CI prune step is real (non-public prototype source is deleted before the build, not merely hidden), but unrelated designer-facing modules (Templates/Resources/Features/Settings components) are still bundled — just unreachable via the UI — since they're imported unconditionally elsewhere in the app; a determined visitor reading the built JS could still find that inert code.

## Browser-based verification (chrome-devtools MCP or equivalent)

For UI/frontend changes, driving a real browser to click through the change and confirm it actually works is more thorough than a typecheck alone — but it costs real time and tokens per use (loading the tool's schema, page snapshots, and screenshots all add to the request).

Each designer's clone has a per-machine preference for this, set on the Settings page ("Browser verification") and stored in `.designer.local.json` (gitignored, read via `getDesignerName`'s sibling `isBrowserVerificationEnabled()` in `src/utils/designer-profile.ts`, same file/endpoint pattern as the designer name — see that file's header comment for why this can't live in localStorage alone). Default is off.

**Before using a browser-automation tool (chrome-devtools MCP or similar) to verify a UI change:** read `.designer.local.json` at the repo root.
- `"browserVerificationEnabled": true` — use it freely for this session.
- `false`, or the field/file is missing — ask the designer first, explaining the time/token cost, rather than using it silently or skipping verification silently. If they decline or don't respond, fall back to typecheck/build and ask them to eyeball the change themselves.

This is a convention this file documents, not a technical restriction — nothing blocks an MCP tool call based on this file's contents, so it only works if you (the AI reading this) actually check it first.

---

## Running the playground locally

```bash
npm install
npm run dev   # → http://localhost:5173
```

Your prototype appears in the gallery automatically once you create the `meta.ts` and `index.ts` files.

### Keeping Claude Code and Cursor in sync

`.claude/commands/*.md` and `scripts/mcp-servers.js` are the only files to hand-edit for slash commands and MCP servers. `npm install` (via `postinstall`) and `npm run docs` both run `scripts/sync-rules.js`, which regenerates `.cursorrules`, `.cursor/commands/*.md`, `.mcp.json`, and `.cursor/mcp.json` from those sources. Don't hand-edit the generated files — they're gitignored and get overwritten on the next install.

---

## Project structure

```
src/
  prototypes/
    [your-name]/
      [prototype-name]/
        index.ts      ← the Lit component (export default class)
        meta.ts       ← title, description, tags, createdAt
    _template/        ← copy this to start a new prototype
    example/
      login-flow/     ← reference implementation
  components/
    proto-gallery.ts  ← gallery home page (auto-discovers prototypes)
    proto-shell.ts    ← viewer frame
    proto-card.ts     ← gallery card
  styles/
    global.css        ← JH token imports
  app.ts              ← root element, hash router
  main.ts             ← entry point
```
