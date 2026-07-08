import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-table-header-cell',
  name: 'Table Header Cell',
  import: '@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js',
  summary: 'A column header cell within a table header row.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Labeling a column inside a `jh-table-row` with `slot="jh-table-header"`.',
  ],
  whenNotToUse: [
    'For body cells — use `jh-table-data-cell`.',
  ],
  examples: [
    {
      title: 'Header cells',
      useCase: 'Define the columns of a table header row. The header text is slotted content.',
      code: `<jh-table>
  <jh-table-row slot="jh-table-header">
    <jh-table-header-cell>Account</jh-table-header-cell>
    <jh-table-header-cell sortable>Balance</jh-table-header-cell>
  </jh-table-row>
</jh-table>`,
    },
  ],
  gotchas: [
    'The header label is slotted text — `<jh-table-header-cell>Account</jh-table-header-cell>` — there is no `label` attribute.',
    'Header cells belong in the row marked `slot="jh-table-header"`, not in body rows.',
    '`sortable` only renders the sort affordance and fires `jh-sort` (`detail.sorted` cycles none → ascending → descending) — it does NOT reorder the table. Listen for `jh-sort` and re-sort your data, or use `jha-advanced-table` for built-in sorting.',
  ],
  related: [
    'jh-table',
    'jh-table-row',
    'jh-table-data-cell',
    'jha-advanced-table',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
