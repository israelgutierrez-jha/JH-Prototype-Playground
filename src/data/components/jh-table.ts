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
    'When you need built-in sorting, filtering, search, or pagination — use `jha-advanced-table`; this table is presentational only.',
  ],
  examples: [
    {
      title: 'Basic table',
      useCase: 'A header row plus a couple of static body rows.',
      code: `<jh-table>
  <jh-table-row slot="jh-table-header">
    <jh-table-header-cell>Account</jh-table-header-cell>
    <jh-table-header-cell>Balance</jh-table-header-cell>
  </jh-table-row>
  <jh-table-row>
    <jh-table-data-cell>Checking ···1234</jh-table-data-cell>
    <jh-table-data-cell>$4,200.00</jh-table-data-cell>
  </jh-table-row>
  <jh-table-row>
    <jh-table-data-cell>Savings ···5678</jh-table-data-cell>
    <jh-table-data-cell>$12,500.00</jh-table-data-cell>
  </jh-table-row>
</jh-table>`,
    },
    {
      title: 'Rows from data',
      useCase: 'Render body rows by mapping over a list in your Lit template.',
      code: `<jh-table>
  <jh-table-row slot="jh-table-header">
    <jh-table-header-cell>Account</jh-table-header-cell>
    <jh-table-header-cell>Balance</jh-table-header-cell>
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
    'The header row is a `jh-table-row` with `slot="jh-table-header"` (not `slot="header"`); body rows go in the default slot.',
    'Header labels and cell values are slotted text between the tags — neither `jh-table-header-cell` nor `jh-table-data-cell` takes a `label` attribute.',
    'This table is presentational — it does NOT sort, filter, or paginate on its own. A `sortable` header cell only fires `jh-sort` (`detail.sorted` cycles none → ascending → descending); you must reorder the data yourself in response. Use `jha-advanced-table` if you want that behavior built in.',
    'Do not nest inside a `jh-card`. Tables carry their own surface/border treatment and are meant to sit directly in the page layout — wrapping one in a card doubles the surface (card padding + table border) and reads as an unintended extra layer. Place a heading/toolbar above the table in a plain container instead.',
  ],
  related: [
    'jh-table-row',
    'jh-table-header-cell',
    'jh-table-data-cell',
    'jha-advanced-table',
    'jh-list-group',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
