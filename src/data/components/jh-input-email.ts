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
  props: [
    { name: 'label', type: 'string', description: 'Field label.' },
    { name: 'placeholder', type: 'string', description: 'Hint text when empty.' },
    { name: 'value', type: 'string', description: 'Current value.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'error-text', type: 'string', description: 'Error message and error state.' },
    { name: 'helper-text', type: 'string', description: 'Supporting text below the field.' },
  ],
  events: [
    { name: 'jh-input', description: 'Fires as the user types.', payload: '(e.target as HTMLInputElement).value' },
    { name: 'jh-change', description: 'Fires on blur or commit.', payload: '(e.target as HTMLInputElement).value' },
  ],
  examples: [
    {
      title: 'Email field',
      useCase: 'Standard required email capture.',
      code: `<jh-input-email label="Email address" placeholder="you@example.com" required></jh-input-email>`,
    },
  ],
  gotchas: [
    'Shares the same API as `jh-input`; prefer this variant so the browser surfaces the email keyboard and built-in format hints.',
  ],
  related: ['jh-input'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
