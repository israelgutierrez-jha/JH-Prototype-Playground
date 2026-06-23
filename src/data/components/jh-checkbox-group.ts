import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-checkbox-group',
  name: 'Checkbox Group',
  import: '@jack-henry/jh-elements/components/checkbox-group/checkbox-group.js',
  summary: 'Groups related checkboxes under a shared label for multi-select choices.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Letting the user pick zero or more options from a related set — alert types, account features.',
  ],
  whenNotToUse: [
    'For a single standalone checkbox — use `jh-checkbox` directly.',
    'For exactly one choice — use `jh-radio-group`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Group label describing the set of options.' },
  ],
  slots: [
    { name: '', description: 'Default slot — place `jh-checkbox` elements inside.' },
  ],
  examples: [
    {
      title: 'Grouped options',
      useCase: 'Choose any combination of alert preferences.',
      code: `<jh-checkbox-group label="Send me alerts for">
  <jh-checkbox label="Large transactions"></jh-checkbox>
  <jh-checkbox label="Low balance"></jh-checkbox>
  <jh-checkbox label="New statements"></jh-checkbox>
</jh-checkbox-group>`,
    },
  ],
  gotchas: [
    'The group provides the shared label and layout; each option is still a `jh-checkbox`.',
  ],
  related: ['jh-checkbox', 'jh-radio-group'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
