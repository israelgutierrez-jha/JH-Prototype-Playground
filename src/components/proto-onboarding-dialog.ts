import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/button/button.js'
// No jh-elements dialog exists yet; jha-dialog (legacy @banno/jha-wc) is the sanctioned fallback,
// same pattern as jha-advanced-table for gaps in the current design system. It doesn't self-position
// as a modal, so we own the backdrop overlay (see CLAUDE.md's jha-dialog reference).
import '@banno/jha-wc/src/jha-dialog/jha-dialog.js'
import { AI_TOOL_OPTIONS, type AiTool, setAiTool } from '../utils/ai-deeplink.js'
import { getDesignerName, setDesignerName, setOnboarded } from '../utils/designer-profile.js'

@customElement('proto-onboarding-dialog')
export class ProtoOnboardingDialog extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--jh-z-index-positive-1000, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-400, 1rem);
    }

    jha-dialog {
      --jha-dialog-width: 480px;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 1rem);
    }

    p {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
      margin: 0;
    }

    footer {
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

  // Escape/close-icon just hide the dialog for this session — it'll ask
  // again next load. Only "Skip for now" permanently suppresses it.
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
      <div class="dialog-overlay">
        <jha-dialog heading="Welcome to the JH Prototype Playground" confirm-label="" hide-confirm @cancel=${this._dismiss}>
          <div slot="dialog-content" class="dialog-content">
            <p>
              Let's get a couple of quick questions out of the way now so you don't
              have to answer them again later.
            </p>

            <jh-input
              label="Your name"
              helper-text="e.g. John Doe"
              .value=${this._draftName}
              @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftName = e.detail.value }}
            ></jh-input>

            <!-- jh-select always renders its (closed, invisible) dropdown as an absolutely
                 positioned box, which jha-dialog's own hardcoded article overflow:auto style
                 picks up as scrollable content — producing a thin permanent scrollbar here.
                 Harmless (the real dropdown still opens and works) and not fixable from
                 outside either component's shadow DOM, so left as-is. -->
            <jh-select
              label="AI tool"
              helper-text="Which AI tool will you be using?"
              .options=${AI_TOOL_OPTIONS.map(o => ({ value: o.tool, label: o.label }))}
              @jh-change=${(e: Event) => { this._draftTool = (e.target as HTMLInputElement).value }}
            ></jh-select>

            <footer>
              <jh-button appearance="secondary" label="Skip for now" @click=${this._skip}></jh-button>
              <jh-button appearance="primary" label="Save" @click=${this._save}></jh-button>
            </footer>
          </div>
        </jha-dialog>
      </div>
    `
  }
}
