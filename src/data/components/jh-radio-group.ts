import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-radio-group',
  name: 'Radio Group',
  import: '@jack-henry/jh-elements/components/radio-group/radio-group.js',
  summary: 'Groups radios under a shared label so the user picks exactly one option.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Choosing exactly one option from a small visible set — delivery method, account type.',
  ],
  whenNotToUse: [
    'For multi-select — use `jh-checkbox-group`.',
    'For long option lists — use `jh-select`.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Group label describing the choice.' },
    { name: 'name', type: 'string', description: 'Shared name applied to the radios within.' },
  ],
  slots: [
    { name: '', description: 'Default slot — place `jh-radio` elements inside.' },
  ],
  examples: [
    {
      title: 'Single-choice group',
      useCase: 'Pick exactly one statement delivery method.',
      code: `<jh-radio-group label="Statement delivery" name="delivery">
  <jh-radio value="email" label="Email"></jh-radio>
  <jh-radio value="mail" label="Paper mail"></jh-radio>
</jh-radio-group>`,
    },
  ],
  gotchas: [
    'Keep options visible and few; beyond a handful, a `jh-select` reads more cleanly.',
  ],
  related: ['jh-radio', 'jh-checkbox-group', 'jh-select'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
