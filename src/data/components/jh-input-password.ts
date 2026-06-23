import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-password',
  name: 'Password Input',
  import: '@jack-henry/jh-elements/components/input-password/input-password.js',
  summary: 'Masked text field for secret entry, with a show/hide affordance.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting a password or other secret the user should not see in plain text by default.',
  ],
  whenNotToUse: [
    'For non-secret values — use `jh-input`.',
    'For one-time codes you want visible — a plain `jh-input` is usually clearer.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Field label.' },
    { name: 'placeholder', type: 'string', description: 'Hint text when empty.' },
    { name: 'value', type: 'string', description: 'Current value.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'error-text', type: 'string', description: 'Error message and error state.' },
    { name: 'helper-text', type: 'string', description: 'Supporting text below the field.' },
  ],
  events: [
    { name: 'jh-input', description: 'Fires as the user types.', payload: '(e.target as HTMLInputElement).value' },
    { name: 'jh-change', description: 'Fires on blur or commit.', payload: '(e.target as HTMLInputElement).value' },
  ],
  examples: [
    {
      title: 'Password field',
      useCase: 'Required masked entry with a hint about requirements.',
      code: `<jh-input-password label="Password" required helper-text="At least 12 characters"></jh-input-password>`,
    },
  ],
  gotchas: [
    'Includes a built-in show/hide toggle — do not add your own.',
  ],
  related: ['jh-input'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
