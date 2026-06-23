import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-input-url',
  name: 'URL Input',
  import: '@jack-henry/jh-elements/components/input-url/input-url.js',
  summary: 'Text field specialized for web address entry, with URL keyboard and format validation.',
  category: 'forms',
  status: 'stable',
  whenToUse: [
    'Collecting a web address — website, link to a document, social or profile URL.',
  ],
  whenNotToUse: [
    'For non-URL text — use `jh-input`.',
    'For an email address — use `jh-input-email`.',
  ],
  examples: [
    {
      title: 'URL field',
      useCase: 'Standard required web-address capture.',
      code: `<jh-input-url label="Website" helper-text="Include https://" required></jh-input-url>`,
    },
    {
      title: 'With a clear button',
      useCase: 'Let users quickly reset a long pasted URL.',
      code: `<jh-input-url label="Website" show-clear-button></jh-input-url>`,
    },
  ],
  gotchas: [
    'Shares the `jh-input` API; prefer this variant so the browser surfaces the URL keyboard and format hints.',
    'There is no `placeholder` attribute — use `helper-text` for guidance, or `label` for the field name.',
    'Read the value from `e.detail.value` (not `e.target.value`); a masked field also exposes `e.detail.rawValue`.',
  ],
  related: [
    'jh-input',
  ],
  source: { storybookUrl: 'https://release-v2--68f8e6a25b256d0ef89b13e6.chromatic.com/?path=/docs/components-input-url--docs', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
