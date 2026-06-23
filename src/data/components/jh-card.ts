import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-card',
  name: 'Card',
  import: '@jack-henry/jh-elements/components/card/card.js',
  summary: 'A surface that groups related content, with optional header and footer regions.',
  category: 'layout',
  status: 'stable',
  whenToUse: [
    'Grouping related content or actions into a distinct surface — account summaries, forms, panels.',
    'Giving a section its own header/footer via built-in props or slots.',
  ],
  whenNotToUse: [
    'For a flat list of records — use `jh-list-group` / `jh-list-item`.',
    'As a full page frame — the platform shell already owns the page.',
  ],
  props: [
    { name: 'headerTitle', type: 'string', description: 'Built-in header title.' },
    { name: 'headerSubtitle', type: 'string', description: 'Built-in header subtitle.' },
    { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", description: 'Inner padding around default-slot content.' },
    { name: 'showHeaderDivider', type: 'boolean', default: 'false', description: 'Shows a divider under the header.' },
    { name: 'showFooterDivider', type: 'boolean', default: 'false', description: 'Shows a divider above the footer.' },
  ],
  slots: [
    { name: '', description: 'Default slot — card body content.' },
    { name: 'jh-card-header', description: 'Custom header content (alternative to headerTitle).' },
    { name: 'jh-card-footer', description: 'Footer content, e.g. actions.' },
  ],
  examples: [
    {
      title: 'Padded card',
      useCase: 'A simple surface with comfortable inner spacing.',
      code: `<jh-card padding="md">Account summary content</jh-card>`,
    },
    {
      title: 'Card with built-in header',
      useCase: 'A titled section using the header props.',
      code: `<jh-card headerTitle="Account Summary" headerSubtitle="As of today" showHeaderDivider>
  Balances and recent activity
</jh-card>`,
    },
    {
      title: 'Custom header slot',
      useCase: 'When the header needs custom markup rather than plain title text.',
      code: `<jh-card>
  <div slot="jh-card-header" style="padding: var(--jh-dimension-400, 2rem)">Custom header</div>
  <div style="padding: var(--jh-dimension-400, 2rem)">content</div>
</jh-card>`,
    },
  ],
  gotchas: [
    'Use `padding` for the default slot; when you supply custom header/footer slots, pad those yourself.',
  ],
  related: ['jh-divider', 'jh-list-group'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
