import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-toast',
  name: 'Toast',
  import: '@jack-henry/jh-elements/components/toast/toast.js',
  summary: 'A brief, transient message that confirms an action and auto-dismisses.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Confirming a quick, successful action without interrupting the flow — "Copied", "Transfer sent".',
  ],
  whenNotToUse: [
    'For persistent or important state the user must act on — use `jh-notification`.',
    'For errors that need attention or retry — use an inline `jh-notification`.',
  ],
  props: [
    { name: 'message', type: 'string', description: 'The toast text.' },
    { name: 'type', type: 'string', description: 'Visual style of the toast (e.g. success/info).' },
  ],
  examples: [
    {
      title: 'Confirmation toast',
      useCase: 'Briefly confirm a completed action.',
      code: `<jh-toast message="Transfer sent" type="success"></jh-toast>`,
    },
  ],
  gotchas: [
    'Toasts are transient — never put critical information or required actions in one.',
  ],
  related: ['jh-notification'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
