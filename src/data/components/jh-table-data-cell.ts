import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-table-data-cell',
  name: 'Table Data Cell',
  import: '@jack-henry/jh-elements/components/table-data-cell/table-data-cell.js',
  summary: 'A body cell holding one value within a table row.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Holding a single value in a body `jh-table-row`; content is slotted.',
  ],
  whenNotToUse: [
    'For column headers — use `jh-table-header-cell`.',
  ],
  examples: [
    {
      title: 'Data cell',
      useCase: 'Render a value inside a body row.',
      code: `<jh-table-data-cell>$4,200.00</jh-table-data-cell>`,
    },
  ],
  gotchas: [
    'Cell content is slotted children, not a `label` attribute (unlike the header cell).',
  ],
  related: [
    'jh-table',
    'jh-table-row',
    'jh-table-header-cell',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
