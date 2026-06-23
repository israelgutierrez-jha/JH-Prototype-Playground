import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-tag-group',
  name: 'Tag Group',
  import: '@jack-henry/jh-elements/components/tag-group/tag-group.js',
  summary: 'Lays out a set of related tags with consistent spacing and wrapping.',
  category: 'tags',
  status: 'stable',
  whenToUse: [
    'Displaying multiple tags together — a list of categories, applied filters, or attributes.',
  ],
  whenNotToUse: [
    'For a single tag — use `jh-tag` on its own.',
  ],
  slots: [
    { name: '', description: 'Default slot — place `jh-tag` elements inside.' },
  ],
  examples: [
    {
      title: 'Tag set',
      useCase: 'Show several categories on a record.',
      code: `<jh-tag-group>
  <jh-tag label="Transfers"></jh-tag>
  <jh-tag label="Recurring"></jh-tag>
  <jh-tag label="Savings"></jh-tag>
</jh-tag-group>`,
    },
  ],
  gotchas: [
    'Handles spacing and wrapping for you — avoid adding custom margins to the inner tags.',
  ],
  related: ['jh-tag'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
