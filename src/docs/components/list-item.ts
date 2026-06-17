import type { ComponentDoc } from '../types.js'

export const listItemDoc: ComponentDoc = {
  name: 'List Item',
  tagName: 'jh-list-item',
  importPath: '@jack-henry/jh-elements/components/list-item/list-item.js',
  description:
    'Represents one item in a list. Used as a building block in lists, menus, and dropdowns. Not interactive by default — set tabindex="0" to enable keyboard navigation and states (hover, focus, active, selected, disabled).',
  attributes: [
    {
      name: 'primary-text',
      description: 'Main text content.',
      type: 'string',
    },
    {
      name: 'secondary-text',
      description: 'Secondary/supporting text below the primary text.',
      type: 'string',
    },
    {
      name: 'primary-metadata',
      description: 'Primary metadata text, displayed to the right.',
      type: 'string',
    },
    {
      name: 'secondary-metadata',
      description: 'Secondary metadata text below the primary metadata.',
      type: 'string',
    },
    {
      name: 'selected',
      description: 'Marks the item as selected (interactive items only).',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'disabled',
      description: 'Disables the item. Remains in tab order and is announced by screen readers.',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'show-divider',
      description: 'Shows a divider line below the item.',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'divider-inset',
      description: 'Left inset of the divider in px. Supports 0–96 in steps of 8.',
      type: 'number',
      options: ['0', '8', '16', '24', '32', '40', '48', '56', '64', '72', '80', '88', '96'],
    },
  ],
  slots: [
    {
      name: 'default',
      description: 'Fully custom content. Do not combine with layout slots.',
    },
    {
      name: 'jh-list-item-left',
      description: 'Content pinned to the left (e.g. an icon).',
    },
    {
      name: 'jh-list-item-content',
      description: 'Custom content in the main body area.',
    },
    {
      name: 'jh-list-item-metadata',
      description: 'Custom metadata content.',
    },
    {
      name: 'jh-list-item-right',
      description: 'Content pinned to the right (e.g. a caret icon).',
    },
  ],
  cssProperties: [
    {
      name: '--jh-list-item-color-background',
      description: 'Background color.',
      default: 'transparent',
    },
    {
      name: '--jh-list-item-color-background-hover',
      description: 'Background color on hover (interactive items).',
      default: '--jh-color-container-primary-hover',
    },
    {
      name: '--jh-list-item-color-background-active',
      description: 'Background color when active (interactive items).',
      default: '--jh-color-container-primary-active',
    },
    {
      name: '--jh-list-item-color-background-selected',
      description: 'Background color when selected.',
      default: '--jh-color-container-primary-selected',
    },
    {
      name: '--jh-list-item-color-border-selected',
      description: 'Left border color when selected.',
      default: '--jh-border-selected-color',
    },
    {
      name: '--jh-list-item-color-focus',
      description: 'Outline color on keyboard focus.',
      default: '--jh-border-focus-color',
    },
    {
      name: '--jh-list-item-color-text',
      description: 'Text color for all slots.',
      default: '--jh-color-content-primary-enabled',
    },
    {
      name: '--jh-list-item-color-text-secondary',
      description: 'Secondary text color.',
      default: '--jh-color-content-secondary-enabled',
    },
    {
      name: '--jh-list-item-size-height',
      description: 'Height of the item.',
      default: 'auto',
    },
    {
      name: '--jh-list-item-space-padding-left',
      description: 'Left padding.',
      default: '--jh-dimension-600',
    },
    {
      name: '--jh-list-item-space-padding-right',
      description: 'Right padding.',
      default: '--jh-dimension-600',
    },
  ],
  examples: [
    {
      label: 'Text only',
      code: `<jh-list-item primary-text="Account summary" secondary-text="As of today"></jh-list-item>`,
    },
    {
      label: 'With slots',
      code: `<jh-list-item>
  <jh-icon-user slot="jh-list-item-left"></jh-icon-user>
  <div slot="jh-list-item-content">Ivan Gutierrez</div>
  <div slot="jh-list-item-metadata">Admin</div>
  <jh-icon-view-more slot="jh-list-item-right"></jh-icon-view-more>
</jh-list-item>`,
    },
    {
      label: 'Interactive with selection',
      code: `<jh-list-item
  primary-text="Checking ···1234"
  secondary-text="$4,200.00"
  tabindex="0"
  ?selected=\${this._selected === 'checking'}
  @click=\${() => { this._selected = 'checking' }}
></jh-list-item>`,
    },
    {
      label: 'With divider',
      code: `<jh-list-item primary-text="Item 1" show-divider divider-inset="16"></jh-list-item>`,
    },
  ],
}
