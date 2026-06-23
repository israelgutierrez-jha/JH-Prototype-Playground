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
  props: [
    { name: 'primary-text', type: 'string', description: 'Main line of text.' },
    { name: 'secondary-text', type: 'string', description: 'Secondary line below the primary text.' },
    { name: 'primary-metadata', type: 'string', description: 'Primary metadata aligned to the trailing edge.' },
    { name: 'secondary-metadata', type: 'string', description: 'Secondary trailing metadata.' },
    { name: 'selected', type: 'boolean', default: 'false', description: 'Selected/active styling.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'show-divider', type: 'boolean', default: 'false', description: 'Shows a divider below the row.' },
    { name: 'divider-inset', type: 'boolean', default: 'false', description: 'Insets the divider to align with content.' },
  ],
  slots: [
    { name: 'jh-list-item-left', description: 'Leading element, e.g. an icon or avatar.' },
    { name: 'jh-list-item-content', description: 'Custom main content (alternative to primary/secondary text).' },
    { name: 'jh-list-item-metadata', description: 'Custom trailing metadata content.' },
    { name: 'jh-list-item-right', description: 'Trailing element, e.g. a chevron or action.' },
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
  <div slot="jh-list-item-content">Ivan Gutierrez</div>
  <div slot="jh-list-item-metadata">Admin</div>
</jh-list-item>`,
    },
  ],
  gotchas: [
    'When used as an option inside `jh-select`, use `value` and `label` attributes instead of `primary-text` — those are select-specific.',
    'Add `tabindex="0"` and a key handler for keyboard-accessible interactive rows.',
  ],
  related: ['jh-list-group', 'jh-menu', 'jh-select'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
