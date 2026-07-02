import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-list-group',
  name: 'List Group',
  import: '@jack-henry/jh-elements/components/list-group/list-group.js',
  summary: 'A container that groups list items under an optional subheader.',
  category: 'lists',
  status: 'stable',
  whenToUse: [
    'Displaying a set of records or navigation rows — accounts, transactions, people.',
    'Adding a section subheader above a group of `jh-list-item`s.',
  ],
  whenNotToUse: [
    'For tabular data with multiple columns — use `jh-table`.',
    'For a single content surface — use `jh-card`.',
  ],
  examples: [
    {
      title: 'Labeled list',
      useCase: 'A titled group of static records.',
      code: `<jh-list-group label="Accounts">
  <jh-list-item primary-text="Checking ···1234" secondary-text="$4,200.00"></jh-list-item>
  <jh-list-item primary-text="Savings ···5678" secondary-text="$12,500.00"></jh-list-item>
</jh-list-group>`,
    },
  ],
  gotchas: [
    'Provide `accessible-label` when you omit a visible `label` so the group is still named for assistive tech.',
  ],
  related: [
    'jh-list-item',
    'jh-table',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
