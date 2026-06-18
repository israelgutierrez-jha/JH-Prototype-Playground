# JH Prototype Playground

This repo is a shared design prototyping environment for the Jack Henry design team. Designers work locally in VS Code with Claude Code to generate interactive prototypes built exclusively with JH components.

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

- `[your-name]` = your first-last in lowercase kebab-case, e.g. `ivan-gutierrez`
- `[prototype-name]` = kebab-case description, e.g. `account-transfer-flow`

---

## Prototype file format

### `meta.ts`

```ts
import type { PrototypeMeta } from '../../../components/proto-card.js'

export const meta: PrototypeMeta = {
  title: 'Account Transfer Flow',
  description: 'Three-step flow for transferring funds between accounts.',
  designer: 'ivan-gutierrez',
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

> Components in the generated block below are sourced from the structured docs in `src/data/components/`. The hand-written sections that follow are pending migration into that dataset — as each component is added there, remove its hand-written entry here.

<!-- AUTO-GENERATED:COMPONENTS START — do not edit by hand; run `npm run generate-docs` -->

**Component index**

| Component | Use it for |
|-----------|------------|
| `jh-button` | Triggers an action or navigation, with appearance variants that signal intent. |

### Button (`jh-button`)

Triggers an action or navigation, with appearance variants that signal intent.

**Import:** `@jack-henry/jh-elements/components/button/button.js`

**When to use**

- Committing to an action: submit, save, continue, confirm.
- Navigating when the destination feels like an action (use `href` for real links).
- Signaling hierarchy in a group of choices via `appearance` (one primary action per view).

**When not to use**

- For low-emphasis inline navigation inside body text — prefer a plain link.
- As a toggle for an on/off setting — use `jh-switch`.
- To represent a selectable option in a list — use `jh-list-item`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` *(required)* | `string` | — | Visible button text. |
| `appearance` | `'primary' \| 'secondary' \| 'tertiary' \| 'danger'` | `primary` | Visual emphasis. Use exactly one primary per view; danger for destructive actions. |
| `size` | `'x-small' \| 'small' \| 'medium' \| 'large'` | `medium` | Control size; match the density of the surrounding context. |
| `disabled` | `boolean` | `false` | Blocks interaction and dims the button. |
| `pending` | `boolean` | `false` | Shows a loading spinner; use during async actions to prevent double-submits. |
| `href` | `string` | — | Renders the button as a link to this URL. |
| `block` | `boolean` | `false` | Stretches the button to full container width. |

**Slots**

- `jh-button-icon-left` — Icon placed before the label.
- `jh-button-icon-right` — Icon placed after the label.

**Examples**

_Primary action_ — The single most important action on a view — submit a form, confirm a flow.

```html
<jh-button label="Save" appearance="primary" @click=${this._save}></jh-button>
```

_Secondary / cancel_ — A supporting action shown alongside the primary one, e.g. dismissing a dialog.

```html
<jh-button label="Cancel" appearance="secondary"></jh-button>
```

_Destructive action_ — An irreversible or data-losing action like delete; pair with a confirmation step.

```html
<jh-button label="Delete" appearance="danger"></jh-button>
```

_Async / loading state_ — A submit that triggers a network call — bind `pending` to your loading flag.

```html
<jh-button label="Submit" appearance="primary" ?pending=${this._saving} @click=${this._submit}></jh-button>
```

_With a leading icon_ — Reinforce an action with a glyph, e.g. a download or transfer button.

```html
<jh-button label="Download" appearance="secondary">
  <jh-icon-arrow-down-to-line slot="jh-button-icon-left" size="small"></jh-icon-arrow-down-to-line>
</jh-button>
```

**Gotchas**

- The text is the `label` attribute, not slotted children — children are reserved for icon slots.
- Limit to one `appearance="primary"` per view so the primary action stays unambiguous.
- Prefer `pending` over `disabled` during async work; it communicates progress, not just unavailability.

**Related:** `jh-list-item`, `jh-switch`

<!-- AUTO-GENERATED:COMPONENTS END -->

### Inputs & Forms

| Component | Import | Key Props |
|-----------|--------|-----------|
| Input (text) | `components/input/input.js` | `label`, `placeholder`, `value`, `required`, `disabled`, `error-text`, `helper-text` |
| Email | `components/input-email/input-email.js` | same as input |
| Password | `components/input-password/input-password.js` | same as input |
| Search | `components/input-search/input-search.js` | same as input |
| Telephone | `components/input-telephone/input-telephone.js` | same as input |
| Textarea | `components/input-textarea/input-textarea.js` | `label`, `rows`, `placeholder` |
| Checkbox | `components/checkbox/checkbox.js` | `label`, `checked`, `disabled` |
| Checkbox Group | `components/checkbox-group/checkbox-group.js` | `label` — wrap multiple `jh-checkbox` inside |
| Radio | `components/radio/radio.js` | `label`, `value`, `checked`, `name` |
| Radio Group | `components/radio-group/radio-group.js` | `label`, `name` — wrap multiple `jh-radio` inside |
| Switch | `components/switch/switch.js` | `label`, `checked`, `disabled` |
| Select | `components/select/select.js` | `label`, `placeholder`, `value`, `required`, `disabled`, `error-text`, `helper-text` — slot `jh-list-item` elements inside |

```html
<jh-select label="Account type" required>
  <jh-list-item value="checking" label="Checking"></jh-list-item>
  <jh-list-item value="savings" label="Savings"></jh-list-item>
  <jh-list-item value="money-market" label="Money Market"></jh-list-item>
</jh-select>
```

Reading a field's value — listen to `@jh-change` or `@jh-input` events:
```ts
private _handleInput(e: CustomEvent) {
  this._value = (e.target as HTMLInputElement).value
}
// In template:
<jh-input label="Name" @jh-input=${this._handleInput}></jh-input>
```

Or read synchronously via `this.renderRoot.querySelector('jh-input')?.value`.

### Layout & Containers

| Component | Import | Key Props |
|-----------|--------|-----------|
| Card | `components/card/card.js` | `headerTitle`, `headerSubtitle`, `padding` (none/sm/md/lg), `showHeaderDivider`, `showFooterDivider` — slots: default, `jh-card-header`, `jh-card-footer` |
| Divider | `components/divider/divider.js` | `orientation` (horizontal/vertical) |

```html
<!-- Simple card with padding -->
<jh-card padding="md">
  content goes here
</jh-card>

<!-- Card with built-in header -->
<jh-card headerTitle="Account Summary" headerSubtitle="As of today" showHeaderDivider>
  content goes here
</jh-card>

<!-- Card with custom header slot -->
<jh-card>
  <div slot="jh-card-header" style="padding: var(--jh-dimension-400, 2rem)">Custom header</div>
  <div style="padding: var(--jh-dimension-400, 2rem)">content</div>
</jh-card>
```

### Feedback & Status

| Component | Import | Key Props |
|-----------|--------|-----------|
| Notification | `components/notification/notification.js` | `type` (alert/banner), `appearance` (positive/neutral/negative) — message is **slotted content**, not an attribute |
| Progress | `components/progress/progress.js` | `value` (0–100), `max` |
| Badge | `components/badge/badge.js` | `count` (string number), `maxCount` (number) — **numeric/dot badge only**, not for text labels; use `jh-tag` for text status indicators |
| Toast | `components/toast/toast.js` | `message`, `type` |
| Tooltip | `components/tooltip/tooltip.js` | `content`, wraps trigger element |

```html
<!-- type="alert" = inline notification, type="banner" = full-width top banner -->
<!-- appearance: negative=error, positive=success, neutral=info/warning -->
<jh-notification type="alert" appearance="negative">Something went wrong</jh-notification>
<jh-notification type="alert" appearance="positive">Saved successfully!</jh-notification>
<jh-notification type="alert" appearance="neutral">Here is some information.</jh-notification>
<jh-notification type="banner" appearance="negative">System maintenance scheduled.</jh-notification>

<!-- Badge is for numeric counts/dots only -->
<jh-badge count="5"></jh-badge>
<jh-badge count="150" maxCount="99"></jh-badge>

<jh-progress value=${this._percent} max="100"></jh-progress>
```

### Lists & Navigation

| Component | Import | Key Props |
|-----------|--------|-----------|
| List Group | `components/list-group/list-group.js` | `label` (subheader), `accessible-label` — default slot accepts `jh-list-item` |
| List Item | `components/list-item/list-item.js` | `primary-text`, `secondary-text`, `primary-metadata`, `secondary-metadata`, `selected`, `disabled`, `show-divider`, `divider-inset` — slots: `jh-list-item-left`, `jh-list-item-content`, `jh-list-item-metadata`, `jh-list-item-right` |
| Menu | `components/menu/menu.js` | slotted `jh-list-item` elements |

```html
<!-- Static list -->
<jh-list-group label="Accounts">
  <jh-list-item primary-text="Checking ···1234" secondary-text="$4,200.00"></jh-list-item>
  <jh-list-item primary-text="Savings ···5678" secondary-text="$12,500.00"></jh-list-item>
</jh-list-group>

<!-- Interactive list with selection -->
<jh-list-group>
  ${items.map(item => html`
    <jh-list-item
      primary-text=${item.label}
      secondary-text=${item.balance}
      tabindex="0"
      ?selected=${this._selected === item.id}
      @click=${() => { this._selected = item.id }}
    ></jh-list-item>
  `)}
</jh-list-group>

<!-- With icon slots -->
<jh-list-item>
  <jh-icon-user slot="jh-list-item-left"></jh-icon-user>
  <div slot="jh-list-item-content">Ivan Gutierrez</div>
  <div slot="jh-list-item-metadata">Admin</div>
</jh-list-item>
```

> **Note:** When `jh-list-item` is used inside `jh-select` as an option, use `value` and `label` attributes instead — those are select-specific.

### Icons

| Component | Import | Key Props |
|-----------|--------|-----------|
| Icon | `components/icon/icon.js` | `size` (x-small/small/medium/large/x-large, default: medium) — renders icons from `@jack-henry/jh-icons` |

```html
import '@jack-henry/jh-elements/components/icon/icon.js'
import '@jack-henry/jh-icons/icons-wc/jh-icon-transfer.js'

<jh-icon-transfer size="medium"></jh-icon-transfer>
```

### Tags

| Component | Import | Key Props |
|-----------|--------|-----------|
| Tag | `components/tag/tag.js` | `label`, `removable` |
| Tag Group | `components/tag-group/tag-group.js` | wraps `jh-tag` elements |

### Data Tables

| Component | Import |
|-----------|--------|
| Table | `components/table/table.js` |
| Table Header Cell | `components/table-header-cell/table-header-cell.js` |
| Table Row | `components/table-row/table-row.js` |
| Table Data Cell | `components/table-data-cell/table-data-cell.js` |

```html
<jh-table>
  <jh-table-row slot="header">
    <jh-table-header-cell label="Account"></jh-table-header-cell>
    <jh-table-header-cell label="Balance"></jh-table-header-cell>
  </jh-table-row>
  ${accounts.map(a => html`
    <jh-table-row>
      <jh-table-data-cell>${a.name}</jh-table-data-cell>
      <jh-table-data-cell>${a.balance}</jh-table-data-cell>
    </jh-table-row>
  `)}
</jh-table>
```

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

```ts
import { US_STATES_FLAT, US_STATES_GROUPED, manageSelectDataset } from '@jack-henry/jh-datasets'
import '@jack-henry/jh-elements/components/select/select.js'

// Flat list — slot items directly
// In render():
html`
  <jh-select label="State" required>
    ${US_STATES_FLAT.map(s => html`
      <jh-list-item value=${s.value} label=${s.label}></jh-list-item>
    `)}
  </jh-select>
`

// With manageSelectDataset — pre-select a value or disable specific items
const processed = manageSelectDataset({
  dataset: US_STATES_FLAT,
  initialValue: 'CA',          // pre-selected
  disabledItems: ['AK', 'HI'], // disabled items
})
```

---

## JH Design Tokens (CSS custom properties)

Use these in `static styles = css\`...\`` instead of raw values.

### Spacing (multiples of 4px)
```
--jh-dimension-50   = 2px
--jh-dimension-100  = 4px (or 0.5rem)
--jh-dimension-200  = 8px (or 1rem)  ← small gap
--jh-dimension-300  = 12px (or 1.5rem) ← medium gap
--jh-dimension-400  = 16px (or 2rem)  ← large gap / card padding
--jh-dimension-500  = 24px (or 2.5rem)
--jh-dimension-600  = 32px (or 3rem)  ← section padding
--jh-dimension-800  = 48px (or 4rem)
--jh-dimension-1200 = 64px (or 6rem)
```

### Typography
```
--jh-font-size-100 = 0.875rem (small/label)
--jh-font-size-200 = 1rem     (body)
--jh-font-size-300 = 1.125rem (subheading)
--jh-font-size-400 = 1.25rem  (heading)
--jh-font-size-500 = 1.5rem   (large heading)
--jh-font-size-600 = 2rem     (display)
--jh-font-weight-regular  = 400
--jh-font-weight-semibold = 600
--jh-font-weight-bold     = 700
--jh-font-line-height-300 = 1.5 (body)
```

### Colors

The playground runs in dark mode by default; light/dark is toggled by the sun/moon button at the bottom of the nav. All color tokens below respond to the active theme automatically.

```
--jh-color-content-primary-enabled    ← main body text
--jh-color-content-secondary-enabled  ← muted/secondary text
--jh-color-content-brand-enabled      ← brand blue (links, accents)
--jh-color-content-positive-enabled   ← success green
--jh-color-content-negative-enabled   ← error red
--jh-color-content-warning-enabled    ← warning orange
--jh-color-container-page             ← page background  (NOT -page-enabled)
--jh-color-container-primary-enabled  ← card/panel surface  (NOT -surface-enabled)
--jh-color-divider-primary            ← border/divider color  (NOT -border-enabled)
```

> **Token naming note:** Three common tokens do NOT follow the `-enabled` suffix pattern:
> - ✅ `--jh-color-container-page` — page background
> - ✅ `--jh-color-container-primary-enabled` — card/surface background  
> - ✅ `--jh-color-divider-primary` — borders and dividers
> - ❌ `--jh-color-content-tertiary-enabled` does not exist — use `--jh-color-content-secondary-enabled`

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

---

## Running the playground locally

```bash
npm install
npm run dev   # → http://localhost:5173
```

Your prototype appears in the gallery automatically once you create the `meta.ts` and `index.ts` files.

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
