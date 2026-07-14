import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/button/button.js'
import { AI_TOOL_OPTIONS, type AiTool, setAiTool } from '../utils/ai-deeplink.js'
import { getDesignerName, setDesignerName, setOnboarded } from '../utils/designer-profile.js'

@customElement('proto-onboarding-dialog')
export class ProtoOnboardingDialog extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    dialog {
      border: none;
      width: 480px;
      max-width: 100%;
      /* No max-height/overflow here on purpose: jh-select renders its
         (closed, invisible) dropdown menu as position:absolute with
         visibility:hidden rather than display:none, so it still occupies
         layout space below the visible content. With overflow:auto, that
         phantom space got counted as scrollable content, producing a
         scrollbar and clipped view even though nothing visible needed one.
         This dialog's content is small and fixed, so it's safe to just let
         it size naturally instead of guarding against overflow that never
         legitimately happens. */
      padding: 0;
      border-radius: var(--jh-border-radius-200, 12px);
      background: var(--jh-color-container-primary-enabled);
      color: var(--jh-color-content-primary-enabled);
      box-shadow: var(--jh-shadow-overlay);
    }

    dialog::backdrop {
      background: var(--jh-color-overlay, rgba(0, 0, 0, 0.7));
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

  private _dialogRef = createRef<HTMLDialogElement>()

  updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      if (this.open) {
        this._draftName = getDesignerName() ?? ''
        this._draftTool = ''
        this._dialogRef.value?.showModal()
      } else {
        this._dialogRef.value?.close()
      }
    }
  }

  // Escape just hides the dialog for this session — it'll ask again next
  // load. Only "Skip for now" permanently suppresses it. Native <dialog>'s
  // own 'close' event (fired by Escape or our .close() call below) is the
  // single source of truth for telling the parent we closed.
  private _dismiss() {
    this._dialogRef.value?.close()
  }

  private _onClose() {
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
    return html`
      <dialog ${ref(this._dialogRef)} aria-labelledby="proto-onboarding-heading" @close=${this._onClose}>
        <div class="dialog-inner">
          <h2 id="proto-onboarding-heading">Welcome to the JH Prototype Playground</h2>
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

          <jh-select
            label="AI tool"
            helper-text="Which AI tool will you be using?"
            .options=${AI_TOOL_OPTIONS.map(o => ({ value: o.tool, label: o.label }))}
            @jh-change=${(e: Event) => { this._draftTool = (e.target as HTMLInputElement).value }}
          ></jh-select>

          <div class="dialog-footer">
            <jh-button appearance="secondary" label="Skip for now" @click=${this._skip}></jh-button>
            <jh-button appearance="primary" label="Save" @click=${this._save}></jh-button>
          </div>
        </div>
      </dialog>
    `
  }
}
