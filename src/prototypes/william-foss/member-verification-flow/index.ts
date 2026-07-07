import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-telephone/input-telephone.js'
import '@jack-henry/jh-elements/components/input-email/input-email.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-icons/icons-wc/icon-viewfinder-id-card.js'
import '@jack-henry/jh-icons/icons-wc/icon-keyboard.js'
import '@jack-henry/jh-icons/icons-wc/icon-scanner-image.js'
import '@jack-henry/jh-icons/icons-wc/icon-file-eye.js'
import '@jack-henry/jh-icons/icons-wc/icon-magnifying-glass.js'

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
  name: string
  detail: string
  membership: string
  confidence: string
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
  fullLegalName: 'Jordan A. Rivera',
  membershipNumber: 'M-0048213',
  ssn: '•••-••-4321',
  debitCard: '•••• •••• •• 7734',
  phone: '(555) 219-4487',
  email: 'jordan.rivera@example.com',
}

const MATCHES: Match[] = [
  {
    id: '1',
    name: 'Jordan A. Rivera',
    detail: 'Member since 2014 · Checking, Savings',
    membership: 'Membership #M-0048213',
    confidence: '98% match',
  },
  {
    id: '2',
    name: 'Jordan Rivera-Alvarez',
    detail: 'Member since 2019 · Checking',
    membership: 'Membership #M-0071940',
    confidence: '62% match',
  },
]

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase()
}

export default class MemberVerificationFlowPrototype extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .layout {
      display: flex;
      align-items: stretch;
      min-height: 640px;
      border: 1px solid var(--jh-color-divider-primary, #e7e7e7);
      background: var(--jh-color-container-primary-enabled, #ffffff);
    }

    .panel {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 320px;
      flex-shrink: 0;
      border-right: 1px solid var(--jh-color-divider-primary, #e7e7e7);
    }

    .panel-scroll {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 16px);
      padding: var(--jh-dimension-600, 24px);
      overflow-y: auto;
    }

    .intro {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 4px);
    }

    h1 {
      margin: 0;
      font-size: var(--jh-font-size-500, 20px);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .description {
      margin: 0;
      font-size: var(--jh-font-size-350, 14px);
      font-weight: var(--jh-font-weight-regular, 400);
      color: var(--jh-color-content-secondary-enabled, #5f5f5f);
      line-height: 1.5;
    }

    .citation {
      color: var(--jh-color-content-brand-enabled, #085ce5);
    }

    .section-title {
      margin: 0;
      font-size: var(--jh-font-size-400, 16px);
      font-weight: var(--jh-font-weight-bold, 700);
      color: var(--jh-color-content-primary-enabled, #2a2a2a);
    }

    .button-row {
      display: flex;
      gap: var(--jh-dimension-200, 8px);
    }

    .panel-footer {
      display: flex;
      justify-content: flex-end;
      padding: var(--jh-dimension-400, 16px) var(--jh-dimension-600, 24px);
      border-top: 1px solid var(--jh-color-divider-primary, #e7e7e7);
    }

    .results {
      flex: 1;
      display: flex;
      background: var(--jh-color-container-secondary-enabled, #f4f4f4);
      min-width: 0;
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
      font-weight: var(--jh-font-weight-regular, 400);
      color: var(--jh-color-content-secondary-enabled, #636363);
    }

    .results-content {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 16px);
      padding: var(--jh-dimension-600, 24px);
    }

    .match-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jh-color-container-secondary-selected, #ecf5fe);
      color: var(--jh-color-content-brand-enabled, #085ce5);
      font-size: var(--jh-font-size-350, 14px);
      font-weight: var(--jh-font-weight-bold, 700);
    }
  `

  @state() private _fields: Fields = { ...EMPTY_FIELDS }
  @state() private _scanning = false
  @state() private _hasResults = false
  @state() private _selectedMatchId: string | null = null

  private async _scanId() {
    this._scanning = true
    this._selectedMatchId = null
    await new Promise(r => setTimeout(r, 1500))
    this._fields = { ...SCANNED_FIELDS }
    this._scanning = false
    this._hasResults = true
  }

  private _focusName() {
    const input = this.renderRoot.querySelector('jh-input') as HTMLElement | null
    input?.focus()
  }

  private _updateField(key: keyof Fields, value: string) {
    this._fields = { ...this._fields, [key]: value }
  }

  private _selectMatch(id: string) {
    this._selectedMatchId = id
  }

  private _clear() {
    this._fields = { ...EMPTY_FIELDS }
    this._hasResults = false
    this._selectedMatchId = null
    this._scanning = false
  }

  private _renderEmptyState() {
    return html`
      <div class="empty-state">
        <jh-icon-magnifying-glass size="x-large"></jh-icon-magnifying-glass>
        <p>Enter or scan identifying information to see matching members and begin identity resolution.</p>
      </div>
    `
  }

  private _renderResults() {
    const selected = MATCHES.find(m => m.id === this._selectedMatchId)
    return html`
      <div class="results-content">
        <jh-list-group label="${MATCHES.length} possible matches">
          ${MATCHES.map(
            match => html`
              <jh-list-item
                primary-text=${match.name}
                secondary-text=${match.detail}
                primary-metadata=${match.confidence}
                secondary-metadata=${match.membership}
                ?selected=${this._selectedMatchId === match.id}
                show-divider
              >
                <div slot="jh-list-item-left" class="match-avatar">${initials(match.name)}</div>
                <jh-button
                  slot="jh-list-item-right"
                  label="Select"
                  appearance="secondary"
                  size="small"
                  @click=${() => this._selectMatch(match.id)}
                ></jh-button>
              </jh-list-item>
            `
          )}
        </jh-list-group>

        ${selected
          ? html`
              <jh-notification type="alert" appearance="positive">
                Identity confirmed for ${selected.name}.
              </jh-notification>
            `
          : ''}
      </div>
    `
  }

  render() {
    return html`
      <div class="layout">
        <aside class="panel">
          <div class="panel-scroll">
            <div class="intro">
              <h1>Member verification</h1>
              <p class="description">
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
              <jh-button label="Enter ID" appearance="secondary" size="small" @click=${this._focusName}>
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
              @jh-input=${(e: Event) => this._updateField('fullLegalName', (e.target as HTMLInputElement).value)}
            ></jh-input>
            <jh-input
              label="Membership #"
              size="small"
              maxlength="100"
              .value=${this._fields.membershipNumber}
              @jh-input=${(e: Event) => this._updateField('membershipNumber', (e.target as HTMLInputElement).value)}
            ></jh-input>
            <jh-input
              label="SSN"
              size="small"
              maxlength="100"
              .value=${this._fields.ssn}
              @jh-input=${(e: Event) => this._updateField('ssn', (e.target as HTMLInputElement).value)}
            ></jh-input>
            <jh-input
              label="Debit card #"
              size="small"
              maxlength="100"
              .value=${this._fields.debitCard}
              @jh-input=${(e: Event) => this._updateField('debitCard', (e.target as HTMLInputElement).value)}
            ></jh-input>

            <jh-divider></jh-divider>

            <h2 class="section-title">Supporting information</h2>
            <jh-input-telephone
              label="Phone #"
              size="small"
              .value=${this._fields.phone}
              @jh-input=${(e: Event) => this._updateField('phone', (e.target as HTMLInputElement).value)}
            ></jh-input-telephone>
            <jh-input-email
              label="Email"
              size="small"
              .value=${this._fields.email}
              @jh-input=${(e: Event) => this._updateField('email', (e.target as HTMLInputElement).value)}
            ></jh-input-email>
          </div>

          <div class="panel-footer">
            <jh-button label="Clear" appearance="secondary" size="small" @click=${this._clear}></jh-button>
          </div>
        </aside>

        <section class="results">${this._hasResults ? this._renderResults() : this._renderEmptyState()}</section>
      </div>
    `
  }
}
