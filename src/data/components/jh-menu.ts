import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-menu',
  name: 'Menu',
  import: '@jack-henry/jh-elements/components/menu/menu.js',
  summary: 'A list of actions or options, typically shown from a trigger.',
  category: 'navigation',
  status: 'stable',
  whenToUse: [
    'Offering a set of actions or choices in an overflow/context menu — row actions, "more" menus.',
  ],
  whenNotToUse: [
    'For a primary, always-visible navigation list — use `jh-list-group`.',
    'For choosing a form value — use `jh-select`.',
  ],
  examples: [
    {
      title: 'Action menu',
      useCase: 'A small set of row-level actions.',
      code: `<jh-menu>
  <jh-list-item primary-text="Edit"></jh-list-item>
  <jh-list-item primary-text="Duplicate"></jh-list-item>
  <jh-list-item primary-text="Delete"></jh-list-item>
</jh-menu>`,
    },
  ],
  gotchas: [
    'Menu options are `jh-list-item` elements, same as in a list group.',
  ],
  related: [
    'jh-list-item',
    'jh-select',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
