import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/switch/switch.js'
import { AI_TOOL_OPTIONS, type AiTool, getAiTool, setAiTool } from '../utils/ai-deeplink.js'
import {
  designerProfileReady,
  getDesignerName,
  isBrowserVerificationEnabled,
  setBrowserVerificationEnabled,
  setDesignerName,
} from '../utils/designer-profile.js'

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
  @state() private _browserVerificationEnabled: boolean = isBrowserVerificationEnabled()

  connectedCallback() {
    super.connectedCallback()
    // Name and the verification flag come from an async file read (see
    // designer-profile.ts) that may not have resolved yet when this
    // component's field initializers ran — pick up the real values once it has.
    designerProfileReady.then(() => {
      this._name = getDesignerName() ?? ''
      this._browserVerificationEnabled = isBrowserVerificationEnabled()
    })
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

  private _onBrowserVerificationChange(e: Event) {
    this._browserVerificationEnabled = (e.target as HTMLInputElement).checked
    setBrowserVerificationEnabled(this._browserVerificationEnabled)
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
            <h2 class="card-title">Browser verification</h2>
            <p class="card-description">
              When making a UI change, your AI tool can drive a real browser (via the chrome-devtools MCP
              server) to click through the change and confirm it actually works, not just that it typechecks.
              This catches more, but costs real time and tokens per change — loading the tool, taking page
              snapshots, and reading back screenshots all add to the request. Off by default; when off, your
              AI tool will ask before using it rather than skip it silently.
            </p>
            <jh-switch
              label="Let my AI tool use browser automation for verification"
              helper-text="Off = it asks first each time. On = it can use it freely."
              ?checked=${this._browserVerificationEnabled}
              @jh-change=${this._onBrowserVerificationChange}
            ></jh-switch>
          </div>
        </jh-card>
      </div>
    `
  }
}
