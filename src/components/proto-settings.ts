import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/input/input.js'
import { AI_TOOL_OPTIONS, type AiTool, getAiTool, setAiTool } from '../utils/ai-deeplink.js'
import { designerProfileReady, getDesignerName, setDesignerName } from '../utils/designer-profile.js'

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
  `

  // '' when unset/skipped so no option is pre-selected.
  @state() private _aiTool: string = getAiTool() ?? ''
  @state() private _name: string = getDesignerName() ?? ''

  connectedCallback() {
    super.connectedCallback()
    // Name comes from an async file read (see designer-profile.ts) that may
    // not have resolved yet when this component's field initializers ran —
    // pick up the real value once it has.
    designerProfileReady.then(() => {
      this._name = getDesignerName() ?? ''
    })
  }

  private _onAiToolChange(e: Event) {
    const value = (e.target as HTMLInputElement).value as AiTool
    this._aiTool = value ?? ''
    setAiTool(value)
  }

  private _onNameChange(e: CustomEvent<{ value: string }>) {
    this._name = e.detail.value
    setDesignerName(this._name.trim())
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
              .value=${this._name}
              @jh-input=${this._onNameChange}
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
              .value=${this._aiTool}
              @jh-change=${this._onAiToolChange}
            >
              ${AI_TOOL_OPTIONS.map(
                option => html`<jh-list-item value=${option.tool} label=${option.label}></jh-list-item>`
              )}
            </jh-select>
          </div>
        </jh-card>
      </div>
    `
  }
}
