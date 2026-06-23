import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-progress',
  name: 'Progress',
  import: '@jack-henry/jh-elements/components/progress/progress.js',
  summary: 'A bar showing completion toward a known total.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Showing determinate progress — multi-step flow completion, upload percentage, goal funding.',
  ],
  whenNotToUse: [
    'For a button-local loading state — use the button\'s `pending` prop.',
    'For indeterminate waits with no known total — prefer a spinner/pending affordance.',
  ],
  props: [
    { name: 'value', type: 'number', description: 'Current progress, from 0 to max.' },
    { name: 'max', type: 'number', default: '100', description: 'The value representing 100% complete.' },
  ],
  examples: [
    {
      title: 'Step progress',
      useCase: 'Show how far through a multi-step flow the user is.',
      code: `<jh-progress value="60" max="100"></jh-progress>`,
    },
    {
      title: 'Bound to state',
      useCase: 'Drive the bar from a reactive percentage.',
      code: `<jh-progress value=\${this._percent} max="100"></jh-progress>`,
    },
  ],
  gotchas: [
    'Keep `value` within 0–`max`; values outside the range clamp.',
  ],
  related: ['jh-button'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
