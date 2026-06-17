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
import './app.js'

