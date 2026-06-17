import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import type { PrototypeMeta } from './proto-card.js'

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

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 1rem);
    }

    .designer-badge {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .proto-area {
      flex: 1;
      overflow: auto;
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

  @state() private _loading = true
  @state() private _error = ''

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
    return this._protoMeta?.title ?? this.name
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

  render() {
    return html`
      <jh-platform-header title=${this._protoTitle} .navItems=${this._protoMeta?.navItems ?? []}>
        <div slot="header-right" class="header-actions">
          <span class="designer-badge">by ${this.designer}</span>
          <jh-button
            appearance="secondary"
            size="small"
            label="← Gallery"
            @click=${() => { window.location.hash = '#/' }}
          ></jh-button>
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
          <div ${ref(this._containerRef)}></div>
        `}
      </div>
    `
  }
}
