import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-select',
  name: 'Select',
  import: '@jack-henry/jh-elements/components/select/select.js',
  summary: 'Dropdown for choosing one option from a list, with label and validation states.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Choosing one option from a longer list where showing all choices would crowd the layout — state, account, category.',
  ],
  whenNotToUse: [
    'For a small set of visible options — radios are faster to scan.',
    'For multi-select — use a `jh-checkbox-group`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Field label.' },
    { name: 'placeholder', type: 'string', description: 'Text shown before a selection is made.' },
    { name: 'value', type: 'string', description: 'Currently selected value.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'error-text', type: 'string', description: 'Error message and error state.' },
    { name: 'helper-text', type: 'string', description: 'Supporting text below the field.' },
  ],
  events: [
    { name: 'jh-change', description: 'Fires when the selection changes.', payload: '(e.target as HTMLSelectElement).value' },
  ],
  slots: [
    { name: '', description: 'Default slot — place `jh-list-item` options with `value` and `label` attributes.' },
  ],
  examples: [
    {
      title: 'Basic select',
      useCase: 'Choose an account type from a fixed list.',
      code: `<jh-select label="Account type" required>
  <jh-list-item value="checking" label="Checking"></jh-list-item>
  <jh-list-item value="savings" label="Savings"></jh-list-item>
  <jh-list-item value="money-market" label="Money Market"></jh-list-item>
</jh-select>`,
    },
  ],
  gotchas: [
    'Options are `jh-list-item` elements, but inside a select use the `value` and `label` attributes (not `primary-text`).',
    'For datasets like US states, pair with `@jack-henry/jh-datasets` helpers to populate and pre-select options.',
  ],
  related: ['jh-list-item', 'jh-radio-group'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
