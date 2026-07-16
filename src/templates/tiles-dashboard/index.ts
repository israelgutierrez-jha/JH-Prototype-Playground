import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-icons/icons-wc/icon-piggy-bank.js'
import '@jack-henry/jh-icons/icons-wc/icon-receipt-bills.js'
import '@jack-henry/jh-icons/icons-wc/icon-chart-bar.js'
import '@jack-henry/jh-icons/icons-wc/icon-users.js'
import '@jack-henry/jh-icons/icons-wc/icon-gear.js'

export default class TilesDashboard extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--jh-dimension-600, 1.5rem);
    }

    .section {
      margin-bottom: var(--jh-dimension-800, 2rem);
    }

    .section-heading {
      font-size: var(--jh-font-size-500, 1.25rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0 0 var(--jh-dimension-400, 1rem);
    }

    .tile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--jh-dimension-400, 1rem);
    }

    jh-card.tile {
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.15s ease;
    }

    jh-card.tile.selected {
      border-color: var(--jh-color-content-brand-enabled);
    }

    jh-card.tile:focus-visible {
      outline: 2px solid var(--jh-color-content-brand-enabled);
      outline-offset: 2px;
    }

    .tile-title {
      font-size: var(--jh-font-size-450, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: var(--jh-dimension-300, 0.75rem) 0 var(--jh-dimension-100, 0.25rem);
    }

    .tile-description {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
    }
  `

  @state() private _selected = ''

  private _selectTile(id: string) {
    this._selected = id
  }

  private _tile(id: string, title: string, description: string, icon: ReturnType<typeof html>) {
    return html`
      <jh-card
        class="tile ${this._selected === id ? 'selected' : ''}"
        padding="small"
        tabindex="0"
        @click=${() => this._selectTile(id)}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._selectTile(id) }}
      >
        ${icon}
        <div class="tile-title">${title}</div>
        <div class="tile-description">${description}</div>
      </jh-card>
    `
  }

  render() {
    return html`
      <div class="section">
        <h2 class="section-heading">Getting started</h2>
        <div class="tile-grid">
          ${this._tile('accounts', 'Accounts', 'View balances and account details', html`<jh-icon-piggy-bank size="medium"></jh-icon-piggy-bank>`)}
          ${this._tile('transfers', 'Transfers', 'Move funds between accounts', html`<jh-icon-receipt-bills size="medium"></jh-icon-receipt-bills>`)}
          ${this._tile('reports', 'Reports', 'Review activity and trends', html`<jh-icon-chart-bar size="medium"></jh-icon-chart-bar>`)}
        </div>
      </div>

      <div class="section">
        <h2 class="section-heading">Manage</h2>
        <div class="tile-grid">
          ${this._tile('members', 'Members', 'Search and manage member records', html`<jh-icon-users size="medium"></jh-icon-users>`)}
          ${this._tile('settings', 'Settings', 'Configure preferences', html`<jh-icon-gear size="medium"></jh-icon-gear>`)}
        </div>
      </div>
    `
  }
}
