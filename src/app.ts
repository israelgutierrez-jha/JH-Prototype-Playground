import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/proto-gallery.js'
import './components/proto-resources.js'
import './components/proto-settings.js'
import './components/proto-templates.js'
import './components/proto-template-shell.js'
import './components/proto-shell.js'
import './components/proto-inspector.js'
import './components/proto-features.js'
import './components/proto-onboarding-dialog.js'
import '@jkhy/platform-tools/components/jh-platform-nav.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-icons/icons-wc/icon-house.js'
import '@jack-henry/jh-icons/icons-wc/icon-table-layout.js'
import '@jack-henry/jh-icons/icons-wc/icon-books.js'
import '@jack-henry/jh-icons/icons-wc/icon-gear.js'
import '@jack-henry/jh-icons/icons-wc/icon-sun.js'
import '@jack-henry/jh-icons/icons-wc/icon-moon-stars.js'
import '@jack-henry/jh-icons/icons-wc/icon-list-ul-pen.js'
import { aiActionLabel, getAiTool, runAiPrompt } from './utils/ai-deeplink.js'
import { designerProfileReady, isOnboarded } from './utils/designer-profile.js'

const UPDATE_PROMPT =
  "Please restart the JH Prototype Playground dev server to pick up the latest design system update — stop any running `npm run dev` process and run it again."

@customElement('proto-app')
export class ProtoApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .shell {
      display: flex;
      width: 100%;
      height: 100%;
    }

    /* Wraps jh-platform-nav so the theme toggle can sit below it.
       overflow: hidden clips the nav's internal height: 100vh to the
       column height, which is the same value in practice. */
    .nav-col {
      position: relative;
      width: 58px;
      height: 100%;
      flex-shrink: 0;
      overflow: hidden;
      background: var(--jh-color-global-navigation-enabled, rgb(5, 21, 56));
    }

    jh-platform-nav {
      --jh-icon-color-fill: var(--proto-nav-icon-fill);
    }

    .nav-links {
      position: absolute;
      top: 68px;
      left: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: var(--jh-border-radius-100, 6px);
      text-decoration: none;
      --jh-icon-color-fill: rgba(255, 255, 255, 0.55);
    }

    .nav-link:hover {
      background: var(--jh-color-global-navigation-hover, rgba(255, 255, 255, 0.1));
      --jh-icon-color-fill: rgba(255, 255, 255, 1);
    }

    .nav-link.active {
      background: var(--jh-color-global-navigation-hover, rgba(255, 255, 255, 0.1));
      --jh-icon-color-fill: rgba(255, 255, 255, 1);
    }

    .nav-bottom {
      position: absolute;
      bottom: 18px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      --jh-icon-color-fill: rgba(255, 255, 255, 0.55);
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      --jh-icon-color-fill: rgba(255, 255, 255, 1);
    }

    .nav-btn.active {
      background: var(--jh-color-content-brand-enabled, rgba(255, 255, 255, 0.2));
      --jh-icon-color-fill: rgba(255, 255, 255, 1);
    }

    .content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--jh-color-container-page);
    }

    .content.inspecting,
    .content.inspecting * {
      cursor: crosshair;
    }

    jh-platform-header {
      --jh-platform-header-horizontal-padding: 28px;
    }

    proto-gallery.gallery-scroll,
    proto-resources.gallery-scroll,
    proto-settings.gallery-scroll,
    proto-templates.gallery-scroll,
    proto-template-shell.gallery-scroll,
    proto-features.gallery-scroll {
      flex: 1;
      overflow: auto;
    }
  `

  @state() private _dark = true
  @state() private _inspect = false
  @state() private _updateAvailable = false
  @state() private _showOnboarding = false

  private _updateCheckInterval?: ReturnType<typeof setInterval>
  private _updateCheckTimeout?: ReturnType<typeof setTimeout>

  private async _checkForUpdate() {
    try {
      const res = await fetch('/__proto-api/update-status')
      const data = await res.json()
      this._updateAvailable = !!data.updateAvailable
    } catch {
      // Endpoint only exists in dev; ignore failures.
    }
  }

  private async _openUpdatePrompt() {
    await runAiPrompt(UPDATE_PROMPT)
  }

  private _toggleTheme() {
    this._dark = !this._dark
    document.documentElement.classList.toggle('jh-theme-dark', this._dark)
  }

  private _toggleInspect() {
    this._inspect = !this._inspect
  }

  @state() private _hash = window.location.hash

  private _onHashChange = () => {
    this._hash = window.location.hash
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._inspect) this._inspect = false
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('hashchange', this._onHashChange)
    window.addEventListener('keydown', this._onKeyDown)

    designerProfileReady.then(() => {
      this._showOnboarding = !isOnboarded()
    })

    // Only meaningful against a running dev server — the built/GitHub-Pages
    // app has no `/__proto-api/*` endpoints to answer this.
    if (import.meta.env.DEV) {
      this._updateCheckTimeout = setTimeout(() => this._checkForUpdate(), 60_000)
      this._updateCheckInterval = setInterval(() => this._checkForUpdate(), 30 * 60_000)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('hashchange', this._onHashChange)
    window.removeEventListener('keydown', this._onKeyDown)
    clearTimeout(this._updateCheckTimeout)
    clearInterval(this._updateCheckInterval)
  }

  render() {
    const hash = this._hash || '#/'
    const protoMatch = hash.match(/^#\/prototypes\/([^/]+)\/([^/]+)/)
    const templateViewMatch = hash.match(/^#\/templates\/(.+)$/)
    const isTemplatesList = hash === '#/templates'
    const isResources = hash === '#/resources' || hash.startsWith('#/resources/')
    const resourcesPage = hash.startsWith('#/resources/components') ? 'components' : 'links'
    const isSettings = hash === '#/settings'
    const isFeatures = hash === '#/features'
    const isTemplates = isTemplatesList || !!templateViewMatch
    const isHome = !isTemplates && !isResources && !isSettings && !isFeatures

    const resourcesNavItems = [
      { label: 'Links', path: '#/resources' },
      { label: 'Component library', path: '#/resources/components' },
    ]

    return html`
      <div class="shell">
        <div class="nav-col">
          <jh-platform-nav .productsLoading=${true}></jh-platform-nav>
          <div class="nav-links">
            <a class="nav-link ${isHome ? 'active' : ''}" href="#/" title="Prototypes">
              <jh-icon-house size="small"></jh-icon-house>
            </a>
            <a class="nav-link ${isTemplates ? 'active' : ''}" href="#/templates" title="Templates">
              <jh-icon-table-layout size="small"></jh-icon-table-layout>
            </a>
            <a class="nav-link ${isResources ? 'active' : ''}" href="#/resources" title="Resources">
              <jh-icon-books size="small"></jh-icon-books>
            </a>
            <a class="nav-link ${isSettings ? 'active' : ''}" href="#/settings" title="Settings">
              <jh-icon-gear size="small"></jh-icon-gear>
            </a>
          </div>
          <div class="nav-bottom">
            <a class="nav-btn ${isFeatures ? 'active' : ''}" href="#/features" title="Features">
              <jh-icon-list-ul-pen size="small"></jh-icon-list-ul-pen>
            </a>
            <button
              class="nav-btn"
              title=${this._dark ? 'Switch to light mode' : 'Switch to dark mode'}
              @click=${this._toggleTheme}
            >
              ${this._dark
                ? html`<jh-icon-sun size="small"></jh-icon-sun>`
                : html`<jh-icon-moon-stars size="small"></jh-icon-moon-stars>`}
            </button>
          </div>
        </div>
        <div
          class="content ${this._inspect ? 'inspecting' : ''}"
          @toggle-inspect=${this._toggleInspect}
        >
          ${this._updateAvailable
            ? html`
              <jh-notification
                type="alert"
                appearance="neutral"
                @jh-dismiss=${() => { this._updateAvailable = false }}
              >
                A new version of the design system is available. Restart the dev server whenever it's convenient to pick it up.
                <jh-button
                  slot="jh-notification-action"
                  appearance="secondary"
                  size="small"
                  label=${aiActionLabel(getAiTool())}
                  @click=${this._openUpdatePrompt}
                ></jh-button>
              </jh-notification>
            `
            : ''}
          <proto-onboarding-dialog
            .open=${this._showOnboarding}
            @close=${() => { this._showOnboarding = false }}
          ></proto-onboarding-dialog>
          ${protoMatch
            ? html`<proto-shell .designer=${protoMatch[1]} .name=${protoMatch[2]} .inspecting=${this._inspect}></proto-shell>`
            : isSettings
            ? html`
              <jh-platform-header title="Settings"></jh-platform-header>
              <proto-settings class="gallery-scroll"></proto-settings>
            `
            : isFeatures
            ? html`
              <jh-platform-header title="Features"></jh-platform-header>
              <proto-features class="gallery-scroll"></proto-features>
            `
            : templateViewMatch
            ? html`<proto-template-shell class="gallery-scroll" .name=${templateViewMatch[1]} .inspecting=${this._inspect}></proto-template-shell>`
            : html`
              <jh-platform-header
                title="JH Prototype Playground"
                .navItems=${isResources ? resourcesNavItems : []}
              ></jh-platform-header>
              ${isResources
                ? html`<proto-resources class="gallery-scroll" .page=${resourcesPage}></proto-resources>`
                : isTemplatesList
                ? html`<proto-templates class="gallery-scroll"></proto-templates>`
                : html`<proto-gallery class="gallery-scroll"></proto-gallery>`
              }
            `
          }
        </div>
        <proto-inspector ?active=${this._inspect}></proto-inspector>
      </div>
    `
  }
}
