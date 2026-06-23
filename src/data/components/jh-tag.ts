import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-tag',
  name: 'Tag',
  import: '@jack-henry/jh-elements/components/tag/tag.js',
  summary: 'A compact text label for statuses, categories, or removable selections.',
  category: 'tags',
  status: 'stable',
  whenToUse: [
    'Showing a short text status or category — "Active", "Pending", "Savings".',
    'Representing removable selections, e.g. applied filters, via `removable`.',
  ],
  whenNotToUse: [
    'For numeric counts or dot indicators — use `jh-badge`.',
    'As a clickable action — use `jh-button`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Tag text.' },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Shows a remove affordance for dismissible tags.' },
  ],
  examples: [
    {
      title: 'Status tag',
      useCase: 'Label a record with its current status.',
      code: `<jh-tag label="Active"></jh-tag>`,
    },
    {
      title: 'Removable tag',
      useCase: 'An applied filter the user can clear.',
      code: `<jh-tag label="Checking" removable></jh-tag>`,
    },
  ],
  gotchas: [
    'Use tags for text indicators; for counts use `jh-badge`.',
  ],
  related: ['jh-tag-group', 'jh-badge'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
