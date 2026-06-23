import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-divider',
  name: 'Divider',
  import: '@jack-henry/jh-elements/components/divider/divider.js',
  summary: 'A thin rule that separates content horizontally or vertically.',
  category: 'layout',
  status: 'stable',
  whenToUse: [
    'Visually separating sections or groups within a surface.',
    'Splitting inline items with a vertical rule.',
  ],
  whenNotToUse: [
    'Between list rows — `jh-list-item` has a `show-divider` prop for that.',
    'As decoration where whitespace alone would read more cleanly.',
  ],
  props: [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'horizontal', description: 'Direction of the rule.' },
  ],
  examples: [
    {
      title: 'Horizontal divider',
      useCase: 'Separate two stacked sections.',
      code: `<jh-divider></jh-divider>`,
    },
    {
      title: 'Vertical divider',
      useCase: 'Separate inline items in a row.',
      code: `<jh-divider orientation="vertical"></jh-divider>`,
    },
  ],
  gotchas: [
    'A vertical divider needs a parent with a defined height to be visible.',
  ],
  related: ['jh-card'],
  source: { storybookUrl: '', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
