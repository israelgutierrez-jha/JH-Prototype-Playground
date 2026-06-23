import type { ComponentDoc } from './types.js'

export const doc: ComponentDoc = {
  tag: 'jh-toast-controller',
  name: 'Toast Controller',
  import: '@jack-henry/jh-elements/components/toast-controller/toast-controller.js',
  summary: 'A singleton host that renders and manages toasts, queued via a global event.',
  category: 'feedback',
  status: 'stable',
  whenToUse: [
    'Mount once near the app root so anywhere in the app can raise a toast.',
    'When you need a consistent stacking, cap, and auto-dismiss behavior for transient confirmations.',
  ],
  whenNotToUse: [
    'For a single inline message you place in the markup yourself — use `jh-toast` directly.',
    'For persistent or actionable state — use `jh-notification`.',
  ],
  examples: [
    {
      title: 'Mount the controller',
      useCase: 'Place a single controller high in the tree so toasts have somewhere to render.',
      code: `<jh-toast-controller max-count="3"></jh-toast-controller>`,
    },
    {
      title: 'Raise a toast from anywhere',
      useCase: 'Trigger a transient confirmation without touching the controller directly.',
      code: `window.dispatchEvent(new CustomEvent('jh-create-toast', {
  detail: { text: 'Transfer sent', appearance: 'positive', timeout: 4000 },
}))`,
    },
  ],
  gotchas: [
    'Render exactly one controller per app — it is a singleton that listens for the global `jh-create-toast` window event.',
    'You raise toasts by dispatching `jh-create-toast` on `window`, not by calling a method on the element.',
    'Supported `detail` fields: `text`, `appearance`, `timeout`, `stacked`, `hideDismissButton`, `dismissButtonAccessibleLabel`, `toastIcon`, `toastAction`, `toastDismissIcon`.',
    '`max-count` caps concurrent toasts (default 3); the oldest is dismissed when the cap is exceeded.',
  ],
  related: [
    'jh-toast',
    'jh-notification',
  ],
  source: { storybookUrl: 'https://release-v2--68f8e6a25b256d0ef89b13e6.chromatic.com/?path=/docs/components-toast-controller--docs', importedAt: '2026-06-23', componentVersion: '2.0.0-beta.14' },
}
