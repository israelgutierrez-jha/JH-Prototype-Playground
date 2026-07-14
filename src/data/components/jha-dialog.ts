import type { ComponentDoc } from './types.js'

// NOTE: `jha-dialog` ships from the legacy `@banno/jha-wc` package, which has
// no Custom Elements Manifest. Its props/events/slots below are hand-authored
// from the component's source (node_modules/@banno/jha-wc/src/jha-dialog/),
// not derived — see the fallback in scripts/generate-component-docs.ts. Keep
// this in sync manually if the vendored `@banno/jha-wc` version changes.
export const doc: ComponentDoc = {
  tag: 'jha-dialog',
  name: 'Dialog (legacy)',
  import: '@banno/jha-wc/src/jha-dialog/jha-dialog.js',
  summary:
    'A confirm/cancel dialog card (heading, message, two actions) — the sanctioned fallback for prototypes that need a modal, since the current JH Design System has no dialog component yet.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Confirming a consequential or destructive action before it happens — "Delete this record?", "Continue without completing verification?".',
    'Any place a Figma design shows a centered modal/dialog and there is no `jh-elements` equivalent to map it to.',
  ],
  whenNotToUse: [
    'For a lightweight, non-blocking confirmation of something already done — use `jh-toast` instead.',
    'For a persistent inline status or validation message — use `jh-notification`.',
    'If `@jack-henry/jh-elements` ships a real dialog/modal component by the time you read this — check `node_modules/@jack-henry/jh-elements/components/` first and prefer that instead.',
  ],
  props: [
    {
      name: 'heading',
      type: 'string',
      description: 'The dialog title, shown centered in the header row.',
      tier: 'common',
    },
    {
      name: 'message-header',
      type: 'string',
      description: 'Optional secondary heading rendered above `message-body` in the default content area (ignored if you use the `dialog-content` slot).',
      tier: 'common',
    },
    {
      name: 'message-body',
      type: 'string',
      description: 'Body text of the default content area (ignored if you use the `dialog-content` slot).',
      tier: 'common',
    },
    {
      name: 'cancel-label',
      type: 'string',
      description: 'Label for the secondary/cancel button. Omitting it (or setting `hide-cancel`) hides the button entirely — there is no default label.',
      tier: 'common',
    },
    {
      name: 'confirm-label',
      type: 'string',
      default: "'OK'",
      description: 'Label for the primary/confirm button.',
      tier: 'common',
    },
    {
      name: 'confirm-appearance',
      type: "'danger' | 'success' | ''",
      default: "''",
      description: 'Styles the confirm button as destructive or affirmative. Leave empty for the default primary appearance.',
      tier: 'common',
    },
    {
      name: 'icon',
      type: "'warning' | 'success'",
      description: 'Shows a built-in status icon above the message. Omit and use the `icon` slot for a custom one.',
      tier: 'common',
    },
    {
      name: 'hide-header',
      type: 'boolean',
      default: 'false',
      description: 'Hides the entire header row (heading + close button).',
      tier: 'advanced',
    },
    {
      name: 'hide-cancel',
      type: 'boolean',
      default: 'false',
      description: 'Hides the cancel button and the header close (X) button.',
      tier: 'advanced',
    },
    {
      name: 'hide-confirm',
      type: 'boolean',
      default: 'false',
      description: 'Hides the confirm button.',
      tier: 'advanced',
    },
    {
      name: 'async',
      type: 'boolean',
      default: 'false',
      description: 'Set when the `confirm` handler performs an async action and you want the confirm button to hold a pending state until you dismiss the dialog yourself, instead of assuming the click completes immediately.',
      tier: 'advanced',
    },
    {
      name: 'disable-scrolling',
      type: 'boolean',
      default: 'false',
      description: 'Internal — reflects whether background scrolling is currently locked. Not meant to be set directly.',
      tier: 'advanced',
    },
  ],
  events: [
    {
      name: 'cancel',
      description: 'Fires when the cancel button or the header close (X) is clicked. Plain event name — not prefixed like `jh-*` events.',
    },
    {
      name: 'confirm',
      description: 'Fires when the confirm button is clicked. Plain event name — not prefixed like `jh-*` events.',
    },
  ],
  slots: [
    {
      name: 'icon',
      description: 'Custom icon content, used when the `icon` prop is not set to `warning`/`success`.',
    },
    {
      name: 'dialog-content',
      description: 'Replaces the entire default content area (icon + message-header + message-body) with custom markup — e.g. a form.',
    },
    {
      name: 'header-left',
      description: 'Content placed before the heading in the header row.',
    },
    {
      name: 'header-bottom',
      description: 'Content rendered below the header row, still inside the header region.',
    },
  ],
  examples: [
    {
      title: 'Confirm/cancel dialog with a backdrop overlay',
      useCase: 'The common case: confirming a consequential action, centered over a dimmed page. jha-dialog does not self-position as a modal — you own the overlay wrapper.',
      code: `// styles
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

// template
html\`
  <div class="dialog-overlay">
    <jha-dialog
      .heading=\${'Verification not complete'}
      .messageBody=\${'Would you like to continue without completing verification?'}
      .cancelLabel=\${'Cancel'}
      .confirmLabel=\${'Confirm'}
      @cancel=\${this._cancel}
      @confirm=\${this._confirm}
    ></jha-dialog>
  </div>
\``,
    },
    {
      title: 'Destructive confirmation',
      useCase: 'Confirming an irreversible action, e.g. deleting a record — style the confirm button as danger and give cancel-label so the user has an obvious way back.',
      code: `html\`
  <div class="dialog-overlay">
    <jha-dialog
      .heading=\${'Delete this record?'}
      .messageBody=\${'This cannot be undone.'}
      .cancelLabel=\${'Cancel'}
      .confirmLabel=\${'Delete'}
      confirm-appearance="danger"
      @cancel=\${this._cancelDelete}
      @confirm=\${this._confirmDelete}
    ></jha-dialog>
  </div>
\``,
    },
  ],
  gotchas: [
    'This is a legacy `@banno/jha-wc` component, not `@jack-henry/jh-elements` — it has no Custom Elements Manifest, so the props/events/slots here are hand-authored and verified against the vendored source rather than generated. Re-check them after a `@banno/jha-wc` version bump.',
    'It does NOT self-position as a modal — there is no backdrop and no fixed positioning built into the component. Rendered on its own it just sits inline in normal document flow. Always wrap it in your own `position: fixed; inset: 0;` backdrop div (see the first example) to get real modal behavior.',
    'Event names are plain `cancel`/`confirm`, not `jha-cancel`/`jha-confirm` like other jha-wc/jh-elements custom events.',
    'Complex/string props should be bound with Lit property syntax (`.heading=`, `.messageBody=`, etc.) rather than plain attributes — the class declares camelCase JS properties (`messageBody`, `cancelLabel`) whose default HTML attribute names are the same string lowercased with no dashes (e.g. `messagebody`), which is easy to get wrong if you hand-write attributes.',
    'Omitting `cancel-label`/`confirm-label` hides the corresponding button entirely (there is no default cancel label; confirm defaults to "OK") — this is a fast way to build a single-action acknowledgement dialog.',
    'Before reaching for this: check whether `@jack-henry/jh-elements` has since shipped a real dialog/modal component — this is a stopgap, not a permanent recommendation.',
  ],
  related: ['jh-notification', 'jh-card', 'jh-toast'],
  source: { storybookUrl: '', importedAt: '2026-07-14', componentVersion: '@banno/jha-wc@13.20.1' },
}
