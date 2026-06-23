import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-tooltip',
  name: 'Tooltip',
  import: '@jack-henry/jh-elements/components/tooltip/tooltip.js',
  summary: 'A small popover that explains a trigger element on hover or focus.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Clarifying an icon-only control or terse label with a short hint.',
    'Offering supplementary detail that is not essential to complete the task.',
  ],
  whenNotToUse: [
    'For essential instructions — use visible helper text instead; tooltips are easy to miss and inaccessible on touch.',
    'For rich or interactive content — use a popover/dialog.',
  ],
  props: [
    { name: 'content', type: 'string', description: 'The tooltip text.' },
  ],
  slots: [
    { name: '', description: 'Default slot — the trigger element the tooltip wraps.' },
  ],
  examples: [
    {
      title: 'Icon explanation',
      useCase: 'Explain what an icon-only button does.',
      code: `<jh-tooltip content="Refresh balances">
  <jh-button label="Refresh" appearance="tertiary"></jh-button>
</jh-tooltip>`,
    },
  ],
  gotchas: [
    'Tooltips are non-essential by nature — never hide required information behind one.',
  ],
  related: ['jh-button'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
