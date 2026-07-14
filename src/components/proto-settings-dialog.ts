import { LitElement, html, css } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-elements/components/input-password/input-password.js'
import '@jack-henry/jh-elements/components/switch/switch.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-icons/icons-wc/icon-xmark.js'
import { formatDesignerName } from '../utils/designer-profile.js'
import { sha256Hex } from '../utils/password-hash.js'

export interface ProtoSettingsSavedDetail {
  title: string
  description: string
  public: boolean
  hasPassword: boolean
}

@customElement('proto-settings-dialog')
export class ProtoSettingsDialog extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: var(--jh-color-overlay, rgba(0, 0, 0, 0.7));
      z-index: var(--jh-z-index-positive-1000, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-400, 1rem);
    }

    .dialog {
      width: 480px;
      max-width: 100%;
      max-height: calc(100vh - var(--jh-dimension-1200, 3rem));
      overflow: auto;
      box-shadow: var(--jh-shadow-overlay);
      border-radius: var(--jh-border-radius-200, 12px);
    }

    .dialog-inner {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 1rem);
      padding: var(--jh-dimension-400, 1rem);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    h2 {
      font-size: var(--jh-font-size-500, 1.25rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .close-btn {
      appearance: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--jh-dimension-100, 0.25rem);
      display: flex;
      --jh-icon-color-fill: var(--jh-color-content-secondary-enabled);
      border-radius: var(--jh-border-radius-100, 6px);
    }

    .close-btn:hover {
      background: var(--jh-color-container-primary-hover, rgba(0, 0, 0, 0.06));
    }

    .designer-field {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-50, 2px);
    }

    .designer-label {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .designer-value {
      font-size: var(--jh-font-size-400, 1rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--jh-dimension-300, 0.75rem);
    }
  `

  @property({ type: Boolean }) open = false
  @property() designer = ''
  @property() designerName = ''
  @property() name = ''
  @property() initialTitle = ''
  @property() initialDescription = ''
  @property({ type: Boolean }) initialPublic = false
  @property({ type: Boolean }) initialHasPassword = false

  @state() private _draftTitle = ''
  @state() private _draftDescription = ''
  @state() private _draftPublic = false
  @state() private _draftPassword = ''
  @state() private _clearPassword = false
  @state() private _saving = false
  @state() private _error = ''

  @query('jh-input') private _titleInput?: HTMLElement

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._cancel()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('keydown', this._onKeyDown)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this._onKeyDown)
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      this._draftTitle = this.initialTitle
      this._draftDescription = this.initialDescription
      this._draftPublic = this.initialPublic
      this._draftPassword = ''
      this._clearPassword = false
      this._error = ''
      this._saving = false
      requestAnimationFrame(() => this._titleInput?.focus())
    }
  }

  private _cancel() {
    if (this._saving) return
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }))
  }

  private async _save() {
    if (!this._draftTitle.trim()) {
      this._error = 'Title cannot be empty.'
      return
    }
    this._saving = true
    this._error = ''

    try {
      const passwordHash = this._clearPassword
        ? ''
        : this._draftPassword.trim()
        ? await sha256Hex(this._draftPassword.trim())
        : undefined

      const res = await fetch('/__proto-api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designer: this.designer,
          name: this.name,
          title: this._draftTitle,
          description: this._draftDescription,
          public: this._draftPublic,
          ...(passwordHash !== undefined ? { passwordHash } : {}),
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'Failed to save changes.')
      }
      this.dispatchEvent(
        new CustomEvent<ProtoSettingsSavedDetail>('saved', {
          bubbles: true,
          composed: true,
          detail: {
            title: result.title,
            description: result.description,
            public: result.public,
            hasPassword: result.hasPassword,
          },
        })
      )
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Failed to save changes.'
    } finally {
      this._saving = false
    }
  }

  render() {
    if (!this.open) return html``

    return html`
      <div class="backdrop" @click=${this._cancel}>
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="proto-settings-heading" @click=${(e: Event) => e.stopPropagation()}>
          <jh-card>
            <div class="dialog-inner">
              <div class="dialog-header">
                <h2 id="proto-settings-heading">Prototype settings</h2>
                <button class="close-btn" aria-label="Close" @click=${this._cancel}>
                  <jh-icon-xmark size="small"></jh-icon-xmark>
                </button>
              </div>

              ${this._error
                ? html`<jh-notification type="alert" appearance="negative">${this._error}</jh-notification>`
                : ''}

              <jh-input
                label="Title"
                required
                .value=${this._draftTitle}
                @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftTitle = e.detail.value }}
              ></jh-input>

              <jh-input-textarea
                label="Description"
                .value=${this._draftDescription}
                @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftDescription = e.detail.value }}
              ></jh-input-textarea>

              <jh-switch
                label="Show in external (CU) gallery"
                helper-text="Only prototypes marked here are included in the restricted external build shared with credit unions/stakeholders."
                ?checked=${this._draftPublic}
                @jh-change=${(e: Event) => { this._draftPublic = (e.target as HTMLInputElement).checked }}
              ></jh-switch>

              <jh-input-password
                label="External access password"
                helper-text=${this.initialHasPassword && !this._clearPassword
                  ? 'A password is already set — leave blank to keep it.'
                  : 'Optional — required to view this prototype in the external build.'}
                .value=${this._draftPassword}
                @jh-input=${(e: CustomEvent<{ value: string }>) => {
                  this._draftPassword = e.detail.value
                  this._clearPassword = false
                }}
              ></jh-input-password>

              ${this.initialHasPassword && !this._clearPassword
                ? html`
                  <jh-button
                    appearance="tertiary"
                    size="small"
                    label="Remove password"
                    @click=${() => { this._clearPassword = true; this._draftPassword = '' }}
                  ></jh-button>
                `
                : ''}
              ${this._clearPassword
                ? html`<jh-notification type="info" appearance="neutral">Password will be removed on save.</jh-notification>`
                : ''}

              <div class="designer-field">
                <span class="designer-label">Designer</span>
                <span class="designer-value">${formatDesignerName(this.designerName || this.designer)}</span>
              </div>

              <div class="dialog-footer">
                <jh-button appearance="secondary" label="Cancel" ?disabled=${this._saving} @click=${this._cancel}></jh-button>
                <jh-button appearance="primary" label="Save" ?pending=${this._saving} @click=${this._save}></jh-button>
              </div>
            </div>
          </jh-card>
        </div>
      </div>
    `
  }
}
