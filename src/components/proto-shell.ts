import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-icons/icons-wc/icon-pencil.js'
import '@jack-henry/jh-icons/icons-wc/icon-crosshairs.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import './proto-settings-dialog.js'
import './proto-password-gate.js'
import type { ProtoSettingsSavedDetail } from './proto-settings-dialog.js'
import type { PrototypeMeta } from './proto-card.js'
import { formatDesignerName } from '../utils/designer-profile.js'

const IS_EXTERNAL_BUILD = import.meta.env.VITE_EXTERNAL_BUILD === 'true'

@customElement('proto-shell')
export class ProtoShell extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      --jh-platform-header-vertical-padding: 12px;
      --jh-platform-header-horizontal-padding: 28px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .designer-badge {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .proto-area {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }

    /* Gives the mounted prototype element a definite height (not just
       auto/shrink-to-content), so a prototype can opt into height: 100%
       on its own :host for full-height layouts (e.g. a sidebar that
       reaches the bottom of the content area). Prototypes that don't
       need this are unaffected — overflow on .proto-area still scrolls
       content taller than the available space. */
    .proto-mount {
      flex: 1;
      min-height: 0;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-1200, 6rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .error-wrap {
      padding: var(--jh-dimension-400, 2rem);
    }
  `

  @property() designer = ''
  @property() name = ''
  @property({ type: Boolean }) inspecting = false

  @state() private _loading = true
  @state() private _error = ''
  @state() private _settingsOpen = false
  @state() private _titleOverride: string | null = null
  @state() private _descriptionOverride: string | null = null
  @state() private _publicOverride: boolean | null = null
  @state() private _hasPasswordOverride: boolean | null = null

  private _containerRef = createRef<HTMLDivElement>()
  private _protoEl: Element | null = null
  private _loadedKey = ''

  private _protoModules = import.meta.glob('../prototypes/**/index.ts') as Record<
    string,
    () => Promise<{ default: CustomElementConstructor }>
  >

  private _metaModules = import.meta.glob('../prototypes/**/meta.ts', { eager: true }) as Record<
    string,
    { meta: PrototypeMeta }
  >

  private get _protoMeta(): PrototypeMeta | undefined {
    const key = `../prototypes/${this.designer}/${this.name}/meta.ts`
    return this._metaModules[key]?.meta
  }

  private get _protoTitle(): string {
    return this._titleOverride ?? this._protoMeta?.title ?? this.name
  }

  private get _protoDescription(): string {
    return this._descriptionOverride ?? this._protoMeta?.description ?? ''
  }

  private get _protoPublic(): boolean {
    return this._publicOverride ?? this._protoMeta?.public ?? false
  }

  private get _protoHasPassword(): boolean {
    return this._hasPasswordOverride ?? !!this._protoMeta?.passwordHash
  }

  private async _loadPrototype(designer: string, name: string) {
    const key = `../prototypes/${designer}/${name}/index.ts`
    if (this._loadedKey === key) return
    this._loadedKey = key

    try {
      if (!this._protoModules[key]) {
        this._error = `Prototype "${designer}/${name}" not found.`
        this._loading = false
        return
      }

      const mod = await this._protoModules[key]()
      const tagName = `proto-${designer}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')

      if (!customElements.get(tagName)) {
        customElements.define(tagName, mod.default)
      }

      this._protoEl = document.createElement(tagName)
      this._loading = false
    } catch (err) {
      this._error = `Failed to load prototype: ${err}`
      this._loading = false
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('designer') || changed.has('name')) {
      if (this.designer && this.name) {
        this._loading = true
        this._error = ''
        this._protoEl = null
        this._loadedKey = ''
        this._titleOverride = null
        this._descriptionOverride = null
        this._publicOverride = null
        this._hasPasswordOverride = null
        this._loadPrototype(this.designer, this.name)
      }
    }

    if (!this._loading && !this._error && this._protoEl && this._containerRef.value) {
      const container = this._containerRef.value
      if (!container.contains(this._protoEl)) {
        container.replaceChildren(this._protoEl)
      }
    }
  }

  private _onSettingsSaved(e: CustomEvent<ProtoSettingsSavedDetail>) {
    this._titleOverride = e.detail.title
    this._descriptionOverride = e.detail.description
    this._publicOverride = e.detail.public
    this._hasPasswordOverride = e.detail.hasPassword
    this._settingsOpen = false
  }

  render() {
    return html`
      <jh-platform-header title=${this._protoTitle} .navItems=${this._protoMeta?.navItems ?? []}>
        <div slot="header-right" class="header-right">
          <span class="designer-badge">by ${formatDesignerName(this._protoMeta?.designerName || this.designer)}</span>
          ${IS_EXTERNAL_BUILD ? '' : html`
            <jh-button
              appearance="tertiary"
              size="small"
              accessible-label="Prototype settings"
              @click=${() => { this._settingsOpen = true }}
            >
              <jh-icon-pencil slot="jh-button-icon-left" size="small"></jh-icon-pencil>
            </jh-button>
            <jh-button
              appearance=${this.inspecting ? 'primary' : 'secondary'}
              size="small"
              accessible-label=${this.inspecting ? 'Turn off inspect mode' : 'Inspect components (hover to identify)'}
              @click=${() => this.dispatchEvent(new CustomEvent('toggle-inspect', { bubbles: true, composed: true }))}
            >
              <jh-icon-crosshairs slot="jh-button-icon-left" size="small"></jh-icon-crosshairs>
            </jh-button>
          `}
        </div>
      </jh-platform-header>

      <div class="proto-area">
        ${this._loading ? html`
          <div class="loading">Loading prototype…</div>
        ` : this._error ? html`
          <div class="error-wrap">
            <jh-notification type="alert" appearance="negative">${this._error}</jh-notification>
          </div>
        ` : html`
          <proto-password-gate
            .passwordHash=${this._protoMeta?.passwordHash ?? ''}
            unlockKey=${`proto:${this.designer}/${this.name}`}
            label="This prototype requires a password to view."
          >
            <div class="proto-mount" ${ref(this._containerRef)}></div>
          </proto-password-gate>
        `}
      </div>

      ${IS_EXTERNAL_BUILD ? '' : html`
        <proto-settings-dialog
          .open=${this._settingsOpen}
          .designer=${this.designer}
          .designerName=${this._protoMeta?.designerName ?? ''}
          .name=${this.name}
          .initialTitle=${this._protoTitle}
          .initialDescription=${this._protoDescription}
          .initialPublic=${this._protoPublic}
          .initialHasPassword=${this._protoHasPassword}
          @close=${() => { this._settingsOpen = false }}
          @saved=${this._onSettingsSaved}
        ></proto-settings-dialog>
      `}
    `
  }
}
