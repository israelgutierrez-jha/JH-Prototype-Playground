import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-email',
  name: 'Email Input',
  import: '@jack-henry/jh-elements/components/input-email/input-email.js',
  summary: 'Text field specialized for email entry, with email keyboard and format validation.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting an email address — sign-in, contact info, statement delivery.',
  ],
  whenNotToUse: [
    'For non-email text — use `jh-input`.',
  ],
  examples: [
    {
      title: 'Email field',
      useCase: 'Standard required email capture.',
      code: `<jh-input-email label="Email address" helper-text="you@example.com" required></jh-input-email>`,
    },
  ],
  gotchas: [
    'Shares the same API as `jh-input`; prefer this variant so the browser surfaces the email keyboard and built-in format hints.',
  ],
  related: [
    'jh-input',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
