import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-checkbox',
  name: 'Checkbox',
  import: '@jack-henry/jh-elements/components/checkbox/checkbox.js',
  summary: 'Toggles a single independent boolean option on or off.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'A single opt-in/opt-out choice — accept terms, enable a setting.',
    'Selecting any number of options from a set — wrap several in a `jh-checkbox-group`.',
  ],
  whenNotToUse: [
    'For one choice among mutually exclusive options — use `jh-radio` / `jh-radio-group`.',
    'For an immediate on/off device-style setting — use `jh-switch`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Text shown beside the checkbox.' },
    { name: 'checked', type: 'boolean', default: 'false', description: 'Whether the box is checked.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
  ],
  events: [
    { name: 'jh-change', description: 'Fires when checked state changes.', payload: '(e.target as HTMLInputElement).checked' },
  ],
  examples: [
    {
      title: 'Single checkbox',
      useCase: 'A standalone agreement or opt-in.',
      code: `<jh-checkbox label="I agree to the terms"></jh-checkbox>`,
    },
  ],
  gotchas: [
    'Read the boolean from `(e.target as HTMLInputElement).checked`, not `.value`.',
  ],
  related: ['jh-checkbox-group', 'jh-radio', 'jh-switch'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
