import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-list-item',
  name: 'List Item',
  import: '@jack-henry/jh-elements/components/list-item/list-item.js',
  summary: 'A single row showing primary/secondary text and metadata, with optional leading/trailing slots.',
  category: 'lists',
  status: 'stable',
  whenToUse: [
    'Representing one record or navigation row inside a `jh-list-group` or `jh-menu`.',
    'Building selectable or clickable rows with leading icons and trailing metadata.',
  ],
  whenNotToUse: [
    'As a multi-column data row — use `jh-table-row`.',
  ],
  examples: [
    {
      title: 'Selectable row',
      useCase: 'An interactive, keyboard-focusable row with selection state.',
      code: `<jh-list-item
  primary-text=\${item.label}
  secondary-text=\${item.balance}
  tabindex="0"
  ?selected=\${this._selected === item.id}
  @click=\${() => { this._selected = item.id }}
></jh-list-item>`,
    },
    {
      title: 'With leading icon and metadata slots',
      useCase: 'A row with an avatar/icon on the left and metadata on the right.',
      code: `<jh-list-item>
  <jh-icon-user slot="jh-list-item-left"></jh-icon-user>
  <div slot="jh-list-item-content">Jack Henry</div>
  <div slot="jh-list-item-metadata">Admin</div>
</jh-list-item>`,
    },
  ],
  gotchas: [
    'When used as an option inside `jh-select`, use `value` and `label` attributes instead of `primary-text` — those are select-specific.',
    'Add `tabindex="0"` and a key handler for keyboard-accessible interactive rows.',
  ],
  related: [
    'jh-list-group',
    'jh-menu',
    'jh-select',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
