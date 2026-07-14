import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-password/input-password.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/button/button.js'
import { AI_TOOL_OPTIONS, type AiTool, getAiTool, setAiTool } from '../utils/ai-deeplink.js'
import { designerProfileReady, getDesignerName, setDesignerName } from '../utils/designer-profile.js'
import { sha256Hex } from '../utils/password-hash.js'

@customElement('proto-settings')
export class ProtoSettings extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: var(--jh-dimension-600, 3rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-600, 3rem);
    }

    h1 {
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    jh-card {
      max-width: 480px;
    }

    .card-body {
      padding: var(--jh-dimension-400, 1rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .card-title {
      font-size: var(--jh-font-size-450, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .card-description {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
      margin: 0;
    }

    .card-actions {
      display: flex;
      gap: var(--jh-dimension-300, 0.75rem);
    }
  `

  // '' when unset/skipped so no option is pre-selected.
  @state() private _aiTool: string = getAiTool() ?? ''
  @state() private _name: string = getDesignerName() ?? ''
  @state() private _galleryPasswordDraft = ''
  @state() private _hasGalleryPassword = false
  @state() private _galleryPasswordSaved = false
  @state() private _galleryPasswordError = ''

  connectedCallback() {
    super.connectedCallback()
    // Name comes from an async file read (see designer-profile.ts) that may
    // not have resolved yet when this component's field initializers ran —
    // pick up the real value once it has.
    designerProfileReady.then(() => {
      this._name = getDesignerName() ?? ''
    })

    fetch('/__proto-api/external-access')
      .then(res => res.json())
      .then(data => { this._hasGalleryPassword = !!data.hasPassword })
      .catch(() => {})
  }

  private _onAiToolChange(e: Event) {
    const value = (e.target as HTMLInputElement).value as AiTool
    this._aiTool = value ?? ''
    setAiTool(value)
  }

  // No separate Save button on this page — commit on blur (jh-change)
  // rather than on every keystroke (jh-input), so a half-typed name never
  // hits the shared local file while they're still typing.
  private _onNameChange(e: CustomEvent<{ value: string }>) {
    this._name = e.detail.value
    setDesignerName(this._name.trim())
  }

  private async _saveGalleryPassword() {
    const trimmed = this._galleryPasswordDraft.trim()
    if (!trimmed) return
    this._galleryPasswordError = ''
    this._galleryPasswordSaved = false

    try {
      const passwordHash = await sha256Hex(trimmed)
      const res = await fetch('/__proto-api/external-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to save password.')
      this._hasGalleryPassword = result.hasPassword
      this._galleryPasswordDraft = ''
      this._galleryPasswordSaved = true
    } catch (err) {
      this._galleryPasswordError = err instanceof Error ? err.message : 'Failed to save password.'
    }
  }

  private async _removeGalleryPassword() {
    this._galleryPasswordError = ''
    this._galleryPasswordSaved = false
    try {
      const res = await fetch('/__proto-api/external-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash: '' }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to remove password.')
      this._hasGalleryPassword = false
      this._galleryPasswordDraft = ''
    } catch (err) {
      this._galleryPasswordError = err instanceof Error ? err.message : 'Failed to remove password.'
    }
  }

  render() {
    return html`
      <div class="container">
        <h1>Settings</h1>
        <jh-card>
          <div class="card-body">
            <h2 class="card-title">Name</h2>
            <p class="card-description">
              Used as your folder name for new prototypes, and to pre-fill forms like
              submitting a feature request or linking an external prototype.
            </p>
            <jh-input
              label="Your name"
              helper-text="e.g. John Doe"
              .value=${this._name}
              @jh-change=${this._onNameChange}
            ></jh-input>
          </div>
        </jh-card>
        <jh-card>
          <div class="card-body">
            <h2 class="card-title">AI Tool</h2>
            <p class="card-description">
              Which AI tool do you use for this playground? Prompt buttons throughout the
              gallery will open it directly with the prompt ready, instead of just copying
              it to your clipboard.
            </p>
            <jh-select
              label="AI tool"
              .options=${AI_TOOL_OPTIONS.map(o => ({ value: o.tool, label: o.label, selected: o.tool === this._aiTool }))}
              @jh-change=${this._onAiToolChange}
            ></jh-select>
          </div>
        </jh-card>
        <jh-card>
          <div class="card-body">
            <h2 class="card-title">External gallery password</h2>
            <p class="card-description">
              Shared password required to browse the restricted external gallery (the build shared
              with credit unions/stakeholders). Separate from each prototype's own password, set in
              that prototype's own settings.
            </p>
            ${this._galleryPasswordError
              ? html`<jh-notification type="alert" appearance="negative">${this._galleryPasswordError}</jh-notification>`
              : ''}
            ${this._galleryPasswordSaved
              ? html`<jh-notification type="success" appearance="positive">Password saved.</jh-notification>`
              : ''}
            <jh-input-password
              label="Gallery password"
              helper-text=${this._hasGalleryPassword
                ? 'A password is currently set — enter a new one to replace it.'
                : 'No password currently set — the external gallery is unlocked for anyone with the link.'}
              .value=${this._galleryPasswordDraft}
              @jh-input=${(e: CustomEvent<{ value: string }>) => { this._galleryPasswordDraft = e.detail.value }}
            ></jh-input-password>
            <div class="card-actions">
              <jh-button
                label="Save"
                appearance="primary"
                size="small"
                ?disabled=${!this._galleryPasswordDraft.trim()}
                @click=${this._saveGalleryPassword}
              ></jh-button>
              ${this._hasGalleryPassword
                ? html`
                  <jh-button
                    label="Remove password"
                    appearance="tertiary"
                    size="small"
                    @click=${this._removeGalleryPassword}
                  ></jh-button>
                `
                : ''}
            </div>
          </div>
        </jh-card>
      </div>
    `
  }
}
