import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-radio',
  name: 'Radio',
  import: '@jack-henry/jh-elements/components/radio/radio.js',
  summary: 'A single option within a mutually exclusive set of choices.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Presenting one option among a small, mutually exclusive set — always inside a `jh-radio-group`.',
  ],
  whenNotToUse: [
    'For multi-select — use `jh-checkbox`.',
    'For more than ~6 options — use `jh-select` to save space.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Text shown beside the radio.' },
    { name: 'value', type: 'string', description: 'Value submitted when this option is selected.' },
    { name: 'checked', type: 'boolean', default: 'false', description: 'Whether this option is selected.' },
    { name: 'name', type: 'string', description: 'Group name tying mutually exclusive radios together.' },
  ],
  events: [
    { name: 'jh-change', description: 'Fires when this radio becomes selected.', payload: '(e.target as HTMLInputElement).value' },
  ],
  examples: [
    {
      title: 'Radio option',
      useCase: 'A single choice rendered within a radio group.',
      code: `<jh-radio name="delivery" value="email" label="Email"></jh-radio>`,
    },
  ],
  gotchas: [
    'Radios must share a `name` (or live in one `jh-radio-group`) to behave as mutually exclusive.',
  ],
  related: ['jh-radio-group', 'jh-checkbox', 'jh-select'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
