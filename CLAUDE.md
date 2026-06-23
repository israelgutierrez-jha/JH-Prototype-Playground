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

> The component reference below is generated from the structured docs in `src/data/components/` — edit those files and run `npm run docs`; never edit between the markers by hand. (The Platform Shell and Data Helpers sections further down are not `jh-elements` components and remain hand-written.)

<!-- AUTO-GENERATED:COMPONENTS START — do not edit by hand; run `npm run generate-docs` -->

**Component index**

| Component | Use it for |
|-----------|------------|
| `jh-badge` | A small numeric or dot indicator for counts, typically anchored to an icon. |
| `jh-button` | Triggers an action or navigation, with appearance variants that signal intent. |
| `jh-card` | A surface that groups related content, with optional header and footer regions. |
| `jh-checkbox` | Toggles a single independent boolean option on or off. |
| `jh-checkbox-group` | Groups related checkboxes under a shared label for multi-select choices. |
| `jh-divider` | A thin rule that separates content horizontally or vertically. |
| `jh-input-email` | Text field specialized for email entry, with email keyboard and format validation. |
| `jh-icon` | Renders a JH icon at a standard size; individual glyphs ship as their own elements. |
| `jh-input` | Single-line text field for free-form entry, with label, helper, and error states. |
| `jh-list-group` | A container that groups list items under an optional subheader. |
| `jh-list-item` | A single row showing primary/secondary text and metadata, with optional leading/trailing slots. |
| `jh-menu` | A list of actions or options, typically shown from a trigger. |
| `jh-notification` | Inline or full-width message conveying status — success, info, or error. |
| `jh-input-password` | Masked text field for secret entry, with a show/hide affordance. |
| `jh-progress` | A bar showing completion toward a known total. |
| `jh-radio` | A single option within a mutually exclusive set of choices. |
| `jh-radio-group` | Groups radios under a shared label so the user picks exactly one option. |
| `jh-input-search` | Text field specialized for search, with a search icon and clear affordance. |
| `jh-select` | Dropdown for choosing one option from a list, with label and validation states. |
| `jh-switch` | Toggles a setting on or off, typically taking effect immediately. |
| `jh-table` | A data table that arranges rows and columns of structured records. |
| `jh-table-data-cell` | A body cell holding one value within a table row. |
| `jh-table-header-cell` | A column header cell within a table header row. |
| `jh-table-row` | A row within a table — a header row or a body row of cells. |
| `jh-tag` | A compact text label for statuses, categories, or removable selections. |
| `jh-tag-group` | Lays out a set of related tags with consistent spacing and wrapping. |
| `jh-input-telephone` | Text field specialized for phone numbers, with telephone keyboard and formatting. |
| `jh-input-textarea` | Multi-line text field for longer free-form entry. |
| `jh-toast` | A brief, transient message that confirms an action and auto-dismisses. |
| `jh-tooltip` | A small popover that explains a trigger element on hover or focus. |

### Badge (`jh-badge`)

A small numeric or dot indicator for counts, typically anchored to an icon.

**Import:** `@jack-henry/jh-elements/components/badge/badge.js`

**When to use**

- Showing an unread or pending count on an icon or item — notifications, messages.
- A dot indicator that something needs attention.

**When not to use**

- For text status labels like "Active" or "Pending" — use `jh-tag`.
- For full messages — use `jh-notification`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `string` | — | The number to display (as a string). |
| `maxCount` | `number` | — | Caps the displayed number, e.g. 99 shows "99+". |

**Examples**

_Count badge_ — Show a small unread count.

```html
<jh-badge count="5"></jh-badge>
```

_Capped count_ — Avoid oversized numbers by capping the display.

```html
<jh-badge count="150" maxCount="99"></jh-badge>
```

**Gotchas**

- Numeric/dot only — for text status indicators use `jh-tag`.
- `count` is a string attribute, not a number.

**Related:** `jh-tag`, `jh-notification`

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

### Card (`jh-card`)

A surface that groups related content, with optional header and footer regions.

**Import:** `@jack-henry/jh-elements/components/card/card.js`

**When to use**

- Grouping related content or actions into a distinct surface — account summaries, forms, panels.
- Giving a section its own header/footer via built-in props or slots.

**When not to use**

- For a flat list of records — use `jh-list-group` / `jh-list-item`.
- As a full page frame — the platform shell already owns the page.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headerTitle` | `string` | — | Built-in header title. |
| `headerSubtitle` | `string` | — | Built-in header subtitle. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | — | Inner padding around default-slot content. |
| `showHeaderDivider` | `boolean` | `false` | Shows a divider under the header. |
| `showFooterDivider` | `boolean` | `false` | Shows a divider above the footer. |

**Slots**

- (default) — Default slot — card body content.
- `jh-card-header` — Custom header content (alternative to headerTitle).
- `jh-card-footer` — Footer content, e.g. actions.

**Examples**

_Padded card_ — A simple surface with comfortable inner spacing.

```html
<jh-card padding="md">Account summary content</jh-card>
```

_Card with built-in header_ — A titled section using the header props.

```html
<jh-card headerTitle="Account Summary" headerSubtitle="As of today" showHeaderDivider>
  Balances and recent activity
</jh-card>
```

_Custom header slot_ — When the header needs custom markup rather than plain title text.

```html
<jh-card>
  <div slot="jh-card-header" style="padding: var(--jh-dimension-400, 2rem)">Custom header</div>
  <div style="padding: var(--jh-dimension-400, 2rem)">content</div>
</jh-card>
```

**Gotchas**

- Use `padding` for the default slot; when you supply custom header/footer slots, pad those yourself.

**Related:** `jh-divider`, `jh-list-group`

### Checkbox (`jh-checkbox`)

Toggles a single independent boolean option on or off.

**Import:** `@jack-henry/jh-elements/components/checkbox/checkbox.js`

**When to use**

- A single opt-in/opt-out choice — accept terms, enable a setting.
- Selecting any number of options from a set — wrap several in a `jh-checkbox-group`.

**When not to use**

- For one choice among mutually exclusive options — use `jh-radio` / `jh-radio-group`.
- For an immediate on/off device-style setting — use `jh-switch`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Text shown beside the checkbox. |
| `checked` | `boolean` | `false` | Whether the box is checked. |
| `disabled` | `boolean` | `false` | Disables interaction. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-change` | Fires when checked state changes. | `(e.target as HTMLInputElement).checked` |

**Examples**

_Single checkbox_ — A standalone agreement or opt-in.

```html
<jh-checkbox label="I agree to the terms"></jh-checkbox>
```

**Gotchas**

- Read the boolean from `(e.target as HTMLInputElement).checked`, not `.value`.

**Related:** `jh-checkbox-group`, `jh-radio`, `jh-switch`

### Checkbox Group (`jh-checkbox-group`)

Groups related checkboxes under a shared label for multi-select choices.

**Import:** `@jack-henry/jh-elements/components/checkbox-group/checkbox-group.js`

**When to use**

- Letting the user pick zero or more options from a related set — alert types, account features.

**When not to use**

- For a single standalone checkbox — use `jh-checkbox` directly.
- For exactly one choice — use `jh-radio-group`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group label describing the set of options. |

**Slots**

- (default) — Default slot — place `jh-checkbox` elements inside.

**Examples**

_Grouped options_ — Choose any combination of alert preferences.

```html
<jh-checkbox-group label="Send me alerts for">
  <jh-checkbox label="Large transactions"></jh-checkbox>
  <jh-checkbox label="Low balance"></jh-checkbox>
  <jh-checkbox label="New statements"></jh-checkbox>
</jh-checkbox-group>
```

**Gotchas**

- The group provides the shared label and layout; each option is still a `jh-checkbox`.

**Related:** `jh-checkbox`, `jh-radio-group`

### Divider (`jh-divider`)

A thin rule that separates content horizontally or vertically.

**Import:** `@jack-henry/jh-elements/components/divider/divider.js`

**When to use**

- Visually separating sections or groups within a surface.
- Splitting inline items with a vertical rule.

**When not to use**

- Between list rows — `jh-list-item` has a `show-divider` prop for that.
- As decoration where whitespace alone would read more cleanly.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | Direction of the rule. |

**Examples**

_Horizontal divider_ — Separate two stacked sections.

```html
<jh-divider></jh-divider>
```

_Vertical divider_ — Separate inline items in a row.

```html
<jh-divider orientation="vertical"></jh-divider>
```

**Gotchas**

- A vertical divider needs a parent with a defined height to be visible.

**Related:** `jh-card`

### Email Input (`jh-input-email`)

Text field specialized for email entry, with email keyboard and format validation.

**Import:** `@jack-henry/jh-elements/components/input-email/input-email.js`

**When to use**

- Collecting an email address — sign-in, contact info, statement delivery.

**When not to use**

- For non-email text — use `jh-input`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label. |
| `placeholder` | `string` | — | Hint text when empty. |
| `value` | `string` | — | Current value. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `error-text` | `string` | — | Error message and error state. |
| `helper-text` | `string` | — | Supporting text below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires as the user types. | `(e.target as HTMLInputElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLInputElement).value` |

**Examples**

_Email field_ — Standard required email capture.

```html
<jh-input-email label="Email address" placeholder="you@example.com" required></jh-input-email>
```

**Gotchas**

- Shares the same API as `jh-input`; prefer this variant so the browser surfaces the email keyboard and built-in format hints.

**Related:** `jh-input`

### Icon (`jh-icon`)

Renders a JH icon at a standard size; individual glyphs ship as their own elements.

**Import:** `@jack-henry/jh-elements/components/icon/icon.js`

**When to use**

- Adding a recognizable glyph to reinforce an action, status, or list row.
- Sizing icons consistently via the shared size scale.

**When not to use**

- As the only label on an interactive control without an accessible name — pair with text or a tooltip.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'x-small' \| 'small' \| 'medium' \| 'large' \| 'x-large'` | `medium` | Icon size from the shared scale. |

**Examples**

_Using a named icon_ — Import the specific icon element from @jack-henry/jh-icons and render it at a chosen size.

```html
<jh-icon-house size="medium"></jh-icon-house>
```

**Gotchas**

- Each glyph is a separate element imported from `@jack-henry/jh-icons/icons-wc/icon-<name>.js` and used as `<jh-icon-<name>>`.
- Icon-only buttons need an accessible label (e.g. a `jh-tooltip` or `aria-label`).

**Related:** `jh-button`, `jh-list-item`

### Input (`jh-input`)

Single-line text field for free-form entry, with label, helper, and error states.

**Import:** `@jack-henry/jh-elements/components/input/input.js`

**When to use**

- Collecting a single line of free-form text — names, account nicknames, memos.
- Any field that needs a label, helper text, or inline validation messaging.

**When not to use**

- For email, phone, password, or search — use the specialized input that adds the right keyboard, validation, and affordances.
- For multi-line text — use `jh-input-textarea`.
- For choosing from a fixed set of options — use `jh-select` or radios.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label shown above the control. |
| `placeholder` | `string` | — | Hint text shown when the field is empty. |
| `value` | `string` | — | Current field value. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `error-text` | `string` | — | Error message; also puts the field in an error state. |
| `helper-text` | `string` | — | Supporting text shown below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires on each keystroke as the user types. | `(e.target as HTMLInputElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLInputElement).value` |

**Examples**

_Basic field_ — A standard labeled text field with placeholder guidance.

```html
<jh-input label="Account nickname" placeholder="e.g. Vacation fund"></jh-input>
```

_Reading the value_ — Capture input into component state as the user types.

```html
<jh-input label="Name" @jh-input=${this._handleInput}></jh-input>
```

_Error state_ — Show inline validation feedback after a failed check.

```html
<jh-input label="Routing number" error-text="Must be 9 digits"></jh-input>
```

**Gotchas**

- Read the value from events via `(e.target as HTMLInputElement).value`, or synchronously with `this.renderRoot.querySelector('jh-input')?.value`.
- Setting `error-text` both displays the message and switches the field into its error styling.

**Related:** `jh-input-email`, `jh-input-password`, `jh-input-search`, `jh-input-telephone`, `jh-input-textarea`, `jh-select`

### List Group (`jh-list-group`)

A container that groups list items under an optional subheader.

**Import:** `@jack-henry/jh-elements/components/list-group/list-group.js`

**When to use**

- Displaying a set of records or navigation rows — accounts, transactions, people.
- Adding a section subheader above a group of `jh-list-item`s.

**When not to use**

- For tabular data with multiple columns — use `jh-table`.
- For a single content surface — use `jh-card`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Subheader shown above the group. |
| `accessible-label` | `string` | — | Accessible name when no visible label is shown. |

**Slots**

- (default) — Default slot — place `jh-list-item` elements inside.

**Examples**

_Labeled list_ — A titled group of static records.

```html
<jh-list-group label="Accounts">
  <jh-list-item primary-text="Checking ···1234" secondary-text="$4,200.00"></jh-list-item>
  <jh-list-item primary-text="Savings ···5678" secondary-text="$12,500.00"></jh-list-item>
</jh-list-group>
```

**Gotchas**

- Provide `accessible-label` when you omit a visible `label` so the group is still named for assistive tech.

**Related:** `jh-list-item`, `jh-table`

### List Item (`jh-list-item`)

A single row showing primary/secondary text and metadata, with optional leading/trailing slots.

**Import:** `@jack-henry/jh-elements/components/list-item/list-item.js`

**When to use**

- Representing one record or navigation row inside a `jh-list-group` or `jh-menu`.
- Building selectable or clickable rows with leading icons and trailing metadata.

**When not to use**

- As a multi-column data row — use `jh-table-row`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primary-text` | `string` | — | Main line of text. |
| `secondary-text` | `string` | — | Secondary line below the primary text. |
| `primary-metadata` | `string` | — | Primary metadata aligned to the trailing edge. |
| `secondary-metadata` | `string` | — | Secondary trailing metadata. |
| `selected` | `boolean` | `false` | Selected/active styling. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `show-divider` | `boolean` | `false` | Shows a divider below the row. |
| `divider-inset` | `boolean` | `false` | Insets the divider to align with content. |

**Slots**

- `jh-list-item-left` — Leading element, e.g. an icon or avatar.
- `jh-list-item-content` — Custom main content (alternative to primary/secondary text).
- `jh-list-item-metadata` — Custom trailing metadata content.
- `jh-list-item-right` — Trailing element, e.g. a chevron or action.

**Examples**

_Selectable row_ — An interactive, keyboard-focusable row with selection state.

```html
<jh-list-item
  primary-text=${item.label}
  secondary-text=${item.balance}
  tabindex="0"
  ?selected=${this._selected === item.id}
  @click=${() => { this._selected = item.id }}
></jh-list-item>
```

_With leading icon and metadata slots_ — A row with an avatar/icon on the left and metadata on the right.

```html
<jh-list-item>
  <jh-icon-user slot="jh-list-item-left"></jh-icon-user>
  <div slot="jh-list-item-content">Ivan Gutierrez</div>
  <div slot="jh-list-item-metadata">Admin</div>
</jh-list-item>
```

**Gotchas**

- When used as an option inside `jh-select`, use `value` and `label` attributes instead of `primary-text` — those are select-specific.
- Add `tabindex="0"` and a key handler for keyboard-accessible interactive rows.

**Related:** `jh-list-group`, `jh-menu`, `jh-select`

### Menu (`jh-menu`)

A list of actions or options, typically shown from a trigger.

**Import:** `@jack-henry/jh-elements/components/menu/menu.js`

**When to use**

- Offering a set of actions or choices in an overflow/context menu — row actions, "more" menus.

**When not to use**

- For a primary, always-visible navigation list — use `jh-list-group`.
- For choosing a form value — use `jh-select`.

**Slots**

- (default) — Default slot — place `jh-list-item` elements as menu options.

**Examples**

_Action menu_ — A small set of row-level actions.

```html
<jh-menu>
  <jh-list-item primary-text="Edit"></jh-list-item>
  <jh-list-item primary-text="Duplicate"></jh-list-item>
  <jh-list-item primary-text="Delete"></jh-list-item>
</jh-menu>
```

**Gotchas**

- Menu options are `jh-list-item` elements, same as in a list group.

**Related:** `jh-list-item`, `jh-select`

### Notification (`jh-notification`)

Inline or full-width message conveying status — success, info, or error.

**Import:** `@jack-henry/jh-elements/components/notification/notification.js`

**When to use**

- Communicating the result of an action or a persistent state — validation errors, save success, system info.
- Use `type="alert"` for inline, contextual messages and `type="banner"` for page-level announcements.

**When not to use**

- For brief, transient confirmations that auto-dismiss — use `jh-toast`.
- For a numeric count indicator — use `jh-badge`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'alert' \| 'banner'` | — | alert = inline message; banner = full-width top-of-page message. |
| `appearance` | `'positive' \| 'neutral' \| 'negative'` | — | positive = success, negative = error, neutral = info/warning. |

**Slots**

- (default) — Default slot — the message content (text is slotted, not an attribute).

**Examples**

_Inline error_ — Surface a failure near the affected content.

```html
<jh-notification type="alert" appearance="negative">Something went wrong</jh-notification>
```

_Inline success_ — Confirm an action succeeded.

```html
<jh-notification type="alert" appearance="positive">Saved successfully!</jh-notification>
```

_Page banner_ — Announce a system-wide condition at the top of the page.

```html
<jh-notification type="banner" appearance="negative">System maintenance scheduled.</jh-notification>
```

**Gotchas**

- The message is slotted content, not a `message` attribute.
- Map appearance to meaning: negative = error, positive = success, neutral = info/warning.

**Related:** `jh-toast`, `jh-badge`

### Password Input (`jh-input-password`)

Masked text field for secret entry, with a show/hide affordance.

**Import:** `@jack-henry/jh-elements/components/input-password/input-password.js`

**When to use**

- Collecting a password or other secret the user should not see in plain text by default.

**When not to use**

- For non-secret values — use `jh-input`.
- For one-time codes you want visible — a plain `jh-input` is usually clearer.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label. |
| `placeholder` | `string` | — | Hint text when empty. |
| `value` | `string` | — | Current value. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `error-text` | `string` | — | Error message and error state. |
| `helper-text` | `string` | — | Supporting text below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires as the user types. | `(e.target as HTMLInputElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLInputElement).value` |

**Examples**

_Password field_ — Required masked entry with a hint about requirements.

```html
<jh-input-password label="Password" required helper-text="At least 12 characters"></jh-input-password>
```

**Gotchas**

- Includes a built-in show/hide toggle — do not add your own.

**Related:** `jh-input`

### Progress (`jh-progress`)

A bar showing completion toward a known total.

**Import:** `@jack-henry/jh-elements/components/progress/progress.js`

**When to use**

- Showing determinate progress — multi-step flow completion, upload percentage, goal funding.

**When not to use**

- For a button-local loading state — use the button's `pending` prop.
- For indeterminate waits with no known total — prefer a spinner/pending affordance.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current progress, from 0 to max. |
| `max` | `number` | `100` | The value representing 100% complete. |

**Examples**

_Step progress_ — Show how far through a multi-step flow the user is.

```html
<jh-progress value="60" max="100"></jh-progress>
```

_Bound to state_ — Drive the bar from a reactive percentage.

```html
<jh-progress value=${this._percent} max="100"></jh-progress>
```

**Gotchas**

- Keep `value` within 0–`max`; values outside the range clamp.

**Related:** `jh-button`

### Radio (`jh-radio`)

A single option within a mutually exclusive set of choices.

**Import:** `@jack-henry/jh-elements/components/radio/radio.js`

**When to use**

- Presenting one option among a small, mutually exclusive set — always inside a `jh-radio-group`.

**When not to use**

- For multi-select — use `jh-checkbox`.
- For more than ~6 options — use `jh-select` to save space.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Text shown beside the radio. |
| `value` | `string` | — | Value submitted when this option is selected. |
| `checked` | `boolean` | `false` | Whether this option is selected. |
| `name` | `string` | — | Group name tying mutually exclusive radios together. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-change` | Fires when this radio becomes selected. | `(e.target as HTMLInputElement).value` |

**Examples**

_Radio option_ — A single choice rendered within a radio group.

```html
<jh-radio name="delivery" value="email" label="Email"></jh-radio>
```

**Gotchas**

- Radios must share a `name` (or live in one `jh-radio-group`) to behave as mutually exclusive.

**Related:** `jh-radio-group`, `jh-checkbox`, `jh-select`

### Radio Group (`jh-radio-group`)

Groups radios under a shared label so the user picks exactly one option.

**Import:** `@jack-henry/jh-elements/components/radio-group/radio-group.js`

**When to use**

- Choosing exactly one option from a small visible set — delivery method, account type.

**When not to use**

- For multi-select — use `jh-checkbox-group`.
- For long option lists — use `jh-select`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group label describing the choice. |
| `name` | `string` | — | Shared name applied to the radios within. |

**Slots**

- (default) — Default slot — place `jh-radio` elements inside.

**Examples**

_Single-choice group_ — Pick exactly one statement delivery method.

```html
<jh-radio-group label="Statement delivery" name="delivery">
  <jh-radio value="email" label="Email"></jh-radio>
  <jh-radio value="mail" label="Paper mail"></jh-radio>
</jh-radio-group>
```

**Gotchas**

- Keep options visible and few; beyond a handful, a `jh-select` reads more cleanly.

**Related:** `jh-radio`, `jh-checkbox-group`, `jh-select`

### Search Input (`jh-input-search`)

Text field specialized for search, with a search icon and clear affordance.

**Import:** `@jack-henry/jh-elements/components/input-search/input-search.js`

**When to use**

- Filtering or searching a list, table, or gallery.
- Any field whose purpose is to narrow results rather than capture a stored value.

**When not to use**

- For values you persist on submit — use `jh-input`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Accessible label for the search field. |
| `placeholder` | `string` | — | Hint text when empty. |
| `value` | `string` | — | Current query. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `helper-text` | `string` | — | Supporting text below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires as the user types — wire this to live filtering. | `(e.target as HTMLInputElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLInputElement).value` |

**Examples**

_Live filter_ — Filter a list as the user types by storing the query in state.

```html
<jh-input-search
  label="Search prototypes"
  placeholder="Search by name or tag..."
  @jh-input=${(e) => { this._search = e.target.value }}
></jh-input-search>
```

**Gotchas**

- Provide a `label` even when visually minimal — it is the accessible name for the field.

**Related:** `jh-input`

### Select (`jh-select`)

Dropdown for choosing one option from a list, with label and validation states.

**Import:** `@jack-henry/jh-elements/components/select/select.js`

**When to use**

- Choosing one option from a longer list where showing all choices would crowd the layout — state, account, category.

**When not to use**

- For a small set of visible options — radios are faster to scan.
- For multi-select — use a `jh-checkbox-group`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label. |
| `placeholder` | `string` | — | Text shown before a selection is made. |
| `value` | `string` | — | Currently selected value. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `error-text` | `string` | — | Error message and error state. |
| `helper-text` | `string` | — | Supporting text below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-change` | Fires when the selection changes. | `(e.target as HTMLSelectElement).value` |

**Slots**

- (default) — Default slot — place `jh-list-item` options with `value` and `label` attributes.

**Examples**

_Basic select_ — Choose an account type from a fixed list.

```html
<jh-select label="Account type" required>
  <jh-list-item value="checking" label="Checking"></jh-list-item>
  <jh-list-item value="savings" label="Savings"></jh-list-item>
  <jh-list-item value="money-market" label="Money Market"></jh-list-item>
</jh-select>
```

**Gotchas**

- Options are `jh-list-item` elements, but inside a select use the `value` and `label` attributes (not `primary-text`).
- For datasets like US states, pair with `@jack-henry/jh-datasets` helpers to populate and pre-select options.

**Related:** `jh-list-item`, `jh-radio-group`

### Switch (`jh-switch`)

Toggles a setting on or off, typically taking effect immediately.

**Import:** `@jack-henry/jh-elements/components/switch/switch.js`

**When to use**

- A binary setting that applies right away — enable notifications, dark mode, paperless.

**When not to use**

- For choices confirmed later on form submit — a `jh-checkbox` sets the right expectation.
- For mutually exclusive options — use radios.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Text describing the setting. |
| `checked` | `boolean` | `false` | Whether the switch is on. |
| `disabled` | `boolean` | `false` | Disables interaction. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-change` | Fires when toggled. | `(e.target as HTMLInputElement).checked` |

**Examples**

_Setting toggle_ — An immediately-applied account setting.

```html
<jh-switch label="Paperless statements" checked></jh-switch>
```

**Gotchas**

- Switches imply the change is immediate — if you need a save step, prefer `jh-checkbox`.

**Related:** `jh-checkbox`

### Table (`jh-table`)

A data table that arranges rows and columns of structured records.

**Import:** `@jack-henry/jh-elements/components/table/table.js`

**When to use**

- Displaying structured, multi-column data that benefits from aligned columns — transactions, reports.
- When users need to scan or compare values across rows.

**When not to use**

- For single-column lists of records — use `jh-list-group` / `jh-list-item`.
- For dense key/value detail of one record — a definition layout reads better.

**Slots**

- `header` — A `jh-table-row` (slot="header") of `jh-table-header-cell`s.
- (default) — Default slot — body `jh-table-row` elements.

**Examples**

_Basic table_ — Render a header row plus data rows from a list.

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

**Gotchas**

- The header is a `jh-table-row` with `slot="header"`; body rows go in the default slot.

**Related:** `jh-table-row`, `jh-table-header-cell`, `jh-table-data-cell`, `jh-list-group`

### Table Data Cell (`jh-table-data-cell`)

A body cell holding one value within a table row.

**Import:** `@jack-henry/jh-elements/components/table-data-cell/table-data-cell.js`

**When to use**

- Holding a single value in a body `jh-table-row`; content is slotted.

**When not to use**

- For column headers — use `jh-table-header-cell`.

**Slots**

- (default) — Default slot — the cell value (text or markup).

**Examples**

_Data cell_ — Render a value inside a body row.

```html
<jh-table-data-cell>$4,200.00</jh-table-data-cell>
```

**Gotchas**

- Cell content is slotted children, not a `label` attribute (unlike the header cell).

**Related:** `jh-table`, `jh-table-row`, `jh-table-header-cell`

### Table Header Cell (`jh-table-header-cell`)

A column header cell within a table header row.

**Import:** `@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js`

**When to use**

- Labeling a column inside a `jh-table-row` with `slot="header"`.

**When not to use**

- For body cells — use `jh-table-data-cell`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Column header text. |

**Examples**

_Header cells_ — Define the columns of a table header row.

```html
<jh-table-row slot="header">
  <jh-table-header-cell label="Account"></jh-table-header-cell>
  <jh-table-header-cell label="Balance"></jh-table-header-cell>
</jh-table-row>
```

**Gotchas**

- Header cells belong in the row marked `slot="header"`, not in body rows.

**Related:** `jh-table`, `jh-table-row`, `jh-table-data-cell`

### Table Row (`jh-table-row`)

A row within a table — a header row or a body row of cells.

**Import:** `@jack-henry/jh-elements/components/table-row/table-row.js`

**When to use**

- Grouping header cells (`slot="header"`) or data cells into a single table row.

**When not to use**

- For a single-column list row — use `jh-list-item`.

**Slots**

- (default) — Default slot — `jh-table-header-cell` or `jh-table-data-cell` elements.

**Examples**

_Body row_ — A row of data cells in the table body.

```html
<jh-table-row>
  <jh-table-data-cell>Checking ···1234</jh-table-data-cell>
  <jh-table-data-cell>$4,200.00</jh-table-data-cell>
</jh-table-row>
```

**Gotchas**

- Add `slot="header"` to the row that contains header cells.

**Related:** `jh-table`, `jh-table-header-cell`, `jh-table-data-cell`

### Tag (`jh-tag`)

A compact text label for statuses, categories, or removable selections.

**Import:** `@jack-henry/jh-elements/components/tag/tag.js`

**When to use**

- Showing a short text status or category — "Active", "Pending", "Savings".
- Representing removable selections, e.g. applied filters, via `removable`.

**When not to use**

- For numeric counts or dot indicators — use `jh-badge`.
- As a clickable action — use `jh-button`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Tag text. |
| `removable` | `boolean` | `false` | Shows a remove affordance for dismissible tags. |

**Examples**

_Status tag_ — Label a record with its current status.

```html
<jh-tag label="Active"></jh-tag>
```

_Removable tag_ — An applied filter the user can clear.

```html
<jh-tag label="Checking" removable></jh-tag>
```

**Gotchas**

- Use tags for text indicators; for counts use `jh-badge`.

**Related:** `jh-tag-group`, `jh-badge`

### Tag Group (`jh-tag-group`)

Lays out a set of related tags with consistent spacing and wrapping.

**Import:** `@jack-henry/jh-elements/components/tag-group/tag-group.js`

**When to use**

- Displaying multiple tags together — a list of categories, applied filters, or attributes.

**When not to use**

- For a single tag — use `jh-tag` on its own.

**Slots**

- (default) — Default slot — place `jh-tag` elements inside.

**Examples**

_Tag set_ — Show several categories on a record.

```html
<jh-tag-group>
  <jh-tag label="Transfers"></jh-tag>
  <jh-tag label="Recurring"></jh-tag>
  <jh-tag label="Savings"></jh-tag>
</jh-tag-group>
```

**Gotchas**

- Handles spacing and wrapping for you — avoid adding custom margins to the inner tags.

**Related:** `jh-tag`

### Telephone Input (`jh-input-telephone`)

Text field specialized for phone numbers, with telephone keyboard and formatting.

**Import:** `@jack-henry/jh-elements/components/input-telephone/input-telephone.js`

**When to use**

- Collecting a phone number — contact info, two-factor setup, alerts.

**When not to use**

- For arbitrary numeric input that is not a phone number — use `jh-input`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label. |
| `placeholder` | `string` | — | Hint text when empty. |
| `value` | `string` | — | Current value. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `error-text` | `string` | — | Error message and error state. |
| `helper-text` | `string` | — | Supporting text below the field. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires as the user types. | `(e.target as HTMLInputElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLInputElement).value` |

**Examples**

_Phone field_ — Capture a mobile number for alerts.

```html
<jh-input-telephone label="Mobile number" placeholder="(555) 555-5555"></jh-input-telephone>
```

**Gotchas**

- Surfaces the telephone keypad on mobile; prefer it over `jh-input` for phone entry.

**Related:** `jh-input`

### Textarea (`jh-input-textarea`)

Multi-line text field for longer free-form entry.

**Import:** `@jack-henry/jh-elements/components/input-textarea/input-textarea.js`

**When to use**

- Collecting more than one line of text — notes, memos, descriptions, messages.

**When not to use**

- For single-line values — use `jh-input`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label. |
| `rows` | `number` | — | Visible number of text rows. |
| `placeholder` | `string` | — | Hint text when empty. |
| `value` | `string` | — | Current value. |
| `disabled` | `boolean` | `false` | Disables interaction. |

**Events**

| Event | Description | Read value |
|-------|-------------|------------|
| `jh-input` | Fires as the user types. | `(e.target as HTMLTextAreaElement).value` |
| `jh-change` | Fires on blur or commit. | `(e.target as HTMLTextAreaElement).value` |

**Examples**

_Memo field_ — Capture a multi-line note on a transfer.

```html
<jh-input-textarea label="Memo" rows="4" placeholder="Add a note..."></jh-input-textarea>
```

**Gotchas**

- Use `rows` to size the initial height to the expected content length.

**Related:** `jh-input`

### Toast (`jh-toast`)

A brief, transient message that confirms an action and auto-dismisses.

**Import:** `@jack-henry/jh-elements/components/toast/toast.js`

**When to use**

- Confirming a quick, successful action without interrupting the flow — "Copied", "Transfer sent".

**When not to use**

- For persistent or important state the user must act on — use `jh-notification`.
- For errors that need attention or retry — use an inline `jh-notification`.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | — | The toast text. |
| `type` | `string` | — | Visual style of the toast (e.g. success/info). |

**Examples**

_Confirmation toast_ — Briefly confirm a completed action.

```html
<jh-toast message="Transfer sent" type="success"></jh-toast>
```

**Gotchas**

- Toasts are transient — never put critical information or required actions in one.

**Related:** `jh-notification`

### Tooltip (`jh-tooltip`)

A small popover that explains a trigger element on hover or focus.

**Import:** `@jack-henry/jh-elements/components/tooltip/tooltip.js`

**When to use**

- Clarifying an icon-only control or terse label with a short hint.
- Offering supplementary detail that is not essential to complete the task.

**When not to use**

- For essential instructions — use visible helper text instead; tooltips are easy to miss and inaccessible on touch.
- For rich or interactive content — use a popover/dialog.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | The tooltip text. |

**Slots**

- (default) — Default slot — the trigger element the tooltip wraps.

**Examples**

_Icon explanation_ — Explain what an icon-only button does.

```html
<jh-tooltip content="Refresh balances">
  <jh-button label="Refresh" appearance="tertiary"></jh-button>
</jh-tooltip>
```

**Gotchas**

- Tooltips are non-essential by nature — never hide required information behind one.

**Related:** `jh-button`

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
