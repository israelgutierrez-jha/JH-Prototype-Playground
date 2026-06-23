import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-telephone',
  name: 'Telephone Input',
  import: '@jack-henry/jh-elements/components/input-telephone/input-telephone.js',
  summary: 'Text field specialized for phone numbers, with telephone keyboard and formatting.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting a phone number — contact info, two-factor setup, alerts.',
  ],
  whenNotToUse: [
    'For arbitrary numeric input that is not a phone number — use `jh-input`.',
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
      title: 'Phone field',
      useCase: 'Capture a mobile number for alerts.',
      code: `<jh-input-telephone label="Mobile number" placeholder="(555) 555-5555"></jh-input-telephone>`,
    },
  ],
  gotchas: [
    'Surfaces the telephone keypad on mobile; prefer it over `jh-input` for phone entry.',
  ],
  related: ['jh-input'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
