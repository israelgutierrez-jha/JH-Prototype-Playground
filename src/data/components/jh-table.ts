import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-table',
  name: 'Table',
  import: '@jack-henry/jh-elements/components/table/table.js',
  summary: 'A data table that arranges rows and columns of structured records.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Displaying structured, multi-column data that benefits from aligned columns — transactions, reports.',
    'When users need to scan or compare values across rows.',
  ],
  whenNotToUse: [
    'For single-column lists of records — use `jh-list-group` / `jh-list-item`.',
    'For dense key/value detail of one record — a definition layout reads better.',
  ],
  slots: [
    { name: 'header', description: 'A `jh-table-row` (slot="header") of `jh-table-header-cell`s.' },
    { name: '', description: 'Default slot — body `jh-table-row` elements.' },
  ],
  examples: [
    {
      title: 'Basic table',
      useCase: 'Render a header row plus data rows from a list.',
      code: `<jh-table>
  <jh-table-row slot="header">
    <jh-table-header-cell label="Account"></jh-table-header-cell>
    <jh-table-header-cell label="Balance"></jh-table-header-cell>
  </jh-table-row>
  \${accounts.map(a => html\`
    <jh-table-row>
      <jh-table-data-cell>\${a.name}</jh-table-data-cell>
      <jh-table-data-cell>\${a.balance}</jh-table-data-cell>
    </jh-table-row>
  \`)}
</jh-table>`,
    },
  ],
  gotchas: [
    'The header is a `jh-table-row` with `slot="header"`; body rows go in the default slot.',
  ],
  related: ['jh-table-row', 'jh-table-header-cell', 'jh-table-data-cell', 'jh-list-group'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
