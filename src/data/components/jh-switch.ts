import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-switch',
  name: 'Switch',
  import: '@jack-henry/jh-elements/components/switch/switch.js',
  summary: 'Toggles a setting on or off, typically taking effect immediately.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'A binary setting that applies right away — enable notifications, dark mode, paperless.',
  ],
  whenNotToUse: [
    'For choices confirmed later on form submit — a `jh-checkbox` sets the right expectation.',
    'For mutually exclusive options — use radios.',
  ],
  examples: [
    {
      title: 'Setting toggle',
      useCase: 'An immediately-applied account setting.',
      code: `<jh-switch label="Paperless statements" checked></jh-switch>`,
    },
  ],
  gotchas: [
    'Switches imply the change is immediate — if you need a save step, prefer `jh-checkbox`.',
  ],
  related: [
    'jh-checkbox',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
