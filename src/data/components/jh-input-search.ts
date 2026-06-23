import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-search',
  name: 'Search Input',
  import: '@jack-henry/jh-elements/components/input-search/input-search.js',
  summary: 'Text field specialized for search, with a search icon and clear affordance.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Filtering or searching a list, table, or gallery.',
    'Any field whose purpose is to narrow results rather than capture a stored value.',
  ],
  whenNotToUse: [
    'For values you persist on submit — use `jh-input`.',
  ],
  examples: [
    {
      title: 'Live filter',
      useCase: 'Filter a list as the user types by storing the query in state.',
      code: `<jh-input-search
  label="Search prototypes"
  @jh-input=\${(e) => { this._search = e.detail.value }}
></jh-input-search>`,
    },
  ],
  gotchas: [
    'Provide a `label` even when visually minimal — it is the accessible name for the field.',
  ],
  related: [
    'jh-input',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
