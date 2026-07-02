import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input',
  name: 'Input',
  import: '@jack-henry/jh-elements/components/input/input.js',
  summary: 'Single-line text field for free-form entry, with label, helper, and error states.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting a single line of free-form text — names, account nicknames, memos.',
    'Any field that needs a label, helper text, or inline validation messaging.',
  ],
  whenNotToUse: [
    'For email, phone, password, or search — use the specialized input that adds the right keyboard, validation, and affordances.',
    'For multi-line text — use `jh-input-textarea`.',
    'For choosing from a fixed set of options — use `jh-select` or radios.',
  ],
  examples: [
    {
      title: 'Basic field',
      useCase: 'A standard labeled text field with helper-text guidance.',
      code: `<jh-input label="Account nickname" helper-text="e.g. Vacation fund"></jh-input>`,
    },
    {
      title: 'Reading the value',
      useCase: 'Capture input into component state as the user types.',
      code: `<jh-input label="Name" @jh-input=\${this._handleInput}></jh-input>`,
    },
    {
      title: 'Error state',
      useCase: 'Show inline validation feedback after a failed check.',
      code: `<jh-input label="Routing number" error-text="Must be 9 digits"></jh-input>`,
    },
  ],
  gotchas: [
    'Read the value from events via `(e.target as HTMLInputElement).value`, or synchronously with `this.renderRoot.querySelector(\'jh-input\')?.value`.',
    'Setting `error-text` both displays the message and switches the field into its error styling.',
  ],
  related: [
    'jh-input-email',
    'jh-input-password',
    'jh-input-search',
    'jh-input-telephone',
    'jh-input-textarea',
    'jh-select',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
