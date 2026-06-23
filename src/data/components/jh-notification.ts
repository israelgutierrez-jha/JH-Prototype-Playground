import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-notification',
  name: 'Notification',
  import: '@jack-henry/jh-elements/components/notification/notification.js',
  summary: 'Inline or full-width message conveying status — success, info, or error.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Communicating the result of an action or a persistent state — validation errors, save success, system info.',
    'Use `type="alert"` for inline, contextual messages and `type="banner"` for page-level announcements.',
  ],
  whenNotToUse: [
    'For brief, transient confirmations that auto-dismiss — use `jh-toast`.',
    'For a numeric count indicator — use `jh-badge`.',
  ],
  props: [
    { name: 'type', type: "'alert' | 'banner'", description: 'alert = inline message; banner = full-width top-of-page message.' },
    { name: 'appearance', type: "'positive' | 'neutral' | 'negative'", description: 'positive = success, negative = error, neutral = info/warning.' },
  ],
  slots: [
    { name: '', description: 'Default slot — the message content (text is slotted, not an attribute).' },
  ],
  examples: [
    {
      title: 'Inline error',
      useCase: 'Surface a failure near the affected content.',
      code: `<jh-notification type="alert" appearance="negative">Something went wrong</jh-notification>`,
    },
    {
      title: 'Inline success',
      useCase: 'Confirm an action succeeded.',
      code: `<jh-notification type="alert" appearance="positive">Saved successfully!</jh-notification>`,
    },
    {
      title: 'Page banner',
      useCase: 'Announce a system-wide condition at the top of the page.',
      code: `<jh-notification type="banner" appearance="negative">System maintenance scheduled.</jh-notification>`,
    },
  ],
  gotchas: [
    'The message is slotted content, not a `message` attribute.',
    'Map appearance to meaning: negative = error, positive = success, neutral = info/warning.',
  ],
  related: ['jh-toast', 'jh-badge'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
