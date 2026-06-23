import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-badge',
  name: 'Badge',
  import: '@jack-henry/jh-elements/components/badge/badge.js',
  summary: 'A small numeric or dot indicator for counts, typically anchored to an icon.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Showing an unread or pending count on an icon or item — notifications, messages.',
    'A dot indicator that something needs attention.',
  ],
  whenNotToUse: [
    'For text status labels like "Active" or "Pending" — use `jh-tag`.',
    'For full messages — use `jh-notification`.',
  ],
  props: [
    { name: 'count', type: 'string', description: 'The number to display (as a string).' },
    { name: 'maxCount', type: 'number', description: 'Caps the displayed number, e.g. 99 shows "99+".' },
  ],
  examples: [
    {
      title: 'Count badge',
      useCase: 'Show a small unread count.',
      code: `<jh-badge count="5"></jh-badge>`,
    },
    {
      title: 'Capped count',
      useCase: 'Avoid oversized numbers by capping the display.',
      code: `<jh-badge count="150" maxCount="99"></jh-badge>`,
    },
  ],
  gotchas: [
    'Numeric/dot only — for text status indicators use `jh-tag`.',
    '`count` is a string attribute, not a number.',
  ],
  related: ['jh-tag', 'jh-notification'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
