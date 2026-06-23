import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-divider',
  name: 'Divider',
  import: '@jack-henry/jh-elements/components/divider/divider.js',
  summary: 'A thin horizontal rule that separates content, with optional inset spacing.',
  category: 'layout',
  status: 'stable',
  whenToUse: [
    'Visually separating sections or groups within a surface.',
    'Adding a measured gap around the rule via `inset` to align with surrounding padding.',
  ],
  whenNotToUse: [
    'Between list rows — `jh-list-item` has a `show-divider` prop for that.',
    'As decoration where whitespace alone would read more cleanly.',
  ],
  examples: [
    {
      title: 'Section divider',
      useCase: 'Separate two stacked sections.',
      code: `<jh-divider></jh-divider>`,
    },
    {
      title: 'Inset divider',
      useCase: 'Indent the rule to line up with content padding.',
      code: `<jh-divider inset="16"></jh-divider>`,
    },
  ],
  gotchas: [
    '`inset` takes a fixed token step (0–96), not a CSS length — pick the value that matches the surrounding padding.',
  ],
  related: [
    'jh-card',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
