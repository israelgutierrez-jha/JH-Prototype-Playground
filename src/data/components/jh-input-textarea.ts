import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-textarea',
  name: 'Textarea',
  import: '@jack-henry/jh-elements/components/input-textarea/input-textarea.js',
  summary: 'Multi-line text field for longer free-form entry.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting more than one line of text — notes, memos, descriptions, messages.',
  ],
  whenNotToUse: [
    'For single-line values — use `jh-input`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Field label.' },
    { name: 'rows', type: 'number', description: 'Visible number of text rows.' },
    { name: 'placeholder', type: 'string', description: 'Hint text when empty.' },
    { name: 'value', type: 'string', description: 'Current value.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
  ],
  events: [
    { name: 'jh-input', description: 'Fires as the user types.', payload: '(e.target as HTMLTextAreaElement).value' },
    { name: 'jh-change', description: 'Fires on blur or commit.', payload: '(e.target as HTMLTextAreaElement).value' },
  ],
  examples: [
    {
      title: 'Memo field',
      useCase: 'Capture a multi-line note on a transfer.',
      code: `<jh-input-textarea label="Memo" rows="4" placeholder="Add a note..."></jh-input-textarea>`,
    },
  ],
  gotchas: [
    'Use `rows` to size the initial height to the expected content length.',
  ],
  related: ['jh-input'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
