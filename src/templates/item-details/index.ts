import { LitElement, html, css } from 'lit'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/button/button.js'

export default class ItemDetails extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--jh-dimension-600, 1.5rem);
    }

    .detail-card {
      max-width: 640px;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jh-dimension-400, 1rem);
      margin-bottom: var(--jh-dimension-400, 1rem);
    }

    .item-title {
      font-size: var(--jh-font-size-600, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .detail-section {
      padding: var(--jh-dimension-400, 1rem) 0;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .detail-row {
      display: flex;
      gap: var(--jh-dimension-400, 1rem);
    }

    .row-label {
      width: 160px;
      flex-shrink: 0;
      color: var(--jh-color-content-secondary-enabled);
    }

    .row-value {
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: var(--jh-dimension-300, 0.75rem);
      margin-top: var(--jh-dimension-400, 1rem);
    }
  `

  render() {
    return html`
      <jh-card class="detail-card" padding="medium">
        <div class="header-row">
          <h1 class="item-title">Jane Doe — Checking ···4821</h1>
          <jh-tag label="Active"></jh-tag>
        </div>

        <div class="detail-section">
          <div class="detail-row">
            <span class="row-label">Account number</span>
            <span class="row-value">•••• 4821</span>
          </div>
          <div class="detail-row">
            <span class="row-label">Account type</span>
            <span class="row-value">Checking</span>
          </div>
          <div class="detail-row">
            <span class="row-label">Opened</span>
            <span class="row-value">March 2021</span>
          </div>
        </div>

        <jh-divider></jh-divider>

        <div class="detail-section">
          <div class="detail-row">
            <span class="row-label">Current balance</span>
            <span class="row-value">$4,218.63</span>
          </div>
          <div class="detail-row">
            <span class="row-label">Available balance</span>
            <span class="row-value">$4,150.00</span>
          </div>
        </div>

        <div class="actions-row">
          <jh-button appearance="secondary" label="Edit" size="small"></jh-button>
          <jh-button appearance="primary" label="Transfer funds" size="small"></jh-button>
        </div>
      </jh-card>
    `
  }
}
