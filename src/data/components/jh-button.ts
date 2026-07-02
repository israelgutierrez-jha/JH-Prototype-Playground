import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-button',
  name: 'Button',
  import: '@jack-henry/jh-elements/components/button/button.js',
  summary: 'Triggers an action or navigation, with appearance variants that signal intent.',
  category: 'actions',
  status: 'stable',
  whenToUse: [
    'Committing to an action: submit, save, continue, confirm.',
    'Navigating when the destination feels like an action (use `href` for real links).',
    'Signaling hierarchy in a group of choices via `appearance` (one primary action per view).',
  ],
  whenNotToUse: [
    'For low-emphasis inline navigation inside body text — prefer a plain link.',
    'As a toggle for an on/off setting — use `jh-switch`.',
    'To represent a selectable option in a list — use `jh-list-item`.',
  ],
  examples: [
    {
      title: 'Primary action',
      useCase: 'The single most important action on a view — submit a form, confirm a flow.',
      code: `<jh-button label="Save" appearance="primary" @click=\${this._save}></jh-button>`,
    },
    {
      title: 'Secondary / cancel',
      useCase: 'A supporting action shown alongside the primary one, e.g. dismissing a dialog.',
      code: `<jh-button label="Cancel" appearance="secondary"></jh-button>`,
    },
    {
      title: 'Destructive action',
      useCase: 'An irreversible or data-losing action like delete; pair with a confirmation step.',
      code: `<jh-button label="Delete" appearance="danger"></jh-button>`,
    },
    {
      title: 'Async / loading state',
      useCase: 'A submit that triggers a network call — bind `pending` to your loading flag.',
      code: `<jh-button label="Submit" appearance="primary" ?pending=\${this._saving} @click=\${this._submit}></jh-button>`,
    },
    {
      title: 'With a leading icon',
      useCase: 'Reinforce an action with a glyph, e.g. a download or transfer button.',
      code: `<jh-button label="Download" appearance="secondary">
  <jh-icon-arrow-down-to-line slot="jh-button-icon-left" size="small"></jh-icon-arrow-down-to-line>
</jh-button>`,
    },
  ],
  gotchas: [
    'The text is the `label` attribute, not slotted children — children are reserved for icon slots.',
    'Limit to one `appearance="primary"` per view so the primary action stays unambiguous.',
    'Prefer `pending` over `disabled` during async work; it communicates progress, not just unavailability.',
  ],
  related: [
    'jh-list-item',
    'jh-switch',
  ],
  source: { storybookUrl: '', importedAt: '2026-06-18', componentVersion: '' },
}
