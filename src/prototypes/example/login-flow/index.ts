import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-email/input-email.js'
import '@jack-henry/jh-elements/components/input-password/input-password.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/divider/divider.js'

type Step = 'email' | 'password' | 'success'

export default class LoginFlowPrototype extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      padding-top: var(--jh-dimension-600, 3rem);
    }

    .card-content {
      padding: var(--jh-dimension-500, 2.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 2rem);
      width: 400px;
    }

    .logo-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jh-dimension-100, 0.5rem);
    }

    .logo-mark {
      width: 48px;
      height: 48px;
      background: var(--jh-color-content-brand-enabled, #0057a8);
      border-radius: var(--jh-border-radius-100, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
    }

    h1 {
      margin: 0;
      font-size: var(--jh-font-size-400, 1.25rem);
      font-weight: var(--jh-font-weight-bold, 700);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      text-align: center;
    }

    .subtitle {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
      text-align: center;
      margin: 0;
    }

    .fields {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1.5rem);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
    }

    .back-link {
      background: none;
      border: none;
      padding: 0;
      color: var(--jh-color-content-brand-enabled, #0057a8);
      font-size: var(--jh-font-size-100, 0.875rem);
      cursor: pointer;
      text-align: center;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: var(--jh-color-content-positive-enabled, #1a7a3c);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.75rem;
      margin: 0 auto;
    }
  `

  @state() private _step: Step = 'email'
  @state() private _email = ''
  @state() private _pending = false
  @state() private _error = ''

  private async _submitEmail() {
    const input = this.renderRoot.querySelector('jh-input-email') as HTMLInputElement | null
    const value = input?.value ?? ''
    if (!value || !value.includes('@')) {
      this._error = 'Please enter a valid email address.'
      return
    }
    this._error = ''
    this._email = value
    this._step = 'password'
  }

  private async _submitPassword() {
    const input = this.renderRoot.querySelector('jh-input-password') as HTMLInputElement | null
    const value = input?.value ?? ''
    if (!value || value.length < 4) {
      this._error = 'Password must be at least 4 characters.'
      return
    }
    this._error = ''
    this._pending = true

    await new Promise(r => setTimeout(r, 1500))

    this._pending = false
    this._step = 'success'
  }

  private _renderEmailStep() {
    return html`
      <div class="logo-area">
        <div class="logo-mark">JH</div>
        <h1>Sign in</h1>
        <p class="subtitle">Enter your email to continue</p>
      </div>

      ${this._error ? html`<jh-notification type="alert" appearance="negative">${this._error}</jh-notification>` : ''}

      <div class="fields">
        <jh-input-email
          label="Email address"
          placeholder="you@jackhenry.com"
          required
        ></jh-input-email>
      </div>

      <div class="actions">
        <jh-button
          label="Continue"
          appearance="primary"
          @click=${this._submitEmail}
        ></jh-button>
      </div>
    `
  }

  private _renderPasswordStep() {
    return html`
      <div class="logo-area">
        <div class="logo-mark">JH</div>
        <h1>Enter your password</h1>
        <p class="subtitle">${this._email}</p>
      </div>

      ${this._error ? html`<jh-notification type="alert" appearance="negative">${this._error}</jh-notification>` : ''}

      <div class="fields">
        <jh-input-password
          label="Password"
          placeholder="••••••••"
          required
        ></jh-input-password>
      </div>

      <div class="actions">
        <jh-button
          label="Sign in"
          appearance="primary"
          ?pending=${this._pending}
          @click=${this._submitPassword}
        ></jh-button>
        <button class="back-link" @click=${() => { this._step = 'email'; this._error = '' }}>
          Use a different email
        </button>
      </div>
    `
  }

  private _renderSuccess() {
    return html`
      <div class="success-icon">✓</div>
      <div class="logo-area">
        <h1>You're signed in!</h1>
        <p class="subtitle">Welcome back, ${this._email}</p>
      </div>
      <jh-divider></jh-divider>
      <div class="actions">
        <jh-button
          label="Start over"
          appearance="secondary"
          @click=${() => { this._step = 'email'; this._email = '' }}
        ></jh-button>
      </div>
    `
  }

  render() {
    return html`
      <jh-card>
        <div class="card-content">
          ${this._step === 'email' ? this._renderEmailStep() :
            this._step === 'password' ? this._renderPasswordStep() :
            this._renderSuccess()}
        </div>
      </jh-card>
    `
  }
}
