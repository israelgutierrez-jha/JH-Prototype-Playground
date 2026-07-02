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
  examples: [
    {
      title: 'Phone field',
      useCase: 'Capture a mobile number for alerts.',
      code: `<jh-input-telephone label="Mobile number" helper-text="Format: (555) 555-5555"></jh-input-telephone>`,
    },
  ],
  gotchas: [
    'Surfaces the telephone keypad on mobile; prefer it over `jh-input` for phone entry.',
  ],
  related: [
    'jh-input',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
