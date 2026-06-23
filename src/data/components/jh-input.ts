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
  props: [
    { name: 'label', type: 'string', description: 'Field label shown above the control.' },
    { name: 'placeholder', type: 'string', description: 'Hint text shown when the field is empty.' },
    { name: 'value', type: 'string', description: 'Current field value.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'error-text', type: 'string', description: 'Error message; also puts the field in an error state.' },
    { name: 'helper-text', type: 'string', description: 'Supporting text shown below the field.' },
  ],
  events: [
    { name: 'jh-input', description: 'Fires on each keystroke as the user types.', payload: '(e.target as HTMLInputElement).value' },
    { name: 'jh-change', description: 'Fires on blur or commit.', payload: '(e.target as HTMLInputElement).value' },
  ],
  examples: [
    {
      title: 'Basic field',
      useCase: 'A standard labeled text field with placeholder guidance.',
      code: `<jh-input label="Account nickname" placeholder="e.g. Vacation fund"></jh-input>`,
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
  related: ['jh-input-email', 'jh-input-password', 'jh-input-search', 'jh-input-telephone', 'jh-input-textarea', 'jh-select'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
