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
    'As a wrapper around `jh-table` or `jha-advanced-table` — tables bring their own surface/border, so nesting one in a card doubles up the surface treatment. Let the table sit directly in the layout.',
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
  related: [
    'jh-divider',
    'jh-list-group',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
