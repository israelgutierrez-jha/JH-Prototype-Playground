import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/input-password/input-password.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import { sha256Hex } from '../utils/password-hash.js'

// Gates its default slot behind a password prompt. This is a client-side
// deterrent only — the passwordHash ships in the JS bundle, so it stops
// casual/search-engine access but not a technically determined visitor. See
// CLAUDE.md's "External / CU-facing gallery" section.
@customElement('proto-password-gate')
export class ProtoPasswordGate extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .wrap {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-600, 1.5rem);
    }

    .card {
      width: 360px;
      max-width: 100%;
    }

    .card-inner {
      padding: var(--jh-dimension-400, 1rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 1rem);
    }

    h2 {
      font-size: var(--jh-font-size-500, 1.25rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    p {
      font-size: var(--jh-font-size-400, 1rem);
      color: var(--jh-color-content-secondary-enabled);
      margin: 0;
    }
  `

  @property() label = 'This content is password protected.'
  @property() passwordHash = ''
  @property() unlockKey = ''

  @state() private _unlocked = false
  @state() private _value = ''
  @state() private _error = false
  @state() private _checking = false

  connectedCallback() {
    super.connectedCallback()
    if (this.passwordHash && this.unlockKey) {
      this._unlocked = sessionStorage.getItem(this.unlockKey) === this.passwordHash
    }
  }

  private async _submit() {
    if (this._checking) return
    this._checking = true
    const hash = await sha256Hex(this._value)
    this._checking = false

    if (hash === this.passwordHash) {
      sessionStorage.setItem(this.unlockKey, hash)
      this._unlocked = true
      this._error = false
    } else {
      this._error = true
    }
  }

  render() {
    if (!this.passwordHash || this._unlocked) {
      return html`<slot></slot>`
    }

    return html`
      <div class="wrap">
        <jh-card class="card">
          <div class="card-inner">
            <h2>Password required</h2>
            <p>${this.label}</p>
            ${this._error
              ? html`<jh-notification type="alert" appearance="negative">Incorrect password.</jh-notification>`
              : ''}
            <jh-input-password
              label="Password"
              .value=${this._value}
              @jh-input=${(e: CustomEvent<{ value: string }>) => { this._value = e.detail.value; this._error = false }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._submit() }}
            ></jh-input-password>
            <jh-button
              label="Continue"
              appearance="primary"
              ?pending=${this._checking}
              @click=${this._submit}
            ></jh-button>
          </div>
        </jh-card>
      </div>
    `
  }
}
