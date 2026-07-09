import { PlatformAppService } from '@jkhy/platform-tools/services/platform-app-service.js'

// Initialize the singleton before any jh-platform-* components mount.
// jh-platform-nav calls PlatformAppService.getInstance() in connectedCallback;
// without a pre-existing singleton it throws "AppConfig required".
// unauthenticatedApp: true skips auth checks — safe for a local prototype tool.
PlatformAppService.getInstance({
  basePath: '/prototype-playground',
  unauthenticatedApp: true,
})

import './styles/global.css'

// Legacy `@banno/jha-wc` components (e.g. jha-advanced-table) theme themselves
// via a separate `--jha-*` token namespace that jh-tokens never defines, so
// their text/borders fall back to hardcoded greys that ignore the theme. The
// vendor ships a bridge that maps every `--jha-*` token onto a `--jh-*` token;
// adopting it on the document lets those custom properties cascade into the
// legacy shadow trees and stay theme-aware. We take ONLY the conversions — not
// the module's default export, whose light/dark overrides use
// prefers-color-scheme and would fight our class-based `.jh-theme-dark` toggle.
import { jhaWcDesignSystemConversions } from '@banno/jha-wc/src/styles/exports/design-system.js'

const jhaBridge = jhaWcDesignSystemConversions.styleSheet
if (jhaBridge) {
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, jhaBridge]
}

import './app.js'

