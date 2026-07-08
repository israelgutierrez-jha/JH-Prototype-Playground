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
  examples: [
    {
      title: 'Basic select',
      useCase: 'Choose an account type from a fixed list.',
      code: `const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'money-market', label: 'Money Market' },
]

// In render():
html\`
  <jh-select
    label="Account type"
    required
    .options=\${ACCOUNT_TYPE_OPTIONS}
    @jh-change=\${(e) => { this._accountType = e.target.value }}
  ></jh-select>
\``,
    },
  ],
  gotchas: [
    'Does NOT take `jh-list-item` children — options are set via the `.options` JS property (an array of `{ value, label }`, not an HTML attribute), which the component renders into its own internal list internally. Slotting `<jh-list-item>` elements directly silently renders an empty dropdown.',
    'To pre-select a value on first paint, mark that option `selected: true` in the `.options` array — setting `.value` alone after the fact will NOT update the displayed label for an option that was already rendered (see the `manageSelectDataset` helper below, or the pattern in `src/prototypes/israel-gutierrez/warning-management-v1/queue-view.ts`).',
    'For datasets like US states, pair with the `manageSelectDataset` helper from `@jack-henry/jh-datasets`, which returns `{ value, label, selected, disabled }[]` ready to pass straight into `.options`.',
  ],
  related: [
    'jh-list-item',
    'jh-radio-group',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
