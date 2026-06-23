import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-icon',
  name: 'Icon',
  import: '@jack-henry/jh-elements/components/icon/icon.js',
  summary: 'Renders a JH icon at a standard size; individual glyphs ship as their own elements.',
  category: 'icons',
  status: 'stable',
  whenToUse: [
    'Adding a recognizable glyph to reinforce an action, status, or list row.',
    'Sizing icons consistently via the shared size scale.',
  ],
  whenNotToUse: [
    'As the only label on an interactive control without an accessible name — pair with text or a tooltip.',
  ],
  examples: [
    {
      title: 'Using a named icon',
      useCase: 'Import the specific icon element from @jack-henry/jh-icons and render it at a chosen size.',
      code: `<jh-icon-house size="medium"></jh-icon-house>`,
    },
  ],
  gotchas: [
    'Each glyph is a separate element imported from `@jack-henry/jh-icons/icons-wc/icon-<name>.js` and used as `<jh-icon-<name>>`.',
    'Icon-only buttons need an accessible label (e.g. a `jh-tooltip` or `aria-label`).',
  ],
  related: [
    'jh-button',
    'jh-list-item',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
