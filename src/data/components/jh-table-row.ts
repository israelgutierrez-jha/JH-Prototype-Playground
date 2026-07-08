import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-table-row',
  name: 'Table Row',
  import: '@jack-henry/jh-elements/components/table-row/table-row.js',
  summary: 'A row within a table — a header row or a body row of cells.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Grouping header cells (in a row with `slot="jh-table-header"`) or data cells into a single table row.',
  ],
  whenNotToUse: [
    'For a single-column list row — use `jh-list-item`.',
  ],
  examples: [
    {
      title: 'Body row',
      useCase: 'A row of data cells in the table body.',
      code: `<jh-table-row>
  <jh-table-data-cell>Checking ···1234</jh-table-data-cell>
  <jh-table-data-cell>$4,200.00</jh-table-data-cell>
</jh-table-row>`,
    },
  ],
  gotchas: [
    'Add `slot="jh-table-header"` to the row that contains header cells; body rows use the default slot.',
  ],
  related: [
    'jh-table',
    'jh-table-header-cell',
    'jh-table-data-cell',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
