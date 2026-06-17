import type { ComponentDoc } from '../types.js'

export const listGroupDoc: ComponentDoc = {
  name: 'List Group',
  tagName: 'jh-list-group',
  importPath: '@jack-henry/jh-elements/components/list-group/list-group.js',
  description:
    'Container used to group list items. Used as a building block in lists, menus, and dropdowns. Has a role of "group" for accessibility.',
  attributes: [
    {
      name: 'label',
      description: 'Optional subheader text displayed above the group.',
      type: 'string',
    },
    {
      name: 'accessible-label',
      description:
        'Sets an aria-label when no visible label is needed. Use when omitting the label attribute.',
      type: 'string',
    },
  ],
  slots: [
    {
      name: 'default',
      description: 'Insert <jh-list-item> components here.',
    },
  ],
  cssProperties: [
    {
      name: '--jh-list-group-subheader-color-background',
      description: 'Subheader background color.',
      default: 'transparent',
    },
    {
      name: '--jh-list-group-subheader-color-text',
      description: 'Subheader text color.',
      default: '--jh-color-content-secondary-enabled',
    },
    {
      name: '--jh-list-group-subheader-space-padding-left',
      description: 'Subheader left padding.',
      default: '--jh-dimension-600',
    },
    {
      name: '--jh-list-group-subheader-space-padding-right',
      description: 'Subheader right padding.',
      default: '--jh-dimension-600',
    },
  ],
  examples: [
    {
      label: 'Basic group',
      code: `<jh-list-group>
  <jh-list-item primary-text="Item 1"></jh-list-item>
  <jh-list-item primary-text="Item 2"></jh-list-item>
</jh-list-group>`,
    },
    {
      label: 'With subheader',
      code: `<jh-list-group label="Accounts">
  <jh-list-item primary-text="Checking ···1234" secondary-text="$4,200.00"></jh-list-item>
  <jh-list-item primary-text="Savings ···5678" secondary-text="$12,500.00"></jh-list-item>
</jh-list-group>`,
    },
  ],
}
