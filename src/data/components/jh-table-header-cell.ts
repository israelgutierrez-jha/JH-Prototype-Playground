import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-table-header-cell',
  name: 'Table Header Cell',
  import: '@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js',
  summary: 'A column header cell within a table header row.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Labeling a column inside a `jh-table-row` with `slot="header"`.',
  ],
  whenNotToUse: [
    'For body cells — use `jh-table-data-cell`.',
  ],
  examples: [
    {
      title: 'Header cells',
      useCase: 'Define the columns of a table header row.',
      code: `<jh-table-row slot="header">
  <jh-table-header-cell label="Account"></jh-table-header-cell>
  <jh-table-header-cell label="Balance"></jh-table-header-cell>
</jh-table-row>`,
    },
  ],
  gotchas: [
    'Header cells belong in the row marked `slot="header"`, not in body rows.',
  ],
  related: [
    'jh-table',
    'jh-table-row',
    'jh-table-data-cell',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
