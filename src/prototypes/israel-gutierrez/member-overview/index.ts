import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/tag/tag.js'

interface Account {
  id: string
  name: string
  last4: string
  balance: string
  type: 'checking' | 'savings' | 'money-market'
}

interface Transaction {
  id: string
  merchant: string
  amount: string
  credit: boolean
  date: string
  category: string
}

const ACCOUNTS: Account[] = [
  { id: 'chk', name: 'Checking', last4: '4821', balance: '$4,218.45', type: 'checking' },
  { id: 'sav', name: 'Savings', last4: '2934', balance: '$12,030.88', type: 'savings' },
  { id: 'mm', name: 'Money Market', last4: '7651', balance: '$8,500.00', type: 'money-market' },
]

const TRANSACTIONS: Transaction[] = [
  { id: 't1', merchant: 'Direct Deposit — Payroll', amount: '+$2,850.00', credit: true, date: 'Yesterday', category: 'Income' },
  { id: 't2', merchant: 'Starbucks Coffee', amount: '-$5.45', credit: false, date: 'Today', category: 'Food & Drink' },
  { id: 't3', merchant: 'Amazon.com', amount: '-$124.99', credit: false, date: 'Jun 14', category: 'Shopping' },
  { id: 't4', merchant: 'Netflix', amount: '-$15.99', credit: false, date: 'Jun 13', category: 'Entertainment' },
  { id: 't5', merchant: 'City Utilities', amount: '-$87.50', credit: false, date: 'Jun 12', category: 'Bills' },
  { id: 't6', merchant: 'Target', amount: '-$43.21', credit: false, date: 'Jun 11', category: 'Shopping' },
]

export default class MemberOverviewPrototype extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--jh-color-container-page);
    }

    /* ── Main layout ─────────────────────────────── */
    .dashboard {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--jh-dimension-500, 2.5rem) var(--jh-dimension-600, 3rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 2rem);
    }

    /* ── Account cards ───────────────────────────── */
    .accounts-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--jh-dimension-300, 1.5rem);
    }

    .account-card-inner {
      padding: var(--jh-dimension-400, 2rem);
      cursor: pointer;
      border-radius: inherit;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
      transition: outline 0.1s;
    }

    .account-card-inner:focus-visible {
      outline: 2px solid var(--jh-color-content-brand-enabled, #0057a8);
      outline-offset: -2px;
    }

    .account-card-inner.selected {
      background: var(--jh-color-container-surface-enabled, #f0f6ff);
    }

    .account-type-label {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .account-number {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      font-family: monospace;
    }

    .account-balance {
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-bold, 700);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
    }

    .account-balance.money-market {
      color: var(--jh-color-content-positive-enabled, #1a7a3c);
    }

    /* ── Quick actions ───────────────────────────── */
    .section-title {
      font-size: var(--jh-font-size-200, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      margin: 0 0 var(--jh-dimension-300, 1.5rem);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--jh-dimension-200, 1rem);
    }

    .action-tile {
      padding: var(--jh-dimension-400, 2rem) var(--jh-dimension-200, 1rem);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jh-dimension-200, 1rem);
      cursor: pointer;
      border-radius: var(--jh-border-radius-100, 8px);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--jh-color-container-surface-enabled, #e8f0fb);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .action-label {
      font-size: var(--jh-font-size-100, 0.875rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-brand-enabled, #0057a8);
      text-align: center;
    }

    /* ── Two-column layout ───────────────────────── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--jh-dimension-400, 2rem);
      align-items: start;
    }

    /* ── Transactions ────────────────────────────── */
    .card-inner {
      padding: var(--jh-dimension-400, 2rem);
    }

    .transaction-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--jh-dimension-200, 1rem) 0;
      border-bottom: 1px solid var(--jh-color-divider-primary);
    }

    .transaction-row:last-child {
      border-bottom: none;
    }

    .transaction-left {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-50, 0.25rem);
    }

    .transaction-merchant {
      font-size: var(--jh-font-size-200, 1rem);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      font-weight: var(--jh-font-weight-regular, 400);
    }

    .transaction-meta {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-100, 0.5rem);
    }

    .transaction-date {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .transaction-amount {
      font-size: var(--jh-font-size-200, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
    }

    .transaction-amount.credit {
      color: var(--jh-color-content-positive-enabled, #1a7a3c);
    }

    .transaction-amount.debit {
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
    }

    /* ── Alerts panel ────────────────────────────── */
    .alerts-stack {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: var(--jh-dimension-200, 1rem);
      padding: var(--jh-dimension-300, 1.5rem);
      background: var(--jh-color-container-primary-enabled);
      border-radius: var(--jh-border-radius-100, 8px);
      border-left: 4px solid var(--jh-color-content-warning-enabled, #b45309);
    }

    .alert-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .alert-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-50, 0.25rem);
    }

    .alert-title {
      font-size: var(--jh-font-size-200, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
    }

    .alert-message {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
      line-height: 1.4;
    }

    /* ── Action feedback ─────────────────────────── */
    .action-feedback {
      margin-top: var(--jh-dimension-200, 1rem);
    }
  `

  @state() private _selectedAccount: string | null = 'chk'
  @state() private _activeAction: string | null = null
  @state() private _alertDismissed = false

  private _getAccountClass(account: Account) {
    const classes = ['account-card-inner']
    if (this._selectedAccount === account.id) classes.push('selected')
    return classes.join(' ')
  }

  private _renderAccountCards() {
    return html`
      <div class="accounts-row">
        ${ACCOUNTS.map(acct => html`
          <jh-card>
            <div
              class=${this._getAccountClass(acct)}
              tabindex="0"
              @click=${() => { this._selectedAccount = acct.id; this._activeAction = null }}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (this._selectedAccount = acct.id)}
            >
              <div class="account-type-label">
                <span>${acct.name}</span>
                ${acct.type === 'checking' ? html`<jh-tag label="Primary"></jh-tag>` : ''}
              </div>
              <span class="account-number">···${acct.last4}</span>
              <span class="account-balance ${acct.type === 'money-market' ? 'money-market' : ''}">
                ${acct.balance}
              </span>
            </div>
          </jh-card>
        `)}
      </div>
    `
  }

  private _renderQuickActions() {
    const actions = [
      { id: 'transfer', icon: '↔', label: 'Transfer' },
      { id: 'pay', icon: '📄', label: 'Pay Bills' },
      { id: 'deposit', icon: '📱', label: 'Mobile Deposit' },
      { id: 'more', icon: '⋯', label: 'More' },
    ]

    return html`
      <jh-card>
        <div class="card-inner">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            ${actions.map(action => html`
              <div
                class="action-tile"
                tabindex="0"
                @click=${() => { this._activeAction = action.id }}
                @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (this._activeAction = action.id)}
              >
                <div class="action-icon">${action.icon}</div>
                <span class="action-label">${action.label}</span>
              </div>
            `)}
          </div>
          ${this._activeAction ? html`
            <div class="action-feedback">
              <jh-notification type="alert" appearance="neutral">
                ${this._activeAction === 'transfer' ? 'Transfer flow coming in the next prototype.' :
                  this._activeAction === 'pay' ? 'Bill Pay would open here.' :
                  this._activeAction === 'deposit' ? 'Mobile deposit camera capture would launch.' :
                  'Additional actions menu would appear.'}
              </jh-notification>
            </div>
          ` : ''}
        </div>
      </jh-card>
    `
  }

  private _renderTransactions() {
    return html`
      <jh-card>
        <div class="card-inner">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--jh-dimension-300, 1.5rem)">
            <h2 class="section-title" style="margin:0">Recent Transactions</h2>
            <jh-button label="View all" appearance="tertiary" size="small"></jh-button>
          </div>

          ${TRANSACTIONS.map(t => html`
            <div class="transaction-row">
              <div class="transaction-left">
                <span class="transaction-merchant">${t.merchant}</span>
                <div class="transaction-meta">
                  <span class="transaction-date">${t.date}</span>
                  <jh-tag label=${t.category}></jh-tag>
                </div>
              </div>
              <span class="transaction-amount ${t.credit ? 'credit' : 'debit'}">
                ${t.amount}
              </span>
            </div>
          `)}
        </div>
      </jh-card>
    `
  }

  private _renderAlerts() {
    if (this._alertDismissed) return html``

    return html`
      <jh-card>
        <div class="card-inner">
          <h2 class="section-title">Account Alerts</h2>
          <div class="alerts-stack">
            <div class="alert-item">
              <span class="alert-icon">⚠️</span>
              <div class="alert-body">
                <span class="alert-title">Low Balance Alert</span>
                <span class="alert-message">
                  Your Checking ···4821 balance is approaching your $5,000 threshold.
                  Consider transferring funds from Savings.
                </span>
              </div>
              <jh-button
                label="Dismiss"
                appearance="tertiary"
                size="small"
                @click=${() => { this._alertDismissed = true }}
              ></jh-button>
            </div>
          </div>
        </div>
      </jh-card>
    `
  }

  render() {
    const selected = ACCOUNTS.find(a => a.id === this._selectedAccount)

    return html`
      <div class="dashboard">
        ${this._renderAccountCards()}

        ${selected ? html`
          <div style="
            font-size: var(--jh-font-size-100, 0.875rem);
            color: var(--jh-color-content-secondary-enabled, #666);
            margin-top: calc(-1 * var(--jh-dimension-200, 1rem));
          ">
            Viewing ${selected.name} ···${selected.last4} — ${selected.balance} available
          </div>
        ` : ''}

        ${this._renderQuickActions()}

        <div class="two-col">
          ${this._renderTransactions()}
          ${this._renderAlerts()}
        </div>
      </div>
    `
  }
}
