import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-icons/icons-wc/icon-crosshairs.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import type { TemplateMeta } from './proto-card.js'
import { runAiPrompt } from '../utils/ai-deeplink.js'

@customElement('proto-template-shell')
export class ProtoTemplateShell extends LitElement {
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

  @property() name = ''
  @property({ type: Boolean }) inspecting = false

  @state() private _loading = true
  @state() private _error = ''
  @state() private _copied = false
  @state() private _actionOutcome: 'opened' | 'copied' = 'copied'

  private _containerRef = createRef<HTMLDivElement>()
  private _templateEl: Element | null = null
  private _loadedKey = ''

  private _templateModules = import.meta.glob('../templates/**/index.ts') as Record<
    string,
    () => Promise<{ default: CustomElementConstructor }>
  >

  private _metaModules = import.meta.glob('../templates/**/meta.ts', { eager: true }) as Record<
    string,
    { meta: TemplateMeta }
  >

  private get _meta(): TemplateMeta | undefined {
    const key = `../templates/${this.name}/meta.ts`
    return this._metaModules[key]?.meta
  }

  private async _loadTemplate(name: string) {
    const key = `../templates/${name}/index.ts`
    if (this._loadedKey === key) return
    this._loadedKey = key

    try {
      if (!this._templateModules[key]) {
        this._error = `Template "${name}" not found.`
        this._loading = false
        return
      }

      const mod = await this._templateModules[key]()
      const tagName = `template-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')

      if (!customElements.get(tagName)) {
        customElements.define(tagName, mod.default)
      }

      this._templateEl = document.createElement(tagName)
      this._loading = false
    } catch (err) {
      this._error = `Failed to load template: ${err}`
      this._loading = false
    }
  }

  private async _useTemplate() {
    const meta = this._meta
    if (!meta) return

    const prompt = `I want to create a new prototype in the JH Prototype Playground based on the "${meta.title}" template.\n\n${meta.description}\n\nPlease run /new-prototype to get started.`

    this._actionOutcome = await runAiPrompt(prompt)
    this._copied = true
    setTimeout(() => { this._copied = false }, 2000)
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('name') && this.name) {
      this._loading = true
      this._error = ''
      this._templateEl = null
      this._loadedKey = ''
      this._loadTemplate(this.name)
    }

    if (!this._loading && !this._error && this._templateEl && this._containerRef.value) {
      const container = this._containerRef.value
      if (!container.contains(this._templateEl)) {
        container.replaceChildren(this._templateEl)
      }
    }
  }

  render() {
    return html`
      <jh-platform-header title=${this._meta?.title ?? this.name} .navItems=${this._meta?.navItems ?? []}>
        <div slot="header-right" class="header-actions">
          <jh-button
            appearance=${this.inspecting ? 'primary' : 'secondary'}
            size="small"
            accessible-label=${this.inspecting ? 'Turn off inspect mode' : 'Inspect components (hover to identify)'}
            @click=${() => this.dispatchEvent(new CustomEvent('toggle-inspect', { bubbles: true, composed: true }))}
          >
            <jh-icon-crosshairs slot="jh-button-icon-left" size="small"></jh-icon-crosshairs>
          </jh-button>
          <jh-button
            appearance="secondary"
            size="small"
            label="← Templates"
            @click=${() => { window.location.hash = '#/templates' }}
          ></jh-button>
          <jh-button
            appearance="primary"
            size="small"
            label=${this._copied ? (this._actionOutcome === 'opened' ? 'Opened!' : 'Copied!') : 'Use template'}
            @click=${this._useTemplate}
          ></jh-button>
        </div>
      </jh-platform-header>

      <div class="proto-area">
        ${this._loading ? html`
          <div class="loading">Loading template…</div>
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
