import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/button/button.js'
import { AI_TOOL_OPTIONS, type AiTool, setAiTool } from '../utils/ai-deeplink.js'
import { getDesignerName, setDesignerName, setOnboarded } from '../utils/designer-profile.js'

@customElement('proto-onboarding-dialog')
export class ProtoOnboardingDialog extends LitElement {
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

    h2 {
      font-size: var(--jh-font-size-500, 1.25rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    p {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--jh-dimension-300, 0.75rem);
    }
  `

  @property({ type: Boolean }) open = false

  @state() private _draftName = ''
  @state() private _draftTool: string = ''

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._dismiss()
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
      this._draftName = getDesignerName() ?? ''
      this._draftTool = ''
    }
  }

  // Escape/backdrop/close-icon just hide the dialog for this session — it'll
  // ask again next load. Only "Skip for now" permanently suppresses it.
  private _dismiss() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }))
  }

  private async _skip() {
    await setOnboarded(true)
    setAiTool('skip')
    this._dismiss()
  }

  private async _save() {
    await setDesignerName(this._draftName.trim())
    setAiTool((this._draftTool || null) as AiTool)
    await setOnboarded(true)
    this._dismiss()
  }

  render() {
    if (!this.open) return html``

    return html`
      <div class="backdrop" @click=${this._dismiss}>
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="proto-onboarding-heading" @click=${(e: Event) => e.stopPropagation()}>
          <jh-card>
            <div class="dialog-inner">
              <h2 id="proto-onboarding-heading">Welcome to the JH Prototype Playground</h2>
              <p>
                A couple of quick questions so prompts and forms throughout the gallery
                don't have to ask again.
              </p>

              <jh-input
                label="Your name"
                helper-text="Used as your folder name for new prototypes, e.g. jack-henry"
                .value=${this._draftName}
                @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftName = e.detail.value }}
              ></jh-input>

              <jh-select
                label="AI tool"
                helper-text="Which AI tool do you use for this playground?"
                .value=${this._draftTool}
                @jh-change=${(e: Event) => { this._draftTool = (e.target as HTMLInputElement).value }}
              >
                ${AI_TOOL_OPTIONS.map(
                  option => html`<jh-list-item value=${option.tool} label=${option.label}></jh-list-item>`
                )}
              </jh-select>

              <div class="dialog-footer">
                <jh-button appearance="secondary" label="Skip for now" @click=${this._skip}></jh-button>
                <jh-button appearance="primary" label="Save" @click=${this._save}></jh-button>
              </div>
            </div>
          </jh-card>
        </div>
      </div>
    `
  }
}
