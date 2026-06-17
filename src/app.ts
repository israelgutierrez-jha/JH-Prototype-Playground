import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/proto-gallery.js'
import './components/proto-resources.js'
import './components/proto-settings.js'
import './components/proto-templates.js'
import './components/proto-template-shell.js'
import './components/proto-shell.js'
import '@jkhy/platform-tools/components/jh-platform-nav.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import '@jack-henry/jh-icons/icons-wc/icon-house.js'
import '@jack-henry/jh-icons/icons-wc/icon-gear.js'
import '@jack-henry/jh-icons/icons-wc/icon-sun.js'
import '@jack-henry/jh-icons/icons-wc/icon-moon-stars.js'

const GALLERY_NAV_ITEMS = [
  { label: 'Prototypes', path: '#/' },
  { label: 'Templates', path: '#/templates' },
  { label: 'Resources', path: '#/resources' },
]

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

    .theme-toggle {
      position: absolute;
      bottom: 18px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-btn {
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

    .theme-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      --jh-icon-color-fill: rgba(255, 255, 255, 1);
    }

    .content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--jh-color-container-page);
    }

    jh-platform-header {
      --jh-platform-header-horizontal-padding: 28px;
    }

    proto-gallery.gallery-scroll,
    proto-resources.gallery-scroll,
    proto-settings.gallery-scroll,
    proto-templates.gallery-scroll,
    proto-template-shell.gallery-scroll {
      flex: 1;
      overflow: auto;
    }
  `

  @state() private _dark = true

  private _toggleTheme() {
    this._dark = !this._dark
    document.documentElement.classList.toggle('jh-theme-dark', this._dark)
  }

  @state() private _hash = window.location.hash

  private _onHashChange = () => {
    this._hash = window.location.hash
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('hashchange', this._onHashChange)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('hashchange', this._onHashChange)
  }

  render() {
    const hash = this._hash || '#/'
    const protoMatch = hash.match(/^#\/prototypes\/([^/]+)\/(.+)$/)
    const templateViewMatch = hash.match(/^#\/templates\/(.+)$/)
    const isTemplatesList = hash === '#/templates'
    const isResources = hash === '#/resources'
    const isSettings = hash === '#/settings'

    return html`
      <div class="shell">
        <div class="nav-col">
          <jh-platform-nav .productsLoading=${true}></jh-platform-nav>
          <div class="nav-links">
            <a class="nav-link ${!isSettings ? 'active' : ''}" href="#/">
              <jh-icon-house size="small"></jh-icon-house>
            </a>
            <a class="nav-link ${isSettings ? 'active' : ''}" href="#/settings">
              <jh-icon-gear size="small"></jh-icon-gear>
            </a>
          </div>
          <div class="theme-toggle">
            <button
              class="theme-btn"
              title=${this._dark ? 'Switch to light mode' : 'Switch to dark mode'}
              @click=${this._toggleTheme}
            >
              ${this._dark
                ? html`<jh-icon-sun size="small"></jh-icon-sun>`
                : html`<jh-icon-moon-stars size="small"></jh-icon-moon-stars>`}
            </button>
          </div>
        </div>
        <div class="content">
          ${protoMatch
            ? html`<proto-shell .designer=${protoMatch[1]} .name=${protoMatch[2]}></proto-shell>`
            : isSettings
            ? html`
              <jh-platform-header title="Settings"></jh-platform-header>
              <proto-settings class="gallery-scroll"></proto-settings>
            `
            : templateViewMatch
            ? html`<proto-template-shell class="gallery-scroll" .name=${templateViewMatch[1]}></proto-template-shell>`
            : html`
              <jh-platform-header title="JH Prototype Playground" .navItems=${GALLERY_NAV_ITEMS}></jh-platform-header>
              ${isResources
                ? html`<proto-resources class="gallery-scroll"></proto-resources>`
                : isTemplatesList
                ? html`<proto-templates class="gallery-scroll"></proto-templates>`
                : html`<proto-gallery class="gallery-scroll"></proto-gallery>`
              }
            `
          }
        </div>
      </div>
    `
  }
}
