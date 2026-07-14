import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-telephone/input-telephone.js'
import '@jack-henry/jh-elements/components/input-email/input-email.js'
import '@jack-henry/jh-elements/components/checkbox/checkbox.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/progress/progress.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-icons/icons-wc/icon-viewfinder-id-card.js'
import '@jack-henry/jh-icons/icons-wc/icon-keyboard.js'
import '@jack-henry/jh-icons/icons-wc/icon-scanner-image.js'
import '@jack-henry/jh-icons/icons-wc/icon-file-eye.js'
import '@jack-henry/jh-icons/icons-wc/icon-magnifying-glass.js'
import '@jack-henry/jh-icons/icons-wc/icon-circle.js'
import '@jack-henry/jh-icons/icons-wc/icon-circle-checkmark-filled.js'
// No jh-elements dialog exists yet; jha-dialog (legacy @banno/jha-wc) is the sanctioned fallback,
// same pattern as jha-advanced-table for gaps in the current design system.
import '@banno/jha-wc/src/jha-dialog/jha-dialog.js'

type Step = 'start' | 'enterDetails' | 'matchDetails' | 'confirm' | 'override' | 'done'

type Fields = {
  fullLegalName: string
  membershipNumber: string
  ssn: string
  debitCard: string
  phone: string
  email: string
}

type Match = {
  id: string
  title: string
  subtitle: string
}

type IdentityRow = {
  label: string
  checked: boolean
}

const EMPTY_FIELDS: Fields = {
  fullLegalName: '',
  membershipNumber: '',
  ssn: '',
  debitCard: '',
  phone: '',
  email: '',
}

const SCANNED_FIELDS: Fields = {
  fullLegalName: 'Emma Marie Reed',
  membershipNumber: '',
  ssn: '4321',
  debitCard: '',
  phone: '',
  email: '',
}

const MATCHES: Match[] = [
  { id: 'ms-reed', title: 'Ms. Emma Reed', subtitle: 'Emma Marie Reed' },
  { id: 'mrs-reed', title: 'Mrs. Emma Reed', subtitle: 'Emma Clara Reed' },
]

const OVERRIDE_REASONS = [
  { value: 'known-member', label: 'Known member' },
  { value: 'manager-override', label: 'Manager override' },
  { value: 'unverifiable', label: 'Unverifiable' },
]

export default class MemberVerificationPrototype extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .layout {
      display: flex;
      align-items: stretch;
      height: 100%;
    }

    .form-panel {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 16px);
      width: 320px;
      flex-shrink: 0;
      border-right: 1px solid var(--jh-color-divider-primary, #e7e7e7);
      padding: var(--jh-dimension-600, 24px);
      overflow-y: auto;
    }

    .intro {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 4px);
    }

    .intro h1 {
      margin: 0;
      font-size: var(--jh-font-size-500, 20px);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .intro p {
      margin: 0;
      font-size: var(--jh-font-size-350, 14px);
      color: var(--jh-color-content-secondary-enabled, #5f5f5f);
      line-height: 1.5;
    }

    .intro .citation {
      color: var(--jh-color-content-brand-enabled, #085ce5);
    }

    .section-title {
      margin: 0;
      font-size: var(--jh-font-size-400, 16px);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .button-row {
      display: flex;
      gap: var(--jh-dimension-200, 8px);
    }

    .form-footer {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
      padding-top: var(--jh-dimension-400, 16px);
      border-top: 1px solid var(--jh-color-divider-primary, #e7e7e7);
    }

    .content {
      flex: 1;
      display: flex;
      min-width: 0;
      background: var(--jh-color-container-secondary-enabled, #f4f4f4);
      overflow: auto;
    }

    .empty-state {
      margin: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jh-dimension-400, 16px);
      max-width: 480px;
      text-align: center;
      padding: var(--jh-dimension-600, 24px);
    }

    .empty-state p {
      margin: 0;
      font-size: var(--jh-font-size-500, 20px);
      color: var(--jh-color-content-secondary-enabled, #636363);
    }

    .matches {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 16px);
      padding: var(--jh-dimension-600, 24px);
    }

    .results-area {
      flex: 1;
      min-width: 0;
      padding: var(--jh-dimension-600, 24px);
    }

    .results-area .identity-card {
      max-width: 720px;
    }

    .side-panel {
      width: 420px;
      flex-shrink: 0;
      border-left: 1px solid var(--jh-color-divider-primary, #e7e7e7);
      padding: var(--jh-dimension-600, 24px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-600, 24px);
    }

    .side-panel h2 {
      margin: 0;
      font-size: var(--jh-font-size-500, 20px);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .identity-rows {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 8px);
    }

    .identity-row {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 8px);
      font-size: var(--jh-font-size-350, 14px);
      flex-wrap: wrap;
    }

    .identity-row .row-label {
      width: 130px;
      flex-shrink: 0;
      white-space: nowrap;
      color: var(--jh-color-content-secondary-enabled, #636363);
    }

    .identity-row .row-value {
      font-weight: var(--jh-font-weight-semibold, 600);
      white-space: nowrap;
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .identity-row jh-icon-circle-checkmark-filled {
      color: var(--jh-color-content-positive-enabled, #1a7a3d);
    }

    .identity-row jh-icon-circle {
      color: var(--jh-color-content-secondary-enabled, #a0a0a0);
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-400, 16px);
      flex-wrap: wrap;
    }

    .card-footer-row jh-progress {
      flex: 1;
      min-width: 160px;
    }

    .summary-row {
      display: flex;
      gap: var(--jh-dimension-400, 16px);
      font-size: var(--jh-font-size-350, 14px);
    }

    .summary-row .row-label {
      color: var(--jh-color-content-secondary-enabled, #636363);
    }

    .summary-row .row-value {
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .side-panel-footer {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    jha-dialog {
      --jha-dialog-width: 420px;
    }
  `

  @state() private _step: Step = 'start'
  @state() private _fields: Fields = { ...EMPTY_FIELDS }
  @state() private _scanning = false
  @state() private _selectedMatch: Match | null = null
  @state() private _showSkipDialog = false
  @state() private _verifiedByRep = false
  @state() private _overrideReason = ''

  private get _identityRows(): IdentityRow[] {
    const nameChecked = !!this._fields.fullLegalName
    const ssnChecked = this._step !== 'enterDetails' && !!this._fields.ssn
    return [
      { label: 'ID #', checked: false },
      { label: 'Full legal name', checked: nameChecked },
      { label: 'Membership #', checked: false },
      { label: 'SSN (last 4)', checked: ssnChecked },
      { label: 'Date of birth', checked: false },
    ]
  }

  private get _verifiedCount(): number {
    return this._identityRows.filter(row => row.checked).length
  }

  private async _scanId() {
    this._scanning = true
    await new Promise(r => setTimeout(r, 1200))
    this._fields = { ...SCANNED_FIELDS }
    this._scanning = false
    this._step = 'enterDetails'
  }

  private _updateField(key: keyof Fields, value: string) {
    this._fields = { ...this._fields, [key]: value }
  }

  private _selectMatch(match: Match) {
    this._selectedMatch = match
    this._step = 'matchDetails'
  }

  private _denyMatch() {
    this._showSkipDialog = true
  }

  private _cancelSkip() {
    this._showSkipDialog = false
  }

  private _confirmSkip() {
    this._showSkipDialog = false
    this._verifiedByRep = false
    this._overrideReason = ''
    this._step = 'override'
  }

  private _advanceToConfirm() {
    this._verifiedByRep = false
    this._step = 'confirm'
  }

  private _completeVerification() {
    this._step = 'done'
  }

  private _clear() {
    this._step = 'start'
    this._fields = { ...EMPTY_FIELDS }
    this._scanning = false
    this._selectedMatch = null
    this._showSkipDialog = false
    this._verifiedByRep = false
    this._overrideReason = ''
  }

  private _renderFormPanel() {
    return html`
      <aside class="form-panel">
        <div class="intro">
          <h1>Member verification</h1>
          <p>
            Enter values provided by the person manually or by scanning a document.
            (Per <span class="citation">31 CFR 1020.220</span>)
          </p>
        </div>

        <h2 class="section-title">ID capture</h2>
        <div class="button-row">
          <jh-button
            label="Scan ID"
            appearance="secondary"
            size="small"
            ?pending=${this._scanning}
            @click=${this._scanId}
          >
            <jh-icon-viewfinder-id-card slot="jh-button-icon-left" size="small"></jh-icon-viewfinder-id-card>
          </jh-button>
          <jh-button label="Enter ID" appearance="secondary" size="small">
            <jh-icon-keyboard slot="jh-button-icon-left" size="small"></jh-icon-keyboard>
          </jh-button>
        </div>

        <jh-divider></jh-divider>

        <h2 class="section-title">Identifying information</h2>
        <div class="button-row">
          <jh-button label="Scan Document" appearance="secondary" size="small">
            <jh-icon-scanner-image slot="jh-button-icon-left" size="small"></jh-icon-scanner-image>
          </jh-button>
          <jh-button appearance="secondary" size="small" disabled accessible-label="View scanned document">
            <jh-icon-file-eye slot="jh-button-icon-left" size="small"></jh-icon-file-eye>
          </jh-button>
        </div>

        <jh-input
          label="Full legal name"
          size="small"
          maxlength="100"
          .value=${this._fields.fullLegalName}
          @jh-input=${(e: CustomEvent) => this._updateField('fullLegalName', e.detail.value)}
        ></jh-input>
        <jh-input
          label="Membership #"
          size="small"
          maxlength="100"
          .value=${this._fields.membershipNumber}
          @jh-input=${(e: CustomEvent) => this._updateField('membershipNumber', e.detail.value)}
        ></jh-input>
        <jh-input
          label="SSN"
          size="small"
          maxlength="100"
          .value=${this._fields.ssn}
          @jh-input=${(e: CustomEvent) => this._updateField('ssn', e.detail.value)}
        ></jh-input>
        <jh-input
          label="Debit card #"
          size="small"
          maxlength="100"
          .value=${this._fields.debitCard}
          @jh-input=${(e: CustomEvent) => this._updateField('debitCard', e.detail.value)}
        ></jh-input>

        <jh-divider></jh-divider>

        <h2 class="section-title">Supporting information</h2>
        <jh-input-telephone
          label="Phone #"
          size="small"
          .value=${this._fields.phone}
          @jh-input=${(e: CustomEvent) => this._updateField('phone', e.detail.value)}
        ></jh-input-telephone>
        <jh-input-email
          label="Email"
          size="small"
          .value=${this._fields.email}
          @jh-input=${(e: CustomEvent) => this._updateField('email', e.detail.value)}
        ></jh-input-email>

        <div class="form-footer">
          <jh-button label="Clear" appearance="secondary" size="small" @click=${this._clear}></jh-button>
        </div>
      </aside>
    `
  }

  private _renderEmptyState() {
    return html`
      <div class="empty-state">
        <jh-icon-magnifying-glass size="x-large"></jh-icon-magnifying-glass>
        <p>Enter or scan identifying information to see matching members and begin identity resolution.</p>
      </div>
    `
  }

  private _renderIdentityRows(nameValue: string) {
    return html`
      <div class="identity-rows">
        ${this._identityRows.map(row => html`
          <div class="identity-row">
            ${row.checked
              ? html`<jh-icon-circle-checkmark-filled size="small"></jh-icon-circle-checkmark-filled>`
              : html`<jh-icon-circle size="small"></jh-icon-circle>`}
            <span class="row-label">${row.label}</span>
            ${row.checked ? html`<span class="row-value">${row.label === 'Full legal name' ? nameValue : this._fields.ssn}</span>` : ''}
          </div>
        `)}
      </div>
    `
  }

  private _renderMatchList() {
    return html`
      <div class="matches">
        ${MATCHES.map(match => html`
          <jh-card header-title=${match.title} header-subtitle=${match.subtitle} show-footer-divider>
            ${this._renderIdentityRows(match.subtitle)}
            <div slot="jh-card-footer" class="card-footer-row">
              <jh-progress
                label="Verified"
                value=${this._verifiedCount}
                max="5"
                size="small"
              ></jh-progress>
              <jh-button label="Deny" appearance="secondary" size="small" @click=${this._denyMatch}></jh-button>
              <jh-button label="Next" appearance="primary" size="small" @click=${() => this._selectMatch(match)}></jh-button>
            </div>
          </jh-card>
        `)}
      </div>
    `
  }

  private _renderIdentityCard() {
    const match = this._selectedMatch!
    return html`
      <div class="results-area">
        <jh-card class="identity-card" header-title=${match.title} header-subtitle=${match.subtitle} show-footer-divider>
          ${this._renderIdentityRows(match.subtitle)}
          <div slot="jh-card-footer" class="card-footer-row">
            <jh-progress
              label="Verified"
              value=${this._verifiedCount}
              max="5"
              size="small"
            ></jh-progress>
            <jh-button label="Deny" appearance="secondary" size="small" @click=${this._denyMatch}></jh-button>
            <jh-button label="Next" appearance="primary" size="small" @click=${this._advanceToConfirm}></jh-button>
          </div>
        </jh-card>
      </div>
    `
  }

  private _renderMatchDetails() {
    return html`
      <div class="content">${this._renderIdentityCard()}</div>
      ${this._showSkipDialog ? this._renderSkipDialog() : ''}
    `
  }

  private _renderSkipDialog() {
    return html`
      <div class="dialog-overlay">
        <jha-dialog
          .heading=${'Verification not complete'}
          .messageBody=${'Would you like to continue without completing verification?'}
          .cancelLabel=${'Cancel'}
          .confirmLabel=${'Confirm'}
          @cancel=${this._cancelSkip}
          @confirm=${this._confirmSkip}
        ></jha-dialog>
      </div>
    `
  }

  private _renderConfirmPanel() {
    const match = this._selectedMatch!
    return html`
      <div class="content">
        ${this._renderIdentityCard()}
        <aside class="side-panel">
          <h2>Confirm verification</h2>

          <div>
            <div class="summary-row">
              <span class="row-label">Security questions</span>
            </div>
            <jh-progress label="Verified" value="2" max="2" size="small"></jh-progress>
          </div>

          <div>
            <div class="summary-row">
              <span class="row-label">One-time passcode</span>
            </div>
            <jh-progress label="Verified" value="1" max="1" size="small"></jh-progress>
          </div>

          <jh-card>
            <div class="summary-row">
              <span class="row-label">Full legal name</span>
              <span class="row-value">${match.subtitle} &bull; Validated</span>
            </div>
            <div class="summary-row">
              <span class="row-label">SSN (last 4)</span>
              <span class="row-value">${this._fields.ssn}</span>
            </div>
          </jh-card>

          <jh-checkbox
            label="I have verified the person's identity using the information above."
            ?checked=${this._verifiedByRep}
            @jh-change=${(e: CustomEvent) => { this._verifiedByRep = (e.target as HTMLInputElement).checked }}
          ></jh-checkbox>

          <div class="side-panel-footer">
            <jh-button
              label="Confirm"
              appearance="primary"
              size="small"
              ?disabled=${!this._verifiedByRep}
              @click=${this._completeVerification}
            ></jh-button>
          </div>
        </aside>
      </div>
    `
  }

  private _renderOverridePanel() {
    const match = this._selectedMatch!
    const canConfirm = this._verifiedByRep && !!this._overrideReason
    return html`
      <div class="content">
        ${this._renderIdentityCard()}
        <aside class="side-panel">
          <h2>Confirm verification</h2>

          <jh-card>
            <div class="summary-row">
              <span class="row-label">Full legal name</span>
              <span class="row-value">${match.subtitle} &bull; Validated</span>
            </div>
          </jh-card>

          <jh-checkbox
            label="I have verified the person's identity using the information above."
            ?checked=${this._verifiedByRep}
            @jh-change=${(e: CustomEvent) => { this._verifiedByRep = (e.target as HTMLInputElement).checked }}
          ></jh-checkbox>

          <jh-select
            label="Reason for override"
            required
            .options=${OVERRIDE_REASONS}
            @jh-change=${(e: CustomEvent) => { this._overrideReason = (e.target as HTMLInputElement).value }}
          ></jh-select>

          <div class="side-panel-footer">
            <jh-button
              label="Confirm"
              appearance="primary"
              size="small"
              ?disabled=${!canConfirm}
              @click=${this._completeVerification}
            ></jh-button>
          </div>
        </aside>
      </div>
    `
  }

  private _renderDone() {
    return html`
      <div class="content">
        <div class="empty-state">
          <jh-notification type="alert" appearance="positive">
            Identity confirmed for ${this._selectedMatch?.subtitle ?? 'the member'}.
          </jh-notification>
        </div>
      </div>
    `
  }

  render() {
    return html`
      <div class="layout">
        ${this._renderFormPanel()}
        ${this._step === 'start' || this._step === 'enterDetails'
          ? html`<div class="content">${this._step === 'start' ? this._renderEmptyState() : this._renderMatchList()}</div>`
          : ''}
        ${this._step === 'matchDetails' ? this._renderMatchDetails() : ''}
        ${this._step === 'confirm' ? this._renderConfirmPanel() : ''}
        ${this._step === 'override' ? this._renderOverridePanel() : ''}
        ${this._step === 'done' ? this._renderDone() : ''}
      </div>
    `
  }
}
